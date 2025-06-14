
import { supabase } from '@/integrations/supabase/client';

interface MeetingAttendee {
  id: string;
  email: string;
  name: string;
}

interface MeetingSummaryData {
  meetingId: string;
  title: string;
  date: string;
  duration: number;
  attendees: MeetingAttendee[];
  transcript: string;
}

export class MeetingSummaryService {
  async generateAndSendSummary(meetingData: MeetingSummaryData): Promise<void> {
    try {
      console.log('Generating meeting summary for:', meetingData.title);

      // First, generate the summary using Groq API
      const summary = await this.generateSummary(meetingData);
      
      // Save summary to database
      await this.saveSummary(meetingData.meetingId, summary);
      
      // Send emails to all attendees
      await this.sendSummaryEmails(meetingData, summary);
      
      console.log('Meeting summary process completed successfully');
    } catch (error) {
      console.error('Error in meeting summary process:', error);
      throw error;
    }
  }

  private async generateSummary(meetingData: MeetingSummaryData): Promise<any> {
    const response = await supabase.functions.invoke('generate-meeting-summary', {
      body: {
        meetingTitle: meetingData.title,
        meetingDate: meetingData.date,
        durationMinutes: meetingData.duration,
        attendeeNames: meetingData.attendees.map(a => a.name).join(', '),
        transcriptContent: meetingData.transcript
      }
    });

    if (response.error) {
      throw new Error(`Failed to generate summary: ${response.error.message}`);
    }

    return response.data;
  }

  private async saveSummary(meetingId: string, summary: any): Promise<void> {
    const { error } = await supabase
      .from('meeting_summaries')
      .insert({
        meeting_id: meetingId,
        content: summary.summary,
        summary_type: 'ai_generated',
        key_points: summary.key_discussion_points || [],
        decisions_made: summary.decisions_made || [],
        next_steps: summary.next_steps || [],
        ai_confidence_score: 0.95
      });

    if (error) {
      throw new Error(`Failed to save summary: ${error.message}`);
    }
  }

  private async sendSummaryEmails(meetingData: MeetingSummaryData, summary: any): Promise<void> {
    const emailPromises = meetingData.attendees.map(attendee => 
      this.sendEmailToAttendee(attendee, meetingData, summary)
    );

    await Promise.allSettled(emailPromises);
  }

  private async sendEmailToAttendee(
    attendee: MeetingAttendee, 
    meetingData: MeetingSummaryData, 
    summary: any
  ): Promise<void> {
    try {
      const response = await supabase.functions.invoke('send-meeting-summary-email', {
        body: {
          recipientEmail: attendee.email,
          recipientName: attendee.name,
          meetingTitle: meetingData.title,
          meetingDate: meetingData.date,
          duration: meetingData.duration,
          attendeeList: meetingData.attendees.map(a => a.name).join(', '),
          summary: summary
        }
      });

      if (response.error) {
        console.error(`Failed to send email to ${attendee.email}:`, response.error);
      } else {
        console.log(`Email sent successfully to ${attendee.email}`);
      }
    } catch (error) {
      console.error(`Error sending email to ${attendee.email}:`, error);
    }
  }

  async triggerSummaryForMeeting(meetingId: string): Promise<void> {
    try {
      // Get meeting data
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (meetingError || !meeting) {
        throw new Error('Meeting not found');
      }

      // Get attendees
      const { data: participants, error: participantsError } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId);

      if (participantsError) {
        throw new Error('Failed to fetch attendees');
      }

      // Get transcript data (simplified - in reality would get from audio processor)
      const { data: transcripts, error: transcriptError } = await supabase
        .from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('start_time', { ascending: true });

      const fullTranscript = transcripts?.map(t => t.transcript_text).join(' ') || 'No transcript available';

      const meetingData: MeetingSummaryData = {
        meetingId: meeting.id,
        title: meeting.title,
        date: new Date(meeting.created_at).toLocaleDateString(),
        duration: meeting.duration_minutes || 60,
        attendees: participants?.map(p => ({
          id: p.id,
          email: p.email || '',
          name: p.guest_name || 'Unknown'
        })) || [],
        transcript: fullTranscript
      };

      await this.generateAndSendSummary(meetingData);
    } catch (error) {
      console.error('Error triggering summary for meeting:', error);
      throw error;
    }
  }
}

export const meetingSummaryService = new MeetingSummaryService();
