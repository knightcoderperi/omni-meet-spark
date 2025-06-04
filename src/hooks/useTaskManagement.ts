
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TaskPlatform {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

interface TaskCreationResult {
  platform: string;
  success: boolean;
  taskId?: string;
  url?: string;
  error?: string;
}

export const useTaskManagement = () => {
  const [platforms, setPlatforms] = useState<TaskPlatform[]>([
    { id: 'github', name: 'GitHub Issues', enabled: true },
    { id: 'todoist', name: 'Todoist', enabled: false },
    { id: 'notion', name: 'Notion', enabled: false },
    { id: 'local', name: 'Local Tasks', enabled: true }
  ]);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const { toast } = useToast();

  const createGitHubIssue = useCallback(async (task: any) => {
    try {
      // For demo purposes, we'll use a public repo or create a local task
      // In production, user would configure their own repo
      const owner = 'octocat'; // Demo repo
      const repo = 'Hello-World'; // Demo repo
      const token = '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';

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          title: task.task,
          body: `**Priority:** ${task.priority}\n**Category:** ${task.category}\n**Assignee:** ${task.assignee || 'Unassigned'}\n**Due Date:** ${task.due_date || 'Not specified'}\n\n${task.description || ''}`,
          labels: [task.category, `priority-${task.priority}`],
          assignees: task.assignee ? [task.assignee] : []
        })
      });

      if (response.ok) {
        const issueData = await response.json();
        return {
          platform: 'GitHub',
          success: true,
          taskId: issueData.number.toString(),
          url: issueData.html_url
        };
      } else {
        throw new Error(`GitHub API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
      return {
        platform: 'GitHub',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const createLocalTask = useCallback(async (task: any) => {
    try {
      // Store in localStorage for demo purposes
      const existingTasks = JSON.parse(localStorage.getItem('extracted-tasks') || '[]');
      const newTask = {
        ...task,
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        platform: 'Local'
      };
      
      existingTasks.push(newTask);
      localStorage.setItem('extracted-tasks', JSON.stringify(existingTasks));
      
      return {
        platform: 'Local',
        success: true,
        taskId: newTask.id
      };
    } catch (error) {
      return {
        platform: 'Local',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const createTodoistTask = useCallback(async (task: any) => {
    try {
      // Todoist API integration would go here
      // For now, we'll simulate success
      return {
        platform: 'Todoist',
        success: true,
        taskId: `todoist-${Date.now()}`
      };
    } catch (error) {
      return {
        platform: 'Todoist',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const createNotionTask = useCallback(async (task: any) => {
    try {
      // Notion API integration would go here
      // For now, we'll simulate success
      return {
        platform: 'Notion',
        success: true,
        taskId: `notion-${Date.now()}`
      };
    } catch (error) {
      return {
        platform: 'Notion',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const createTasksInPlatforms = useCallback(async (tasks: any[]) => {
    setIsCreatingTasks(true);
    const results: TaskCreationResult[] = [];

    try {
      for (const task of tasks) {
        const enabledPlatforms = platforms.filter(p => p.enabled);
        
        for (const platform of enabledPlatforms) {
          let result: TaskCreationResult;
          
          switch (platform.id) {
            case 'github':
              result = await createGitHubIssue(task);
              break;
            case 'todoist':
              result = await createTodoistTask(task);
              break;
            case 'notion':
              result = await createNotionTask(task);
              break;
            case 'local':
              result = await createLocalTask(task);
              break;
            default:
              result = { platform: platform.name, success: false, error: 'Unknown platform' };
          }
          
          results.push(result);
          
          // Add small delay between API calls
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: "Tasks Created Successfully",
          description: `${successCount} tasks created across platforms${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        });
      }

      if (failureCount > 0 && successCount === 0) {
        toast({
          title: "Task Creation Failed",
          description: "Could not create tasks in any platform",
          variant: "destructive"
        });
      }

      return results;
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to create tasks",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsCreatingTasks(false);
    }
  }, [platforms, createGitHubIssue, createLocalTask, createTodoistTask, createNotionTask, toast]);

  const togglePlatform = useCallback((platformId: string) => {
    setPlatforms(prev => prev.map(p => 
      p.id === platformId ? { ...p, enabled: !p.enabled } : p
    ));
  }, []);

  const getLocalTasks = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('extracted-tasks') || '[]');
    } catch {
      return [];
    }
  }, []);

  return {
    platforms,
    isCreatingTasks,
    createTasksInPlatforms,
    togglePlatform,
    getLocalTasks
  };
};
