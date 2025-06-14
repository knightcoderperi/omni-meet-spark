
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Users, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskBreakdown {
  [person: string]: number;
}

interface PriorityDistribution {
  High: number;
  Medium: number;
  Low: number;
}

interface ActionItem {
  task_id?: string;
  description: string;
  assigned_to: string;
  assigned_by?: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline?: string;
  context: string;
}

interface AnalysisData {
  meeting_id: string;
  summary?: string;
  key_decisions?: string[];
  action_items?: ActionItem[];
  participants?: string[];
  next_meeting_date?: string | null;
  task_breakdown?: TaskBreakdown;
  priority_distribution?: PriorityDistribution;
  estimated_completion_time?: number;
}

interface MeetingAnalysisDashboardProps {
  meetingId: string;
  analysisData?: AnalysisData;
}

const MeetingAnalysisDashboard: React.FC<MeetingAnalysisDashboardProps> = ({
  meetingId,
  analysisData
}) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(analysisData || null);
  const [isLoading, setIsLoading] = useState(!analysisData);
  const { toast } = useToast();

  useEffect(() => {
    if (!analysisData && meetingId) {
      // Load existing analysis if available
      loadExistingAnalysis();
    } else if (analysisData) {
      setAnalysis(analysisData);
      setIsLoading(false);
    }
  }, [meetingId, analysisData]);

  const loadExistingAnalysis = async () => {
    // In a real implementation, this would fetch from your database
    setIsLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Medium':
        return <Clock className="h-4 w-4" />;
      case 'Low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting Analysis</CardTitle>
          <CardDescription>Loading analysis data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={33} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
          <CardDescription>Meeting analysis has not been completed yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.action_items?.length || 0}</p>
                <p className="text-sm text-gray-600">Tasks Extracted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.participants?.length || 0}</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(analysis.task_breakdown || {}).length}</p>
                <p className="text-sm text-gray-600">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(analysis.estimated_completion_time || 0)}h</p>
                <p className="text-sm text-gray-600">Est. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">High Priority</Badge>
              <span className="font-semibold">{analysis.priority_distribution?.High || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Medium Priority</Badge>
              <span className="font-semibold">{analysis.priority_distribution?.Medium || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Low Priority</Badge>
              <span className="font-semibold">{analysis.priority_distribution?.Low || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Breakdown by Person */}
      <Card>
        <CardHeader>
          <CardTitle>Task Assignment Breakdown</CardTitle>
          <CardDescription>Tasks assigned to each participant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analysis.task_breakdown || {}).map(([person, count]: [string, number]) => (
              <div key={person} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{person}</span>
                </div>
                <Badge variant="outline">{count} tasks</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Action Items</CardTitle>
          <CardDescription>AI-generated tasks from meeting analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {analysis.action_items?.map((task: ActionItem, index: number) => (
                <div key={task.task_id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </Badge>
                        {task.deadline && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.deadline}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{task.description}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Assigned to: <span className="font-medium">{task.assigned_to}</span>
                        {task.assigned_by && <span> by {task.assigned_by}</span>}
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        Context: "{task.context}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Meeting Summary */}
      {analysis.summary && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Meeting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{analysis.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Decisions */}
      {analysis.key_decisions && analysis.key_decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Decisions Made</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.key_decisions.map((decision: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">{decision}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingAnalysisDashboard;
