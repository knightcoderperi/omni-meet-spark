import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Languages, X, Send, Globe, Volume2, Copy,
  MessageSquare, Mic, MicOff, Settings, Wand2, 
  RefreshCw, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TranslationService } from '@/services/translationService';

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
  const [autoDetect, setAutoDetect] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([
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
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      fetchTranslations();
      loadSupportedLanguages();
    }
  }, [isVisible, meetingId]);

  useEffect(() => {
    scrollToBottom();
  }, [translations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSupportedLanguages = async () => {
    try {
      const languages = await TranslationService.getSupportedLanguages();
      setSupportedLanguages(languages);
    } catch (error) {
      console.error('Failed to load supported languages:', error);
      // Keep default languages if API fails
    }
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
      let detectedSourceLang = sourceLanguage;
      
      // Auto-detect language if enabled
      if (autoDetect) {
        detectedSourceLang = await TranslationService.detectLanguage(inputText);
        console.log(`Auto-detected language: ${detectedSourceLang}`);
      }

      // Perform translation using real API
      const result = await TranslationService.translateText(
        inputText,
        detectedSourceLang,
        targetLanguage
      );

      const newTranslation = {
        meeting_id: meetingId,
        original_text: inputText,
        translated_text: result.translatedText,
        source_language: detectedSourceLang,
        target_language: targetLanguage,
        timestamp_seconds: Date.now() / 1000,
        confidence_score: result.confidence || 0.85
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
        title: "Translation Complete",
        description: `Translated from ${supportedLanguages.find(l => l.code === detectedSourceLang)?.name} to ${supportedLanguages.find(l => l.code === targetLanguage)?.name}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Failed to translate text",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const startVoiceTranslation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = sourceLanguage === 'zh' ? 'zh-CN' : sourceLanguage;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      
      toast({
        title: "Voice Input Captured",
        description: "Speech converted to text successfully",
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "Failed to capture speech. Please try again.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();

    // Fallback timeout
    setTimeout(() => {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      }
    }, 10000);
  };

  const copyTranslation = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Translation copied to clipboard",
    });
  };

  const playAudio = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'zh' ? 'zh-CN' : language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Playing Audio",
        description: `Speaking in ${supportedLanguages.find(l => l.code === language)?.name}`,
      });
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
    }
  };

  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    toast({
      title: "Languages Swapped",
      description: `Now translating from ${supportedLanguages.find(l => l.code === targetLanguage)?.name} to ${supportedLanguages.find(l => l.code === temp)?.name}`,
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
        {/* Header */}
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
                  Real-time translation powered by free APIs
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                LibreTranslate
              </Badge>
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
        </div>

        <div className="flex flex-col h-[calc(90vh-12rem)]">
          {/* Language Selection */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={autoDetect}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={swapLanguages}
                className="h-8 w-8 p-0"
                disabled={autoDetect}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoDetect(!autoDetect)}
                className={`text-xs ${autoDetect ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''}`}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Auto-detect source language
              </Button>
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
                          {supportedLanguages.find(l => l.code === translation.source_language)?.name}
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
                            {supportedLanguages.find(l => l.code === translation.target_language)?.name}
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
                placeholder={`Type in ${autoDetect ? 'any language' : supportedLanguages.find(l => l.code === sourceLanguage)?.name}...`}
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
            
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to translate • Click mic for voice input • Free translation via LibreTranslate
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TranslationChat;
