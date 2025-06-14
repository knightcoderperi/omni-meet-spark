
import { supabase } from '@/integrations/supabase/client';
import { advancedTaskExtractor } from './advancedTaskExtractor';

interface MeetingAnalysis {
  meeting_id: string;
  summary: string;
  key_decisions: string[];
  action_items: any[];
  participants: string[];
  next_meeting_date: string | null;
  task_breakdown: Record<string, number>;
  priority_distribution: Record<string, number>;
  estimated_completion_time: number;
}

export class EnhancedMeetingSummaryService {
  async generateComprehensiveSummary(meetingId: string): Promise<MeetingAnalysis> {
    try {
      console.log('Generating comprehensive meeting analysis for:', meetingId);

      // Get meeting data
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (meetingError || !meeting) {
        throw new Error('Meeting not found');
      }

      // Get transcript data
      const { data: transcripts, error: transcriptError } = await supabase
        .from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('start_time', { ascending: true });

      const fullTranscript = transcripts?.map(t => t.transcript_text).join(' ') || 'No transcript available';

      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId);

      if (participantsError) {
        throw new Error('Failed to fetch participants');
      }

      // Extract tasks using advanced extractor
      const extractedTasks = await advancedTaskExtractor.extractTasksFromMeeting(meetingId, fullTranscript);

      // Generate AI-powered meeting summary
      const summaryResponse = await this.generateAISummary(meeting, fullTranscript, extractedTasks, participants || []);

      // Create comprehensive analysis
      const analysis: MeetingAnalysis = {
        meeting_id: meetingId,
        summary: summaryResponse.summary,
        key_decisions: summaryResponse.key_decisions,
        action_items: extractedTasks,
        participants: participants?.map(p => p.guest_name || 'Unknown') || [],
        next_meeting_date: summaryResponse.next_meeting_date,
        task_breakdown: this.calculateTaskBreakdown(extractedTasks),
        priority_distribution: this.calculatePriorityDistribution(extractedTasks),
        estimated_completion_time: this.estimateCompletionTime(extractedTasks)
      };

      // Save analysis to database
      await this.saveAnalysisToDatabase(analysis);

      // Send task assignment emails
      await this.sendTaskAssignmentEmails(extractedTasks, meeting);

      return analysis;
    } catch (error) {
      console.error('Error generating comprehensive summary:', error);
      throw error;
    }
  }

  private async generateAISummary(meeting: any, transcript: string, tasks: any[], participants: any[]) {
    const response = await supabase.functions.invoke('generate-meeting-summary', {
      body: {
        meetingTitle: meeting.title,
        meetingDate: new Date(meeting.created_at).toLocaleDateString(),
        durationMinutes: meeting.duration_minutes || 60,
        attendeeNames: participants.map(p => p.guest_name || 'Unknown').join(', '),
        transcriptContent: transcript,
        extractedTasks: tasks
      }
    });

    if (response.error) {
      throw new Error(`Failed to generate AI summary: ${response.error.message}`);
    }

    return response.data.summary;
  }

  private calculateTaskBreakdown(tasks: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    tasks.forEach(task => {
      const person = task.assigned_to;
      breakdown[person] = (breakdown[person] || 0) + 1;
    });

    return breakdown;
  }

  private calculatePriorityDistribution(tasks: any[]): Record<string, number> {
    const distribution = { High: 0, Medium: 0, Low: 0 };
    
    tasks.forEach(task => {
      distribution[task.priority] = (distribution[task.priority] || 0) + 1;
    });

    return distribution;
  }

  private estimateCompletionTime(tasks: any[]): number {
    // Simple estimation based on task complexity and priority
    return tasks.reduce((total, task) => {
      const baseTime = task.description.length > 50 ? 4 : 2; // hours
      const priorityMultiplier = task.priority === 'High' ? 1.5 : task.priority === 'Low' ? 0.5 : 1;
      return total + (baseTime * priorityMultiplier);
    }, 0);
  }

  private async saveAnalysisToDatabase(analysis: MeetingAnalysis): Promise<void> {
    try {
      const { error } = await supabase
        .from('meeting_summaries')
        .insert({
          meeting_id: analysis.meeting_id,
          content: analysis.summary,
          summary_type: 'comprehensive_ai_analysis',
          key_points: analysis.key_decisions,
          decisions_made: analysis.key_decisions,
          next_steps: analysis.action_items.map(task => task.description),
          ai_confidence_score: 0.95
        });

      if (error) throw error;

      // Save meeting insights
      await supabase
        .from('ai_meeting_insights')
        .insert({
          meeting_id: analysis.meeting_id,
          insight_type: 'task_analysis',
          content: {
            task_breakdown: analysis.task_breakdown,
            priority_distribution: analysis.priority_distribution,
            estimated_completion_time: analysis.estimated_completion_time,
            total_tasks: analysis.action_items.length
          },
          confidence_score: 0.95
        });
    } catch (error) {
      console.error('Error saving analysis to database:', error);
      throw error;
    }
  }

  private async sendTaskAssignmentEmails(tasks: any[], meeting: any): Promise<void> {
    console.log('Preparing to send task assignment emails...');
    
    // Group tasks by assignee
    const tasksByPerson: Record<string, any[]> = {};
    tasks.forEach(task => {
      if (!tasksByPerson[task.assigned_to]) {
        tasksByPerson[task.assigned_to] = [];
      }
      tasksByPerson[task.assigned_to].push(task);
    });

    // Send emails for each person
    const emailPromises = Object.entries(tasksByPerson).map(async ([person, personTasks]) => {
      try {
        await supabase.functions.invoke('send-task-assignment-email', {
          body: {
            recipientName: person,
            recipientEmail: `${person.toLowerCase().replace(' ', '.')}@company.com`, // You'll need to implement proper email lookup
            meetingTitle: meeting.title,
            meetingDate: new Date(meeting.created_at).toLocaleDateString(),
            tasks: personTasks,
            meetingUrl: window.location.origin + `/meeting/${meeting.meeting_code}`
          }
        });
        console.log(`Task assignment email sent to ${person}`);
      } catch (error) {
        console.error(`Failed to send email to ${person}:`, error);
      }
    });

    await Promise.allSettled(emailPromises);
  }
}

export const enhancedMeetingSummaryService = new EnhancedMeetingSummaryService();
