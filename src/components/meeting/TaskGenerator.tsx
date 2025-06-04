
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, X, Plus, Target, Calendar, User, Flag,
  CheckCircle, Clock, AlertTriangle, Sparkles, Brain,
  Zap, Download, Upload, Settings, ExternalLink,
  Github, CheckSquare, Book, Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTaskExtraction } from '@/hooks/useTaskExtraction';
import { useTaskManagement } from '@/hooks/useTaskManagement';

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
  const [showAIExtraction, setShowAIExtraction] = useState(false);
  const [showPlatformSettings, setShowPlatformSettings] = useState(false);
  const [extractionText, setExtractionText] = useState('');
  const [maxTasks, setMaxTasks] = useState([10]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });
  const { toast } = useToast();

  const {
    isExtracting,
    extractedTasks,
    extractTasksFromTranscript,
    extractTasksFromMeetingContent,
    setExtractedTasks
  } = useTaskExtraction();

  const {
    platforms,
    isCreatingTasks,
    createTasksInPlatforms,
    togglePlatform,
    getLocalTasks
  } = useTaskManagement();

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
      const extractedTasks = await extractTasksFromMeetingContent(meetingId);
      
      if (extractedTasks.length > 0) {
        // Convert extracted tasks to database format
        const tasksToInsert = extractedTasks.map(task => ({
          meeting_id: meetingId,
          title: task.task,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          status: 'pending',
          ai_generated: true
        }));

        const { data, error } = await supabase
          .from('action_items')
          .insert(tasksToInsert)
          .select();

        if (error) throw error;

        setActionItems(prev => [...(data || []), ...prev]);
        
        toast({
          title: "AI Tasks Generated",
          description: `${data?.length || 0} action items created from meeting analysis`,
        });
      }
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

  const handleAIExtraction = async () => {
    if (!extractionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to extract tasks from",
        variant: "destructive"
      });
      return;
    }

    await extractTasksFromTranscript(extractionText, { maxTasks: maxTasks[0] });
  };

  const handleCreateTasksInPlatforms = async (tasks: any[]) => {
    await createTasksInPlatforms(tasks);
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

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'todoist': return <CheckSquare className="w-4 h-4" />;
      case 'notion': return <Book className="w-4 h-4" />;
      case 'local': return <Server className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
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
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
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
                  Extract and manage action items with AI-powered analysis
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
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={generateAITasks}
                disabled={generating}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing Meeting...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Meeting
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowAIExtraction(!showAIExtraction)}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Extract from Text
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Task
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowPlatformSettings(!showPlatformSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Platforms
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {actionItems.length} tasks
              </Badge>
              {extractedTasks.length > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {extractedTasks.length} extracted
                </Badge>
              )}
            </div>
          </div>

          {/* AI Text Extraction Panel */}
          <AnimatePresence>
            {showAIExtraction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="border-2 border-purple-200 dark:border-purple-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-800 dark:text-purple-300">
                      <Brain className="w-5 h-5 mr-2" />
                      AI Task Extraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste meeting transcript, notes, or any text to extract actionable tasks..."
                      value={extractionText}
                      onChange={(e) => setExtractionText(e.target.value)}
                      rows={6}
                      className="min-h-32"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium">Max Tasks:</label>
                        <div className="w-32">
                          <Slider
                            value={maxTasks}
                            onValueChange={setMaxTasks}
                            max={20}
                            min={1}
                            step={1}
                            className="cursor-pointer"
                          />
                        </div>
                        <span className="text-sm text-slate-600">{maxTasks[0]}</span>
                      </div>
                      <Button
                        onClick={handleAIExtraction}
                        disabled={isExtracting || !extractionText.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {isExtracting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Extract Tasks
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Platform Settings Panel */}
          <AnimatePresence>
            {showPlatformSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="border-2 border-blue-200 dark:border-blue-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                      <Settings className="w-5 h-5 mr-2" />
                      Task Management Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {platforms.map(platform => (
                        <div
                          key={platform.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            platform.enabled 
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          onClick={() => togglePlatform(platform.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getPlatformIcon(platform.id)}
                              <span className="font-medium">{platform.name}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${
                              platform.enabled ? 'bg-green-500' : 'bg-slate-300'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extracted Tasks Preview */}
          <AnimatePresence>
            {extractedTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="border-2 border-green-200 dark:border-green-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-green-800 dark:text-green-300">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Extracted Tasks ({extractedTasks.length})
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => createTasksInPlatforms(extractedTasks)}
                          disabled={isCreatingTasks}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isCreatingTasks ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Create in Platforms
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setExtractedTasks([])}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {extractedTasks.map((task, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                                {task.task}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs">
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline">{task.category}</Badge>
                                {task.assignee && (
                                  <Badge variant="secondary">
                                    <User className="w-3 h-3 mr-1" />
                                    {task.assignee}
                                  </Badge>
                                )}
                                {task.due_date && (
                                  <Badge variant="outline">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {task.due_date}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Task Addition Form */}
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

          {/* Existing Tasks List */}
          <div className="space-y-4">
            {actionItems.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  No Tasks Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Analyze meeting content or extract tasks from text to get started
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
