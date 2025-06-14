
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Languages, Send, Loader2, Clock, TrendingUp, 
  Users, Target, ChevronDown, ChevronRight, Zap, History, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MeetingAudioProcessor from '@/services/meetingAudioProcessor';

interface AIAssistantPanelProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
  userJoinTime?: number;
}

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

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  meetingId,
  isVisible,
  onClose,
  userJoinTime = 0
}) => {
  const [activeTab, setActiveTab] = useState<'catchup' | 'translate'>('catchup');
  const [message, setMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<Array<{
    id: string;
    content: string;
    timestamp: Date;
    language: string;
    timeframe: string;
  }>>([]);
  const [audioProcessor] = useState(() => new MeetingAudioProcessor());
  const { toast } = useToast();
  
  const {
    conversations,
    isLoading,
    fetchConversations,
    sendAIMessage,
    generateCatchUp
  } = useAIFeatures(meetingId);

  useEffect(() => {
    if (isVisible) {
      fetchConversations();
      // Start audio processing for translations
      audioProcessor.startMeetingRecording();
    }

    return () => {
      audioProcessor.cleanup();
    };
  }, [isVisible, fetchConversations, audioProcessor]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await sendAIMessage(message, activeTab === 'catchup' ? 'catch_me_up' : 'intelligent_insights');
    setMessage('');
  };

  const handleGenerateCatchUp = async () => {
    await generateCatchUp(userJoinTime);
  };

  const handleTranslateTimeframe = async (timeframe: string) => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      let audioContent = '';
      let minutes = 0;
      
      if (timeframe.includes('minutes')) {
        const match = timeframe.match(/(\d+)/);
        minutes = match ? parseInt(match[1]) : 2;
        const { fullTranscript } = await audioProcessor.getTranscribedTimeframe(minutes);
        audioContent = fullTranscript;
      } else if (timeframe === 'entire') {
        const entireMeeting = audioProcessor.getEntireMeetingAudio();
        const transcriptionPromises = entireMeeting.chunks.map(chunk => 
          audioProcessor.transcribeAudio(chunk.audio)
        );
        const transcripts = await Promise.all(transcriptionPromises);
        audioContent = transcripts.join('\n\n');
      }

      if (!audioContent || audioContent.trim() === '' || audioContent.includes('No speech detected')) {
        toast({
          title: "No Content Found",
          description: `No spoken content found for the ${timeframe}`,
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('groq-translation', {
        body: {
          text: audioContent,
          targetLanguage: selectedLanguage,
          timeframe: timeframe,
          requestType: 'timeframe'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Translation failed');
      }

      const newTranslation = {
        id: Date.now().toString(),
        content: response.data?.translatedText || 'Translation completed but no content returned.',
        timestamp: new Date(),
        language: selectedLanguage,
        timeframe: timeframe
      };

      setTranslations(prev => [...prev, newTranslation]);
      
      toast({
        title: "Translation Complete",
        description: `Translated ${timeframe} to ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Failed to translate content",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const tabs = [
    { id: 'catchup', label: 'Catch Me Up', icon: Zap },
    { id: 'translate', label: 'Translate', icon: Languages }
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50"
        initial={{ x: 384 }}
        animate={{ x: 0 }}
        exit={{ x: 384 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                AI Assistant
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-3 px-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'catchup' && (
              <div className="h-full flex flex-col">
                <div className="p-4">
                  <Button
                    onClick={handleGenerateCatchUp}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Catch Me Up
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                    Get up to speed on meeting discussion
                  </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations
                    .filter(conv => conv.ai_feature_type === 'catch_me_up')
                    .map((conv) => (
                      <Card key={conv.id} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <History className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                  Catch Me Up Summary
                                </span>
                              </div>
                              {conv.response && (
                                <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                                  <div className="text-sm text-slate-800 dark:text-white whitespace-pre-wrap">
                                    {conv.response}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(conv.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {conversations.filter(conv => conv.ai_feature_type === 'catch_me_up').length === 0 && (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Click "Catch Me Up" to get a summary of what you've missed in the meeting
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about specific topics..."
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'translate' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Translate to:
                      </label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleTranslateTimeframe('last 2 minutes')}
                        disabled={isTranslating}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Last 2 min
                      </Button>
                      <Button
                        onClick={() => handleTranslateTimeframe('last 5 minutes')}
                        disabled={isTranslating}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Last 5 min
                      </Button>
                      <Button
                        onClick={() => handleTranslateTimeframe('last 10 minutes')}
                        disabled={isTranslating}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Last 10 min
                      </Button>
                      <Button
                        onClick={() => handleTranslateTimeframe('entire')}
                        disabled={isTranslating}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Entire meeting
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {translations.map((translation) => (
                    <Card key={translation.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <Languages className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {LANGUAGES.find(l => l.code === translation.language)?.flag} {LANGUAGES.find(l => l.code === translation.language)?.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {translation.timeframe}
                              </Badge>
                            </div>
                            <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                              <div className="text-sm text-slate-800 dark:text-white whitespace-pre-wrap">
                                {translation.content}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                              {translation.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {translations.length === 0 && (
                    <div className="text-center py-8">
                      <Languages className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Select a timeframe above to translate meeting content
                      </p>
                    </div>
                  )}
                  
                  {isTranslating && (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                      <p className="text-sm text-slate-500">Translating meeting content...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistantPanel;
