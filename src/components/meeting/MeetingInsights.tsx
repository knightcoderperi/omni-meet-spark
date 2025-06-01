
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Target, MessageSquare, TrendingUp, Users, 
  ChevronDown, ChevronRight, Clock, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAIFeatures } from '@/hooks/useAIFeatures';

interface MeetingInsightsProps {
  meetingId: string;
  isVisible: boolean;
}

const MeetingInsights: React.FC<MeetingInsightsProps> = ({
  meetingId,
  isVisible
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    action_items: true,
    key_topics: true,
    sentiment_analysis: false,
    participant_engagement: false
  });

  const { insights, fetchInsights } = useAIFeatures(meetingId);

  useEffect(() => {
    if (isVisible) {
      fetchInsights();
    }
  }, [isVisible, fetchInsights]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getInsightsByType = (type: string) => {
    return insights.filter(insight => insight.insight_type === type);
  };

  const insightSections = [
    {
      type: 'action_items',
      title: 'Action Items',
      icon: Target,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      type: 'key_topics',
      title: 'Key Topics',
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      type: 'sentiment_analysis',
      title: 'Sentiment Analysis',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      type: 'participant_engagement',
      title: 'Participant Engagement',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-20 left-4 w-80 max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden"
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <span>Meeting Insights</span>
            <Badge variant="secondary" className="ml-auto">
              {insights.length} insights
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="space-y-4">
            {insightSections.map((section) => {
              const IconComponent = section.icon;
              const sectionInsights = getInsightsByType(section.type);
              
              return (
                <Collapsible
                  key={section.type}
                  open={openSections[section.type]}
                  onOpenChange={() => toggleSection(section.type)}
                >
                  <CollapsibleTrigger asChild>
                    <div className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${section.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-5 h-5 ${section.color}`} />
                          <span className="font-medium text-slate-800 dark:text-white">
                            {section.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {sectionInsights.length}
                          </Badge>
                        </div>
                        {openSections[section.type] ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2 space-y-3">
                    {sectionInsights.length > 0 ? (
                      sectionInsights.map((insight) => (
                        <motion.div
                          key={insight.id}
                          className="ml-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge 
                              variant={insight.confidence_score > 0.8 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {Math.round(insight.confidence_score * 100)}% confidence
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(insight.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-slate-800 dark:text-white">
                            {typeof insight.content === 'object' ? (
                              <div className="space-y-2">
                                {Array.isArray(insight.content) ? (
                                  insight.content.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                      <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                    </div>
                                  ))
                                ) : (
                                  Object.entries(insight.content).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                                      <span className="text-slate-600 dark:text-slate-300">
                                        {typeof value === 'string' ? value : JSON.stringify(value)}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            ) : (
                              <p>{insight.content}</p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="ml-4 p-4 text-center text-slate-500">
                        <div className="flex flex-col items-center space-y-2">
                          <IconComponent className={`w-8 h-8 opacity-50 ${section.color}`} />
                          <span className="text-sm">No {section.title.toLowerCase()} detected yet</span>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
            
            {insights.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                  No Insights Yet
                </h3>
                <p className="text-sm text-slate-500">
                  AI insights will appear here as the meeting progresses
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MeetingInsights;
