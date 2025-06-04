
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExtractedTask {
  id: string;
  task: string;
  assignee: string | null;
  priority: 'high' | 'medium' | 'low';
  category: string;
  due_date: string | null;
  description?: string;
}

interface TaskExtractionOptions {
  maxTasks?: number;
  priorityFilter?: string[];
  categoryFilter?: string[];
}

export const useTaskExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const { toast } = useToast();

  const extractTasksFromTranscript = useCallback(async (
    transcript: string, 
    options: TaskExtractionOptions = {}
  ): Promise<ExtractedTask[]> => {
    if (!transcript || transcript.trim().length < 50) {
      toast({
        title: "Insufficient Content",
        description: "Please provide a longer transcript for better task extraction",
        variant: "destructive"
      });
      return [];
    }

    setIsExtracting(true);
    try {
      // Use the provided Groq API key
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
              content: `You are an expert task extraction AI. Extract actionable tasks from meeting transcripts.
              
              Rules:
              1. Only extract clear, actionable tasks (not general discussions)
              2. Identify assignees when mentioned explicitly
              3. Determine priority based on urgency indicators in text
              4. Categorize tasks appropriately
              5. Suggest realistic due dates based on context
              6. Return valid JSON only
              
              Response format:
              {
                "tasks": [
                  {
                    "task": "Clear action item description",
                    "assignee": "Person name or null",
                    "priority": "high|medium|low",
                    "category": "development|design|marketing|operations|planning|review",
                    "due_date": "YYYY-MM-DD or null",
                    "description": "Additional context if needed"
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: `Extract actionable tasks from this meeting transcript. Focus on clear action items, decisions, and follow-ups:\n\n${transcript}`
            }
          ],
          temperature: 0.2,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      let parsedTasks;
      try {
        parsedTasks = JSON.parse(aiResponse);
      } catch (parseError) {
        // Try to extract JSON from response if it's wrapped in markdown
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedTasks = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }

      const tasks = parsedTasks.tasks || [];
      
      // Process and validate tasks
      const processedTasks: ExtractedTask[] = tasks
        .filter((task: any) => task.task && task.task.trim().length > 0)
        .slice(0, options.maxTasks || 10)
        .map((task: any, index: number) => ({
          id: `extracted-${Date.now()}-${index}`,
          task: task.task.trim(),
          assignee: task.assignee && task.assignee !== 'null' ? task.assignee : null,
          priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
          category: task.category || 'planning',
          due_date: task.due_date && task.due_date !== 'null' ? task.due_date : null,
          description: task.description || null
        }));

      setExtractedTasks(processedTasks);
      
      toast({
        title: "Tasks Extracted Successfully",
        description: `Found ${processedTasks.length} actionable tasks from the transcript`,
      });

      return processedTasks;
    } catch (error) {
      console.error('Error extracting tasks:', error);
      toast({
        title: "Task Extraction Failed",
        description: "Could not extract tasks from transcript. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  const extractTasksFromMeetingContent = useCallback(async (meetingId: string) => {
    try {
      // In a real implementation, this would fetch meeting transcripts/notes
      const sampleTranscript = `
        Meeting Notes - Project Planning Session
        
        John mentioned we need to finalize the user interface designs by Friday.
        Sarah will review the backend API documentation and provide feedback by Wednesday.
        The marketing team needs to prepare campaign materials for the product launch.
        Mike agreed to set up the staging environment by end of week.
        We decided to schedule a follow-up meeting next Tuesday to review progress.
        Alice will coordinate with the external vendors for the integration work.
        The budget approval needs to be completed before we can proceed with development.
        Tom will update the project timeline and share it with stakeholders by Thursday.
      `;
      
      return await extractTasksFromTranscript(sampleTranscript);
    } catch (error) {
      console.error('Error extracting tasks from meeting:', error);
      return [];
    }
  }, [extractTasksFromTranscript]);

  return {
    isExtracting,
    extractedTasks,
    extractTasksFromTranscript,
    extractTasksFromMeetingContent,
    setExtractedTasks
  };
};
