
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { enhancedMeetingSummaryService } from '@/services/enhancedMeetingSummaryService';

interface EnhancedMeetingEndHandlerProps {
  meetingId: string;
  isActive: boolean;
  onMeetingEnd?: () => void;
  onAnalysisComplete?: (analysis: any) => void;
}

const EnhancedMeetingEndHandler: React.FC<EnhancedMeetingEndHandlerProps> = ({
  meetingId,
  isActive,
  onMeetingEnd,
  onAnalysisComplete
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive && meetingId) {
      handleMeetingEnd();
    }
  }, [isActive, meetingId]);

  const handleMeetingEnd = async () => {
    try {
      toast({
        title: "🎯 Meeting Ended",
        description: "Starting comprehensive analysis and sending personalized emails...",
      });

      console.log('Starting enhanced meeting analysis for:', meetingId);

      // Generate comprehensive meeting analysis
      const analysis = await enhancedMeetingSummaryService.generateComprehensiveSummary(meetingId);

      console.log('Meeting analysis completed:', analysis);

      // Send personalized emails to all participants
      await enhancedMeetingSummaryService.sendPersonalizedEmails(meetingId, analysis);

      toast({
        title: "✅ Analysis Complete",
        description: `Generated ${analysis.action_items.length} tasks and sent personalized email summaries to all participants`,
      });

      // Notify parent component of analysis completion
      onAnalysisComplete?.(analysis);
      onMeetingEnd?.();

      // Show detailed results in a follow-up toast
      setTimeout(() => {
        toast({
          title: "📊 Emails Sent",
          description: `Personalized meeting summaries and task assignments sent to ${Object.keys(analysis.task_breakdown).length} participants`,
        });
      }, 2000);

    } catch (error) {
      console.error('Error in enhanced meeting analysis:', error);
      toast({
        title: "❌ Analysis Failed",
        description: "Failed to complete meeting analysis. Please try again manually.",
        variant: "destructive"
      });
    }
  };

  return null;
};

export default EnhancedMeetingEndHandler;
