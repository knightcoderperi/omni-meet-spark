
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { meetingSummaryService } from '@/services/meetingSummaryService';

interface MeetingEndHandlerProps {
  meetingId: string;
  isActive: boolean;
  onMeetingEnd?: () => void;
}

const MeetingEndHandler: React.FC<MeetingEndHandlerProps> = ({
  meetingId,
  isActive,
  onMeetingEnd
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // When meeting becomes inactive (ends), trigger summary generation
    if (!isActive && meetingId) {
      handleMeetingEnd();
    }
  }, [isActive, meetingId]);

  const handleMeetingEnd = async () => {
    try {
      toast({
        title: "Meeting Ended",
        description: "Generating summary and sending emails to attendees...",
      });

      // Trigger the summary generation and email sending
      await meetingSummaryService.triggerSummaryForMeeting(meetingId);

      toast({
        title: "Summary Generated",
        description: "Meeting summary has been sent to all attendees",
      });

      onMeetingEnd?.();
    } catch (error) {
      console.error('Error handling meeting end:', error);
      toast({
        title: "Summary Failed",
        description: "Failed to generate meeting summary. Please try again.",
        variant: "destructive"
      });
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default MeetingEndHandler;
