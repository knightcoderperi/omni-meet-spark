import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, X, Download, Sparkles, Clock, Users, Target,
  MessageSquare, TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartSummaryProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface Summary {
  id: string;
  summary_type: string;
  content: string;
  key_points: string[];
  decisions_made: string[];
  next_steps: string[];
  ai_confidence_score: number;
  created_at: string;
}

const SmartSummary: React.FC<SmartSummaryProps> = ({
  meetingId,
  isVisible,
  onClose
}) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Helper function to safely convert Json array to string array
  const jsonArrayToStringArray = (jsonArray: any): string[] => {
    if (!Array.isArray(jsonArray)) return [];
    return jsonArray.filter((item): item is string => typeof item === 'string');
  };

  useEffect(() => {
    if (isVisible) {
      fetchSummaries();
    }
  }, [isVisible, meetingId]);

  const fetchSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_summaries')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Summary interface
      const transformedSummaries: Summary[] = (data || []).map(item => ({
        id: item.id,
        summary_type: item.summary_type,
        content: item.content,
        key_points: jsonArrayToStringArray(item.key_points),
        decisions_made: jsonArrayToStringArray(item.decisions_made),
        next_steps: jsonArrayToStringArray(item.next_steps),
        ai_confidence_score: item.ai_confidence_score || 0,
        created_at: item.created_at || new Date().toISOString()
      }));
      
      setSummaries(transformedSummaries);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meeting summaries",
        variant: "destructive"
      });
    }
  };

  const generateSmartSummary = async () => {
    setGenerating(true);
    try {
      // Simulate AI processing - in real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockSummary = {
        meeting_id: meetingId,
        summary_type: 'smart_capsule',
        content: 'This meeting focused on quarterly planning and team alignment. Key discussions centered around resource allocation, timeline adjustments, and strategic priorities for the upcoming quarter.',
        key_points: [
          'Q4 budget approved with 15% increase for marketing',
          'New project timeline moved to January 2024',
          'Team restructuring to include two new positions',
          'Client feedback integration priority established'
        ],
        decisions_made: [
          'Approved hiring for Senior Developer role',
          'Decided to postpone feature X to Q1 2024',
          'Allocated additional budget for user research'
        ],
        next_steps: [
          'Schedule follow-up with stakeholders by Friday',
          'Create detailed project timeline by next week',
          'Begin recruitment process for new positions'
        ],
        ai_confidence_score: 0.92
      };

      const { data, error } = await supabase
        .from('meeting_summaries')
        .insert(mockSummary)
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match our Summary interface
      const transformedSummary: Summary = {
        id: data.id,
        summary_type: data.summary_type,
        content: data.content,
        key_points: jsonArrayToStringArray(data.key_points),
        decisions_made: jsonArrayToStringArray(data.decisions_made),
        next_steps: jsonArrayToStringArray(data.next_steps),
        ai_confidence_score: data.ai_confidence_score || 0,
        created_at: data.created_at || new Date().toISOString()
      };

      setSummaries(prev => [transformedSummary, ...prev]);
      
      toast({
        title: "Smart Summary Generated",
        description: "AI has analyzed the meeting and created a comprehensive summary",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate smart summary",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportSummary = (summary: Summary) => {
    const content = `
SMART MEETING SUMMARY
Generated: ${new Date(summary.created_at).toLocaleString()}
Confidence Score: ${Math.round(summary.ai_confidence_score * 100)}%

OVERVIEW
${summary.content}

KEY POINTS
${summary.key_points.map(point => `• ${point}`).join('\n')}

DECISIONS MADE
${summary.decisions_made.map(decision => `• ${decision}`).join('\n')}

NEXT STEPS
${summary.next_steps.map(step => `• ${step}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Summary Exported",
      description: "Meeting summary has been downloaded",
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
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Smart Capsule Summary
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  AI-powered meeting insights and key takeaways
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {summaries.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                No Summaries Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Generate an AI-powered smart summary of your meeting
              </p>
              <Button
                onClick={generateSmartSummary}
                disabled={generating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Smart Summary
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Meeting Summaries ({summaries.length})
                </h3>
                <Button
                  onClick={generateSmartSummary}
                  disabled={generating}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      New Summary
                    </>
                  )}
                </Button>
              </div>

              {summaries.map((summary) => (
                <Card key={summary.id} className="border border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          {summary.summary_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(summary.ai_confidence_score * 100)}% Confidence
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(summary.created_at).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportSummary(summary)}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
                        Summary
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {summary.content}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                          Key Points
                        </h4>
                        <ul className="space-y-1">
                          {summary.key_points.map((point, index) => (
                            <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-start">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                          Decisions Made
                        </h4>
                        <ul className="space-y-1">
                          {summary.decisions_made.map((decision, index) => (
                            <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-start">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              {decision}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-orange-500" />
                          Next Steps
                        </h4>
                        <ul className="space-y-1">
                          {summary.next_steps.map((step, index) => (
                            <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-start">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmartSummary;
