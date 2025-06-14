
import { supabase } from '@/integrations/supabase/client';

interface ExtractedTask {
  task_id: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string | null;
  status: 'Pending' | 'In Progress' | 'Completed';
  context: string;
  dependencies: string[];
  meeting_id: string;
  timestamp: string;
  confidence_score: number;
}

interface PersonMatch {
  name: string;
  email: string;
  variations: string[];
  role?: string;
}

export class AdvancedTaskExtractor {
  private taskPatterns = [
    /(\w+),?\s+(?:can you|could you|please)\s+(.+?)(?:\.|by|before)/gi,
    /(?:let's assign|assign)\s+(.+?)\s+to\s+(\w+)/gi,
    /(\w+)\s+will\s+(?:take care of|handle|do)\s+(.+?)(?:\.|by|before)/gi,
    /(?:by\s+(\w+(?:\s+\d+)?),?\s+)?(?:we need\s+)?(\w+)\s+to\s+(.+?)(?:\.|by|before)/gi,
    /(\w+)\s+is\s+responsible\s+for\s+(.+?)(?:\.|by|before)/gi,
    /action\s+item\s+for\s+(\w+):\s*(.+?)(?:\.|by|before)/gi,
    /(?:follow\s+up\s+with\s+)?(\w+)\s+(?:about|regarding)\s+(.+?)(?:\.|by|before)/gi,
  ];

  private urgencyKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'priority'];
  private deadlinePatterns = [
    /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /by\s+(today|tomorrow|next\s+week|end\s+of\s+week)/gi,
    /by\s+(\d{1,2}\/\d{1,2}\/?\d{0,4})/gi,
    /deadline\s+(\w+\s+\d+)/gi,
  ];

  async extractTasksFromMeeting(meetingId: string, transcript: string): Promise<ExtractedTask[]> {
    try {
      console.log('Starting advanced task extraction for meeting:', meetingId);
      
      // Get meeting participants for person matching
      const participants = await this.getMeetingParticipants(meetingId);
      
      // Extract raw tasks using patterns
      const rawTasks = this.extractRawTasks(transcript);
      
      // Process each task with AI enhancement
      const processedTasks = await Promise.all(
        rawTasks.map(task => this.processTaskWithAI(task, transcript, meetingId, participants))
      );

      // Filter out low-confidence tasks
      const validTasks = processedTasks.filter(task => task.confidence_score > 0.6);

      // Save tasks to database
      await this.saveTasksToDatabase(validTasks);

      console.log(`Extracted ${validTasks.length} high-confidence tasks`);
      return validTasks;
    } catch (error) {
      console.error('Error in advanced task extraction:', error);
      throw error;
    }
  }

  private extractRawTasks(transcript: string): Array<{person: string, task: string, context: string}> {
    const tasks: Array<{person: string, task: string, context: string}> = [];
    
    // Split transcript into sentences for better context
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);

    sentences.forEach(sentence => {
      this.taskPatterns.forEach(pattern => {
        const matches = [...sentence.matchAll(pattern)];
        matches.forEach(match => {
          if (match.length >= 3) {
            tasks.push({
              person: this.cleanPersonName(match[1] || match[2]),
              task: this.cleanTaskDescription(match[2] || match[3] || match[1]),
              context: sentence.trim()
            });
          }
        });
      });
    });

    return tasks;
  }

  private async processTaskWithAI(
    rawTask: {person: string, task: string, context: string}, 
    fullTranscript: string, 
    meetingId: string,
    participants: PersonMatch[]
  ): Promise<ExtractedTask> {
    // Enhanced processing using Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert task analyzer. Analyze the task and return a JSON response with the following structure:
            {
              "refined_description": "Clear, actionable task description",
              "assigned_person": "Exact person name",
              "assigner": "Who assigned the task",
              "priority": "High|Medium|Low",
              "deadline": "Extracted deadline or null",
              "confidence": 0.0-1.0,
              "dependencies": ["list of dependencies"],
              "task_type": "category of task"
            }`
          },
          {
            role: 'user',
            content: `Context: "${rawTask.context}"
            Raw task: "${rawTask.task}"
            Assigned to: "${rawTask.person}"
            Available participants: ${participants.map(p => p.name).join(', ')}
            
            Analyze this task and provide the structured response.`
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      // Fallback to manual processing
      parsedResponse = this.fallbackTaskProcessing(rawTask);
    }

    // Match person to participants
    const matchedPerson = this.matchPersonToParticipants(
      parsedResponse.assigned_person || rawTask.person, 
      participants
    );

    return {
      task_id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: parsedResponse.refined_description || rawTask.task,
      assigned_to: matchedPerson?.name || rawTask.person,
      assigned_by: parsedResponse.assigner || 'Meeting Host',
      priority: this.calculatePriority(rawTask.context, parsedResponse.priority),
      deadline: this.extractDeadline(rawTask.context),
      status: 'Pending',
      context: rawTask.context,
      dependencies: parsedResponse.dependencies || [],
      meeting_id: meetingId,
      timestamp: new Date().toISOString(),
      confidence_score: parsedResponse.confidence || 0.7
    };
  }

  private async getMeetingParticipants(meetingId: string): Promise<PersonMatch[]> {
    try {
      const { data: participants, error } = await supabase
        .from('meeting_participants')
        .select('guest_name, email, user_id')
        .eq('meeting_id', meetingId);

      if (error) throw error;

      return participants?.map(p => ({
        name: p.guest_name || 'Unknown',
        email: p.email || '',
        variations: this.generateNameVariations(p.guest_name || ''),
        role: undefined
      })) || [];
    } catch (error) {
      console.error('Error getting meeting participants:', error);
      return [];
    }
  }

  private generateNameVariations(fullName: string): string[] {
    const variations = [fullName];
    const parts = fullName.split(' ');
    
    if (parts.length > 1) {
      variations.push(parts[0]); // First name only
      variations.push(parts[parts.length - 1]); // Last name only
      variations.push(`${parts[0][0]}. ${parts[parts.length - 1]}`); // Initial + last name
    }
    
    return variations;
  }

  private matchPersonToParticipants(personName: string, participants: PersonMatch[]): PersonMatch | null {
    const cleanName = personName.toLowerCase().trim();
    
    for (const participant of participants) {
      const variations = participant.variations.map(v => v.toLowerCase());
      if (variations.some(variation => variation.includes(cleanName) || cleanName.includes(variation))) {
        return participant;
      }
    }
    
    return null;
  }

  private calculatePriority(context: string, aiPriority?: string): 'High' | 'Medium' | 'Low' {
    if (aiPriority && ['High', 'Medium', 'Low'].includes(aiPriority)) {
      return aiPriority as 'High' | 'Medium' | 'Low';
    }

    let score = 0;
    const lowerContext = context.toLowerCase();
    
    // Check for urgency keywords
    if (this.urgencyKeywords.some(keyword => lowerContext.includes(keyword))) {
      score += 50;
    }
    
    // Check for deadline indicators
    if (this.deadlinePatterns.some(pattern => pattern.test(context))) {
      score += 30;
    }
    
    // Check for authority indicators
    if (lowerContext.includes('ceo') || lowerContext.includes('manager') || lowerContext.includes('director')) {
      score += 20;
    }
    
    return score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
  }

  private extractDeadline(context: string): string | null {
    for (const pattern of this.deadlinePatterns) {
      const match = pattern.exec(context);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  private cleanPersonName(name: string): string {
    return name.trim().replace(/[,\.]/g, '').split(' ')[0];
  }

  private cleanTaskDescription(task: string): string {
    return task.trim().replace(/[,\.]*$/, '');
  }

  private fallbackTaskProcessing(rawTask: any) {
    return {
      refined_description: rawTask.task,
      assigned_person: rawTask.person,
      assigner: 'Unknown',
      priority: 'Medium',
      deadline: null,
      confidence: 0.6,
      dependencies: [],
      task_type: 'general'
    };
  }

  private async saveTasksToDatabase(tasks: ExtractedTask[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('action_items')
        .insert(tasks.map(task => ({
          meeting_id: task.meeting_id,
          title: task.description,
          description: task.context,
          assignee_id: null, // We'll need to match this to user IDs
          status: task.status.toLowerCase(),
          priority: task.priority.toLowerCase(),
          due_date: task.deadline ? new Date(task.deadline).toISOString() : null,
          ai_generated: true
        })));

      if (error) throw error;
    } catch (error) {
      console.error('Error saving tasks to database:', error);
      throw error;
    }
  }
}

export const advancedTaskExtractor = new AdvancedTaskExtractor();
