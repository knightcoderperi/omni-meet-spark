
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Video, Users, Calendar, Settings, LogOut, Search, Clock, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ScheduleMeetingModal from '@/components/ScheduleMeetingModal';
import JoinMeetingModal from '@/components/JoinMeetingModal';
import SettingsModal from '@/components/SettingsModal';

interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_code: string;
  scheduled_time: string;
  duration_minutes: number;
  is_active: boolean;
  participants_count: number;
  created_at: string;
  host_id: string;
  status: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [attendedMeetings, setAttendedMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMeetings();
  }, [user, navigate]);

  const fetchMeetings = async () => {
    try {
      console.log('Fetching meetings for user:', user?.id);
      
      // Fetch meetings created by user
      const { data: createdMeetings, error: createdError } = await supabase
        .from('meetings')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (createdError) {
        console.error('Error fetching created meetings:', createdError);
      } else {
        console.log('Fetched created meetings:', createdMeetings);
        setMeetings(createdMeetings || []);
      }

      // Fetch meetings attended by user
      const { data: participantMeetings, error: participantError } = await supabase
        .from('meeting_participants')
        .select(`
          meeting_id,
          meetings (*)
        `)
        .eq('user_id', user?.id)
        .order('joined_at', { ascending: false })
        .limit(10);

      if (participantError) {
        console.error('Error fetching attended meetings:', participantError);
      } else {
        console.log('Fetched attended meetings:', participantMeetings);
        const attendedMeetingsList = participantMeetings
          ?.map(p => p.meetings)
          .filter(m => m && m.host_id !== user?.id) || [];
        setAttendedMeetings(attendedMeetingsList as Meeting[]);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInstantMeeting = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a meeting",
        variant: "destructive"
      });
      return;
    }

    setCreatingMeeting(true);
    try {
      console.log('Creating meeting for user:', user.id);
      const meetingCode = Math.random().toString(36).substring(2, 12).toUpperCase();
      
      const meetingData = {
        host_id: user.id,
        creator_id: user.id,
        title: 'Instant Meeting',
        description: 'Quick meeting started from dashboard',
        meeting_code: meetingCode,
        is_active: true,
        allow_anonymous: false,
        require_approval: true
      };

      console.log('Meeting data to insert:', meetingData);

      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select()
        .single();

      if (error) {
        console.error('Error creating meeting:', error);
        toast({
          title: "Error",
          description: `Failed to create meeting: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Meeting created successfully:', data);
        toast({
          title: "Meeting created!",
          description: "Redirecting to meeting room..."
        });
        
        fetchMeetings();
        navigate(`/meeting/${data.meeting_code}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setCreatingMeeting(false);
    }
  };

  const copyMeetingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Meeting code copied to clipboard"
    });
  };

  const joinMeeting = (code: string) => {
    navigate(`/meeting/${code}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/4529ad4c-cec8-4635-98a5-14d2daac80e1.png" 
                alt="OmniMeet" 
                className="h-10 w-auto object-contain filter brightness-0 invert"
              />
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.email}</span>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsModal(true)}
                className="text-gray-300 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.02, y: -5 }}>
              <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-xl shadow-cyan-500/10"
                    onClick={createInstantMeeting}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    {creatingMeeting ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Video className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {creatingMeeting ? 'Creating...' : 'New Meeting'}
                    </h3>
                    <p className="text-gray-400 text-sm">Start instant meeting</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -5 }}>
              <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all cursor-pointer group shadow-xl shadow-blue-500/10"
                    onClick={() => setShowScheduleModal(true)}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Schedule</h3>
                    <p className="text-gray-400 text-sm">Plan future meeting</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -5 }}>
              <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all cursor-pointer group shadow-xl shadow-purple-500/10"
                    onClick={() => setShowJoinModal(true)}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Join Meeting</h3>
                    <p className="text-gray-400 text-sm">Enter meeting code</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -5 }}>
              <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-orange-500/20 p-6 hover:border-orange-500/40 transition-all cursor-pointer group shadow-xl shadow-orange-500/10"
                    onClick={() => setShowSettingsModal(true)}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Settings</h3>
                    <p className="text-gray-400 text-sm">Configure preferences</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Recent Meetings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">My Meetings</h2>
          
          <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/10">
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading meetings...</p>
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No meetings created yet</p>
                  <p className="text-gray-500 text-sm">Create your first meeting to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${meeting.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : meeting.status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                        <div>
                          <h3 className="text-white font-medium">{meeting.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {meeting.scheduled_time 
                                  ? new Date(meeting.scheduled_time).toLocaleString()
                                  : new Date(meeting.created_at).toLocaleDateString()
                                }
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{meeting.participants_count} participants</span>
                            </span>
                            <span className="capitalize text-xs px-2 py-1 rounded-full bg-gray-700">
                              {meeting.status || 'active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm font-mono bg-gray-800/50 px-2 py-1 rounded">{meeting.meeting_code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMeetingCode(meeting.meeting_code)}
                          className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => joinMeeting(meeting.meeting_code)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
                        >
                          {meeting.host_id === user?.id ? 'Start' : 'Join'}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.section>

        {/* Attended Meetings */}
        {attendedMeetings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">Recently Attended</h2>
            
            <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-purple-500/20 shadow-xl shadow-purple-500/10">
              <div className="p-6">
                <div className="space-y-4">
                  {attendedMeetings.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-purple-500/30"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <div>
                          <h3 className="text-white font-medium">{meeting.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {meeting.scheduled_time 
                                  ? new Date(meeting.scheduled_time).toLocaleString()
                                  : new Date(meeting.created_at).toLocaleDateString()
                                }
                              </span>
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-700/50">
                              Participant
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm font-mono bg-gray-800/50 px-2 py-1 rounded">{meeting.meeting_code}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.section>
        )}
      </main>

      {/* Modals */}
      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onMeetingScheduled={fetchMeetings}
      />

      <JoinMeetingModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default Dashboard;
