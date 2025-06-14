
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Copy, Volume2, X, Minimize2, Maximize2, 
  Globe, MessageSquare, Mic, MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MeetingAudioProcessor from '@/services/meetingAudioProcessor';
import { supabase } from '@/integrations/supabase/client';

interface TranslationChatWidgetProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  language?: string;
}

const PRESET_BUTTONS = [
  {
    id: 'last-2min',
    text: 'Last 2 minutes',
    icon: '⏰',
    prompt: 'Translate the last 2 minutes of the meeting'
  },
  {
    id: 'last-5min', 
    text: 'Last 5 minutes',
    icon: '⏱️',
    prompt: 'Translate the last 5 minutes of the meeting'
  },
  {
    id: 'last-10min',
    text: 'Last 10 minutes', 
    icon: '🕐',
    prompt: 'Translate the last 10 minutes of the meeting'
  },
  {
    id: 'entire-meeting',
    text: 'Entire meeting',
    icon: '📋',
    prompt: 'Translate the entire meeting'
  }
];

const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];

const TranslationChatWidget: React.FC<TranslationChatWidgetProps> = ({
  meetingId,
  isVisible,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [audioProcessor] = useState(() => new MeetingAudioProcessor());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: `Hello! I'm your AI translator. I can help you translate meeting content in real-time. Try asking:\n• "Translate the last 5 minutes to Spanish"\n• "What was discussed about the budget?"\n• Use the preset buttons for quick translations`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Start audio processing when component mounts
    audioProcessor.startMeetingRecording();

    return () => {
      audioProcessor.cleanup();
    };
  }, [audioProcessor]);

  useEffect(() => {
    // Handle real-time translation
    if (isRealTimeEnabled) {
      audioProcessor.startRealTimeCapture(async (audioBlob) => {
        try {
          const transcript = await audioProcessor.transcribeAudio(audioBlob);
          if (transcript && transcript.trim() && !transcript.includes('No speech detected')) {
            await translateRealTimeContent(transcript);
          }
        } catch (error) {
          console.error('Real-time translation error:', error);
        }
      });
    }
  }, [isRealTimeEnabled, selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const translateRealTimeContent = async (transcript: string) => {
    try {
      const response = await supabase.functions.invoke('groq-translation', {
        body: {
          text: transcript,
          targetLanguage: selectedLanguage,
          timeframe: 'real-time segment',
          requestType: 'realtime'
        }
      });

      if (response.data?.translatedText) {
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: `🔴 **Live Translation:** ${response.data.translatedText}`,
          timestamp: new Date(),
          language: selectedLanguage
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Real-time translation error:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await processTranslationRequest(message, selectedLanguage, meetingId);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        language: selectedLanguage
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Sorry, I encountered an error processing your translation request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = async (preset: typeof PRESET_BUTTONS[0]) => {
    const message = `${preset.prompt} to ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}`;
    await handleSendMessage(message);
  };

  const processTranslationRequest = async (
    message: string, 
    targetLanguage: string, 
    meetingId: string
  ): Promise<string> => {
    try {
      const timeRegex = /last (\d+) minutes?/i;
      const entireRegex = /entire meeting|whole meeting|full meeting/i;
      
      let audioContent = '';
      let timeframe = 'meeting segment';

      if (timeRegex.test(message)) {
        const minutes = parseInt(message.match(timeRegex)![1]);
        const { fullTranscript } = await audioProcessor.getTranscribedTimeframe(minutes);
        audioContent = fullTranscript;
        timeframe = `last ${minutes} minutes`;
      } else if (entireRegex.test(message)) {
        const entireMeeting = audioProcessor.getEntireMeetingAudio();
        const transcriptionPromises = entireMeeting.chunks.map(chunk => 
          audioProcessor.transcribeAudio(chunk.audio)
        );
        const transcripts = await Promise.all(transcriptionPromises);
        audioContent = transcripts.join('\n\n');
        timeframe = 'entire meeting';
      } else {
        // For custom queries, use last 5 minutes as default
        const { fullTranscript } = await audioProcessor.getTranscribedTimeframe(5);
        audioContent = fullTranscript;
        timeframe = 'recent discussion';
      }

      if (!audioContent || audioContent.trim() === '' || audioContent.includes('No speech detected')) {
        return `I couldn't find any spoken content for the ${timeframe}. Please make sure the meeting is active and people are speaking.`;
      }

      const response = await supabase.functions.invoke('groq-translation', {
        body: {
          text: audioContent,
          targetLanguage: targetLanguage,
          timeframe: timeframe,
          requestType: timeRegex.test(message) ? 'timeframe' : entireRegex.test(message) ? 'entire_meeting' : 'custom_query'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Translation failed');
      }

      return response.data?.translatedText || 'Translation completed but no content returned.';
    } catch (error) {
      console.error('Translation processing error:', error);
      throw error;
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard",
    });
  };

  const handlePlayAudio = (content: string, language: string) => {
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 50, y: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 50, y: 50 }}
        className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{
          width: isMinimized ? '300px' : '400px',
          height: isMinimized ? '60px' : '600px'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span className="font-semibold">AI Translator</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="bg-green-400 w-2 h-2 rounded-full animate-pulse"></div>
                <span className="text-xs">Live</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
                onClick={onClose}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col h-[536px]">
            {/* Language Selector */}
            <div className="p-3 border-b bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Translate to:
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preset Buttons */}
            <div className="p-3 border-b bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_BUTTONS.map(preset => (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetClick(preset)}
                    className="flex items-center space-x-2 p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Real-time Toggle */}
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRealTimeEnabled}
                    onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Real-time Translation</span>
                </label>
                {isRealTimeEnabled ? (
                  <Mic className="w-4 h-4 text-green-500" />
                ) : (
                  <MicOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map(message => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onCopy={handleCopyMessage}
                  onPlay={handlePlayAudio}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Ask me to translate any part of the meeting..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const ChatMessageComponent: React.FC<{
  message: ChatMessage;
  onCopy: (content: string) => void;
  onPlay: (content: string, language: string) => void;
}> = ({ message, onCopy, onPlay }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : isError 
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-gray-100 text-gray-800'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs opacity-75">
            {isUser ? '👤 You' : isError ? '⚠️ Error' : '🤖 AI Translator'}
          </span>
          <span className="text-xs opacity-75">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
        
        {!isUser && !isError && (
          <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onPlay(message.content, message.language || 'en')}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              Listen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onCopy(message.content)}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            {message.language && (
              <span className="text-xs opacity-75 ml-auto">
                {LANGUAGES.find(l => l.code === message.language)?.flag} {LANGUAGES.find(l => l.code === message.language)?.name}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

export default TranslationChatWidget;
