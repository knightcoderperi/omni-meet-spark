import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Video, Users, Calendar, Settings, 
  Copy, Edit, Trash2, Play, Clock, CheckCircle,
  User, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import CreateMeetingModal from '@/components/meeting/CreateMeetingModal';

interface Meeting {
  id: string;
  meeting_code: string;
  title: string;
  description: string | null;
  scheduled_time: string | null;
  duration_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  participants_count: number;
  max_participants: number;
  created_at: string;
  require_approval: boolean;
  lobby_enabled: boolean;
  recording_enabled: boolean;
}

const Dashboard: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard mounted, user:', user);
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    console.log('Fetching meetings for user:', user?.id);
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meetings:', error);
        throw error;
      }
      
      console.log('Fetched meetings:', data);
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meetings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMeetingLink = (meetingCode: string) => {
    const link = `${window.location.origin}/meeting/${meetingCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Meeting link has been copied to clipboard",
    });
  };

  const startMeeting = async (meetingCode: string, meetingId: string) => {
    try {
      // Update meeting status to active
      const { error } = await supabase
        .from('meetings')
        .update({ status: 'active', is_active: true })
        .eq('id', meetingId);

      if (error) throw error;

      navigate(`/meeting/${meetingCode}`);
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to start meeting",
        variant: "destructive"
      });
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;

      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      toast({
        title: "Meeting Deleted",
        description: "Meeting has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive"
      });
    }
  };

  const handleMeetingCreated = (meetingCode: string) => {
    console.log('Meeting created with code:', meetingCode);
    // Refresh the meetings list
    fetchMeetings();
    navigate(`/meeting/${meetingCode}`);
  };

  const handleCreateMeeting = () => {
    console.log('Opening create meeting modal');
    if (!user) {
      console.error('No user found when trying to create meeting');
      toast({
        title: "Error",
        description: "You must be logged in to create a meeting.",
        variant: "destructive"
      });
      return;
    }
    setShowCreateModal(true);
  };

  const getStatusBadge = (status: Meeting['status']) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Meeting Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {profile?.role || 'participant'}
                  </p>
                </div>
              </div>
              
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your meetings and create new ones
              </p>
            </div>
            
            <Button
              onClick={handleCreateMeeting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total Meetings
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {meetings.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Active Meetings
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {meetings.filter(m => m.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total Participants
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {meetings.reduce((sum, m) => sum + m.participants_count, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meetings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Your Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  No meetings yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first meeting to get started
                </p>
                <Button onClick={handleCreateMeeting}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Meeting
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                              {meeting.title}
                            </h3>
                            {meeting.description && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                                {meeting.description}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(meeting.status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {meeting.scheduled_time 
                              ? new Date(meeting.scheduled_time).toLocaleDateString()
                              : 'No date set'}
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {meeting.duration_minutes} min
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.participants_count}/{meeting.max_participants}
                          </div>
                          
                          <div className="flex items-center">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                              {meeting.meeting_code}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {meeting.lobby_enabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Lobby
                            </Badge>
                          )}
                          {meeting.require_approval && (
                            <Badge variant="secondary" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              Approval Required
                            </Badge>
                          )}
                          {meeting.recording_enabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Recording
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyMeetingLink(meeting.meeting_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        {meeting.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => startMeeting(meeting.meeting_code, meeting.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {meeting.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/meeting/${meeting.meeting_code}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMeeting(meeting.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
};

export default Dashboard;
