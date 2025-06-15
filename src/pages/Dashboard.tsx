
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
import ThemeToggle from '@/components/ThemeToggle';

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
        status: 'active',
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

  const startMeeting = async (meeting: Meeting) => {
    try {
      console.log('Starting meeting:', meeting.id);
      
      // Activate the meeting if it's not already active
      if (!meeting.is_active) {
        const { error: updateError } = await supabase
          .from('meetings')
          .update({ 
            is_active: true,
            status: 'active'
          })
          .eq('id', meeting.id);

        if (updateError) {
          console.error('Error activating meeting:', updateError);
          toast({
            title: "Error",
            description: "Failed to start meeting",
            variant: "destructive"
          });
          return;
        }
      }

      // Navigate to the meeting
      navigate(`/meeting/${meeting.meeting_code}`);
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to start meeting",
        variant: "destructive"
      });
    }
  };

  const joinMeeting = (code: string) => {
    navigate(`/meeting/${code}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Enhanced Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/2d81a553-9d58-4ba7-94bd-f014ebe9d554.png" 
                alt="OmniMeet" 
                className="h-10 w-auto object-contain drop-shadow-lg"
              />
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-cyan-500/20">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-200 font-medium">Welcome, {user?.email}</span>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowSettingsModal(true)}
                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl border border-transparent hover:border-cyan-500/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded-xl border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Ready to Meet?
            </h1>
            <p className="text-gray-400 text-lg">Choose how you want to start your next collaboration</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }}>
              <Card className="group bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-emerald-500/30 p-8 hover:border-emerald-400/60 transition-all duration-500 cursor-pointer shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 rounded-2xl"
                    onClick={createInstantMeeting}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-emerald-500/30 mx-auto">
                    {creatingMeeting ? (
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Video className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      {creatingMeeting ? 'Creating...' : 'Instant Meeting'}
                    </h3>
                    <p className="text-gray-400">Start a meeting right now</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }}>
              <Card className="group bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-blue-500/30 p-8 hover:border-blue-400/60 transition-all duration-500 cursor-pointer shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 rounded-2xl"
                    onClick={() => setShowScheduleModal(true)}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-blue-500/30 mx-auto">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Schedule Meeting</h3>
                    <p className="text-gray-400">Plan for the future</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }}>
              <Card className="group bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-purple-500/30 p-8 hover:border-purple-400/60 transition-all duration-500 cursor-pointer shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 rounded-2xl"
                    onClick={() => setShowJoinModal(true)}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-purple-500/30 mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Join Meeting</h3>
                    <p className="text-gray-400">Enter with meeting code</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }}>
              <Card className="group bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-orange-500/30 p-8 hover:border-orange-400/60 transition-all duration-500 cursor-pointer shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 rounded-2xl"
                    onClick={() => setShowSettingsModal(true)}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-orange-500/30 mx-auto">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">Settings</h3>
                    <p className="text-gray-400">Customize your experience</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Recent Meetings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">My Meetings</h2>
            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>Recently Created</span>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 rounded-2xl overflow-hidden">
            <div className="p-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-400 text-lg">Loading your meetings...</p>
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">No meetings yet</h3>
                  <p className="text-gray-400 mb-6">Create your first meeting to get started</p>
                  <Button 
                    onClick={createInstantMeeting}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Meeting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-cyan-500/40 group"
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`w-4 h-4 rounded-full shadow-lg ${meeting.is_active ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : meeting.status === 'scheduled' ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-gray-500'}`}></div>
                        <div>
                          <h3 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors">{meeting.title}</h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mt-2">
                            <span className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {meeting.scheduled_time 
                                  ? new Date(meeting.scheduled_time).toLocaleString()
                                  : new Date(meeting.created_at).toLocaleDateString()
                                }
                              </span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>{meeting.participants_count} participants</span>
                            </span>
                            <span className="capitalize text-xs px-3 py-1 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600">
                              {meeting.status || 'active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600/50">
                          <span className="text-gray-300 text-sm font-mono">{meeting.meeting_code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMeetingCode(meeting.meeting_code)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700/50 h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={() => startMeeting(meeting)}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 px-6 py-2 rounded-xl font-medium"
                        >
                          Start
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.section>

        {/* Enhanced Attended Meetings */}
        {attendedMeetings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Recently Attended</h2>
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="w-5 h-5" />
                <span>As Participant</span>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 rounded-2xl overflow-hidden">
              <div className="p-8">
                <div className="space-y-4">
                  {attendedMeetings.map((meeting) => (
                    <motion.div
                      key={meeting.id}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-purple-500/40 group"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                        <div>
                          <h3 className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors">{meeting.title}</h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mt-2">
                            <span className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {meeting.scheduled_time 
                                  ? new Date(meeting.scheduled_time).toLocaleString()
                                  : new Date(meeting.created_at).toLocaleDateString()
                                }
                              </span>
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-700/50 to-pink-700/50 border border-purple-600/50">
                              Participant
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-600/50">
                        <span className="text-gray-300 text-sm font-mono">{meeting.meeting_code}</span>
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
