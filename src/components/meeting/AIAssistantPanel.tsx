
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Mic, MessageSquare, Send, Loader2, Clock, TrendingUp, 
  Users, Target, ChevronDown, ChevronRight, Zap, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useAIFeatures } from '@/hooks/useAIFeatures';

interface AIAssistantPanelProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
  userJoinTime?: number;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  meetingId,
  isVisible,
  onClose,
  userJoinTime = 0
}) => {
  const [activeTab, setActiveTab] = useState<'catchup' | 'transcription' | 'insights'>('catchup');
  const [message, setMessage] = useState('');
  const [isTranscriptionOpen, setIsTranscriptionOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const {
    conversations,
    insights,
    transcriptions,
    isLoading,
    fetchConversations,
    fetchInsights,
    fetchTranscriptions,
    sendAIMessage,
    generateCatchUp,
    getInsights
  } = useAIFeatures(meetingId);

  useEffect(() => {
    if (isVisible) {
      fetchConversations();
      fetchInsights();
      fetchTranscriptions();
    }
  }, [isVisible, fetchConversations, fetchInsights, fetchTranscriptions]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    await sendAIMessage(message, activeTab === 'catchup' ? 'catch_me_up' : 'intelligent_insights');
    setMessage('');
  };

  const handleGenerateCatchUp = async () => {
    await generateCatchUp(userJoinTime);
  };

  const tabs = [
    { id: 'catchup', label: 'Catch Me Up', icon: Zap },
    { id: 'transcription', label: 'Transcription', icon: Mic },
    { id: 'insights', label: 'Insights', icon: Brain }
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

            {activeTab === 'transcription' && (
              <div className="p-4 space-y-4 h-full overflow-y-auto">
                <Collapsible open={isTranscriptionOpen} onOpenChange={setIsTranscriptionOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center space-x-2">
                        <Mic className="w-4 h-4" />
                        <span>Real-time Transcription</span>
                        <Badge variant="secondary">{transcriptions.length}</Badge>
                      </div>
                      {isTranscriptionOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    {transcriptions.map((transcript) => (
                      <Card key={transcript.id} className="bg-slate-50 dark:bg-slate-800">
                        <CardContent className="p-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Mic className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-800 dark:text-white">
                                {transcript.transcript_text}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-500">
                                  {Math.floor(transcript.start_time)}s - {Math.floor(transcript.end_time)}s
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(transcript.confidence_score * 100)}% confidence
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {transcriptions.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No transcriptions available yet
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="h-full flex flex-col">
                <div className="p-4">
                  <Button
                    onClick={getInsights}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Analyze Meeting
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <Collapsible open={isInsightsOpen} onOpenChange={setIsInsightsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4" />
                          <span>Meeting Insights</span>
                          <Badge variant="secondary">{insights.length}</Badge>
                        </div>
                        {isInsightsOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3">
                      {insights.map((insight) => {
                        const getInsightIcon = (type: string) => {
                          switch (type) {
                            case 'action_items': return Target;
                            case 'key_topics': return MessageSquare;
                            case 'sentiment_analysis': return TrendingUp;
                            case 'participant_engagement': return Users;
                            default: return Brain;
                          }
                        };

                        const IconComponent = getInsightIcon(insight.insight_type);

                        return (
                          <Card key={insight.id} className="bg-slate-50 dark:bg-slate-800">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center space-x-2">
                                <IconComponent className="w-4 h-4 text-blue-500" />
                                <span className="capitalize">
                                  {insight.insight_type.replace('_', ' ')}
                                </span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {Math.round(insight.confidence_score * 100)}%
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="text-sm text-slate-600 dark:text-slate-300">
                                {typeof insight.content === 'object' ? (
                                  <pre className="whitespace-pre-wrap text-xs">
                                    {JSON.stringify(insight.content, null, 2)}
                                  </pre>
                                ) : (
                                  <p>{insight.content}</p>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(insight.created_at).toLocaleTimeString()}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {insights.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No insights generated yet
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {conversations
                    .filter(conv => conv.ai_feature_type === 'intelligent_insights')
                    .map((conv) => (
                      <Card key={conv.id} className="bg-slate-50 dark:bg-slate-800">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                {conv.message}
                              </p>
                              {conv.response && (
                                <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                                  <p className="text-sm text-slate-800 dark:text-white">
                                    {conv.response}
                                  </p>
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
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask for specific insights..."
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
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
