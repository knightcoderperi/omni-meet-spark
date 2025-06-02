
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Languages, X, Send, Globe, Volume2, Copy,
  MessageSquare, Mic, MicOff, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TranslationChatProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface Translation {
  id: string;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  timestamp_seconds: number;
  confidence_score: number;
  created_at: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

const TranslationChat: React.FC<TranslationChatProps> = ({
  meetingId,
  isVisible,
  onClose
}) => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      fetchTranslations();
    }
  }, [isVisible, meetingId]);

  useEffect(() => {
    scrollToBottom();
  }, [translations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_translations')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch translations",
        variant: "destructive"
      });
    }
  };

  const translateText = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      // Simulate translation API call - in real implementation, this would call a translation service
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTranslations: { [key: string]: { [key: string]: string } } = {
        'en': {
          'es': 'Hola, ¿cómo estás?',
          'fr': 'Bonjour, comment allez-vous?',
          'de': 'Hallo, wie geht es dir?'
        },
        'es': {
          'en': 'Hello, how are you?',
          'fr': 'Bonjour, comment allez-vous?'
        }
      };

      const translatedText = mockTranslations[sourceLanguage]?.[targetLanguage] || 
        `[Translated from ${languages.find(l => l.code === sourceLanguage)?.name}]: ${inputText}`;

      const newTranslation = {
        meeting_id: meetingId,
        original_text: inputText,
        translated_text: translatedText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        timestamp_seconds: Date.now() / 1000,
        confidence_score: 0.95
      };

      const { data, error } = await supabase
        .from('meeting_translations')
        .insert(newTranslation)
        .select()
        .single();

      if (error) throw error;

      setTranslations(prev => [...prev, data]);
      setInputText('');
      
      toast({
        title: "Text Translated",
        description: `Translated from ${languages.find(l => l.code === sourceLanguage)?.name} to ${languages.find(l => l.code === targetLanguage)?.name}`,
      });
    } catch (error) {
      console.error('Error translating text:', error);
      toast({
        title: "Error",
        description: "Failed to translate text",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const startVoiceTranslation = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setInputText("This is a sample voice input that would be transcribed and translated");
      setIsListening(false);
      toast({
        title: "Voice Input Captured",
        description: "Speech has been converted to text for translation",
      });
    }, 3000);
  };

  const copyTranslation = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Translation copied to clipboard",
    });
  };

  const playAudio = (text: string, language: string) => {
    // Simulate text-to-speech
    toast({
      title: "Playing Audio",
      description: `Speaking text in ${languages.find(l => l.code === language)?.name}`,
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Translation Chatbot
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Real-time translation for seamless global communication
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-12rem)]">
          {/* Language Selection */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <motion.div
                className="text-slate-400"
                animate={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                →
              </motion.div>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Translation History */}
          <div className="flex-1 p-4 overflow-y-auto">
            {translations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  No Translations Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Start typing or use voice input to translate text
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {translations.map((translation) => (
                  <motion.div
                    key={translation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
                  >
                    {/* Original Text */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {languages.find(l => l.code === translation.source_language)?.name}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(translation.original_text, translation.source_language)}
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTranslation(translation.original_text)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {translation.original_text}
                      </p>
                    </div>

                    {/* Translated Text */}
                    <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                            {languages.find(l => l.code === translation.target_language)?.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(translation.confidence_score * 100)}% confidence
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(translation.translated_text, translation.target_language)}
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTranslation(translation.translated_text)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-900 dark:text-white font-medium">
                        {translation.translated_text}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceTranslation}
                disabled={isListening}
                className={`${isListening ? 'bg-red-500 text-white' : ''}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Input
                placeholder={`Type in ${languages.find(l => l.code === sourceLanguage)?.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && translateText()}
                className="flex-1"
                disabled={isListening}
              />
              
              <Button
                onClick={translateText}
                disabled={!inputText.trim() || isTranslating || isListening}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                {isTranslating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center"
              >
                <div className="flex items-center justify-center space-x-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Listening... Speak clearly</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TranslationChat;
