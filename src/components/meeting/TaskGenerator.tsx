
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, X, Plus, Target, Calendar, User, Flag,
  CheckCircle, Clock, AlertTriangle, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskGeneratorProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  ai_generated: boolean;
  assignee_id: string | null;
  created_at: string;
}

const TaskGenerator: React.FC<TaskGeneratorProps> = ({
  meetingId,
  isVisible,
  onClose
}) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      fetchActionItems();
    }
  }, [isVisible, meetingId]);

  const fetchActionItems = async () => {
    try {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActionItems(data || []);
    } catch (error) {
      console.error('Error fetching action items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch action items",
        variant: "destructive"
      });
    }
  };

  const generateAITasks = async () => {
    setGenerating(true);
    try {
      // Simulate AI processing - in real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 2500));

      const mockTasks = [
        {
          meeting_id: meetingId,
          title: 'Review quarterly budget allocation',
          description: 'Analyze current spending and prepare recommendations for Q4 budget adjustments',
          priority: 'high',
          status: 'pending',
          ai_generated: true,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          meeting_id: meetingId,
          title: 'Schedule stakeholder follow-up meetings',
          description: 'Coordinate with key stakeholders to discuss project timeline updates',
          priority: 'medium',
          status: 'pending',
          ai_generated: true,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          meeting_id: meetingId,
          title: 'Update project documentation',
          description: 'Reflect recent decisions and changes in project specifications',
          priority: 'medium',
          status: 'pending',
          ai_generated: true,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { data, error } = await supabase
        .from('action_items')
        .insert(mockTasks)
        .select();

      if (error) throw error;

      setActionItems(prev => [...(data || []), ...prev]);
      
      toast({
        title: "AI Tasks Generated",
        description: `${data?.length || 0} action items have been created based on meeting content`,
      });
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI tasks",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const addManualTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('action_items')
        .insert({
          meeting_id: meetingId,
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          status: 'pending',
          ai_generated: false
        })
        .select()
        .single();

      if (error) throw error;

      setActionItems(prev => [data, ...prev]);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddForm(false);
      
      toast({
        title: "Task Added",
        description: "New action item has been created",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setActionItems(prev => prev.map(item => 
        item.id === taskId ? { ...item, status: newStatus } : item
      ));

      toast({
        title: "Task Updated",
        description: `Task marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
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
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  AI Task Generator
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Generate and manage action items from meeting content
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={generateAITasks}
                disabled={generating}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Tasks...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Tasks
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Task
              </Button>
            </div>
            
            <Badge variant="secondary">
              {actionItems.length} tasks
            </Badge>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <CardContent className="p-4 space-y-4">
                    <Input
                      placeholder="Task title..."
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Task description (optional)..."
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                    <div className="flex space-x-4">
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                        className="w-40"
                      />
                      
                      <div className="flex space-x-2 ml-auto">
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addManualTask}>
                          Add Task
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {actionItems.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  No Tasks Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Generate AI-powered action items or add tasks manually
                </p>
              </div>
            ) : (
              actionItems.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {task.title}
                        </h3>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.ai_generated && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        {task.due_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Created: {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(task.status)}
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskGenerator;
