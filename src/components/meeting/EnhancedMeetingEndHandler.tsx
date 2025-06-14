
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
        description: "Starting comprehensive analysis and task extraction...",
      });

      console.log('Starting enhanced meeting analysis for:', meetingId);

      // Generate comprehensive meeting analysis
      const analysis = await enhancedMeetingSummaryService.generateComprehensiveSummary(meetingId);

      console.log('Meeting analysis completed:', analysis);

      toast({
        title: "✅ Analysis Complete",
        description: `Generated ${analysis.action_items.length} tasks and sent email notifications to assignees`,
      });

      // Notify parent component of analysis completion
      onAnalysisComplete?.(analysis);
      onMeetingEnd?.();

      // Show detailed results in a follow-up toast
      setTimeout(() => {
        toast({
          title: "📊 Meeting Summary",
          description: `${analysis.action_items.length} tasks assigned across ${Object.keys(analysis.task_breakdown).length} people. Priority: ${analysis.priority_distribution.High} High, ${analysis.priority_distribution.Medium} Medium, ${analysis.priority_distribution.Low} Low`,
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
