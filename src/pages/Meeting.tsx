import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, Users, MessageSquare, 
  Settings, Share, Circle, MoreVertical, Monitor, Hand, Clock,
  Copy, Lock, Shield, Volume2, VolumeX, Camera, Maximize,
  PenTool, Presentation, Brain, Lightbulb, Languages, Share2, Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import OptimizedVideoTile from '@/components/meeting/OptimizedVideoTile';
import ControlsBar from '@/components/meeting/ControlsBar';
import ChatPanel from '@/components/meeting/ChatPanel';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import AIAssistantPanel from '@/components/meeting/AIAssistantPanel';
import PreJoinScreen from '@/components/meeting/PreJoinScreen';
import MeetingLobby from '@/components/meeting/MeetingLobby';
import Whiteboard from '@/components/whiteboard/Whiteboard';
import TaskGenerator from '@/components/meeting/TaskGenerator';
import TranslationChatWidget from '@/components/meeting/TranslationChatWidget';
import ShareLinkModal from '@/components/meeting/ShareLinkModal';
import LayoutCustomizationPanel from '@/components/meeting/LayoutCustomizationPanel';
import EnhancedMeetingEndHandler from '@/components/meeting/EnhancedMeetingEndHandler';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useLayoutCustomization } from '@/hooks/useLayoutCustomization';
import { useTheme } from '@/hooks/useTheme';
import CatchMeUpButton from '@/components/meeting/CatchMeUpButton';
import LateJoinerWelcome from '@/components/meeting/LateJoinerWelcome';
import CatchMeUpModal from '@/components/meeting/CatchMeUpModal';
import { Globe } from 'lucide-react';
import SmoothLoader from '@/components/SmoothLoader';
import ShareMeetingButton from '@/components/ShareMeetingButton';

interface Meeting {
  id: string;
  title: string;
  meeting_code: string;
  host_id: string;
  is_active: boolean;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  handRaised: boolean;
  stream?: MediaStream;
}

interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

// Type for the response from can_join_meeting RPC function
interface CanJoinMeetingResponse {
  can_join: boolean;
  reason?: string;
  meeting_id?: string;
  is_host?: boolean;
  requires_approval?: boolean;
  password_required?: boolean;
}

const Meeting = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantName, setParticipantName] = useState('');
  
  // Meeting timing states
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [hostJoinTime, setHostJoinTime] = useState<number | null>(null);
  const [userJoinTime, setUserJoinTime] = useState(0);
  
  // UI panel states
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [showTaskGenerator, setShowTaskGenerator] = useState(false);
  const [showTranslationChat, setShowTranslationChat] = useState(false);
  const [showLateJoinerWelcome, setShowLateJoinerWelcome] = useState(false);
  const [showCatchMeUp, setShowCatchMeUp] = useState(false);
  
  // Meeting interaction states
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  
  // Catch-up functionality states
  const [catchMeUpShown, setCatchMeUpShown] = useState(false);
  
  const {
    localStream,
    remoteStreams,
    connectedPeers,
    participants: webrtcParticipants,
    connectionState,
    roomStatus,
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    initializeWebRTC,
    cleanupWebRTC
  } = useWebRTC(
    meetingCode, 
    user?.id, 
    participantName, 
    meeting?.host_id === user?.id
  );

  const { settings, getGridClasses } = useLayoutCustomization();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (meetingCode) {
      fetchMeeting();
      checkHostJoinTime();
      setupParticipantSubscription();
    }

    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [user, meetingCode, navigate]);

  const setupParticipantSubscription = () => {
    if (!meetingCode) return;

    // Set up real-time subscription for participant updates
    const channel = supabase
      .channel(`meeting-participants-${meetingCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_participants'
        },
        (payload) => {
          console.log('Participant update:', payload);
          // Refresh participants list when changes occur
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchParticipants = async () => {
    if (!meeting?.id) return;

    try {
      const { data: participantsData, error } = await supabase
        .from('meeting_participants')
        .select(`
          id,
          user_id,
          guest_name,
          email,
          is_host,
          status,
          joined_at,
          profiles:user_id (full_name)
        `)
        .eq('meeting_id', meeting.id)
        .in('status', ['approved', 'joined']);

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }

      console.log('Fetched participants:', participantsData);

      const formattedParticipants: Participant[] = participantsData.map((p: any) => ({
        id: p.user_id || p.id,
        name: p.profiles?.full_name || p.guest_name || p.email || 'Anonymous',
        isHost: p.is_host,
        isMuted: false,
        isVideoOff: false,
        handRaised: false,
        stream: p.user_id === user?.id ? localStream : undefined
      }));

      setParticipants(formattedParticipants);
      
      // Update meeting participants count
      await supabase
        .from('meetings')
        .update({ participants_count: formattedParticipants.length })
        .eq('id', meeting.id);

    } catch (error) {
      console.error('Error in fetchParticipants:', error);
    }
  };

  const checkHostJoinTime = async () => {
    if (!meetingCode) return;
    
    try {
      // Check if host has already joined by looking at meeting participants
      const { data: meetingData, error } = await supabase
        .from('meetings')
        .select('id, host_id')
        .eq('meeting_code', meetingCode)
        .single();

      if (meetingData && meetingData.id && meetingData.host_id) {
        const { data: hostParticipant } = await supabase
          .from('meeting_participants')
          .select('joined_at')
          .eq('meeting_id', meetingData.id)
          .eq('user_id', meetingData.host_id)
          .eq('status', 'joined')
          .single();

        if (hostParticipant && hostParticipant.joined_at) {
          // Convert join time to seconds from meeting start
          const hostJoinDate = new Date(hostParticipant.joined_at);
          const meetingStartTime = 0; // Assuming meeting started at 0
          const hostJoinSeconds = Math.floor((hostJoinDate.getTime() - Date.now()) / 1000) + meetingDuration;
          setHostJoinTime(Math.max(0, hostJoinSeconds));
        }
      }
    } catch (error) {
      console.error('Error checking host join time:', error);
    }
  };

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode)
        .single();

      if (error || !data) {
        toast({
          title: "Meeting not found",
          description: "The meeting code you entered is invalid",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setMeeting(data);
      
      // Check if user can join this meeting
      const { data: joinCheckData, error: joinError } = await supabase
        .rpc('can_join_meeting', {
          meeting_code_param: meetingCode,
          user_id_param: user?.id
        });

      if (joinError) {
        console.error('Error checking join permission:', joinError);
        toast({
          title: "Error",
          description: "Unable to verify meeting access",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Safe type conversion with proper validation
      const joinCheck = joinCheckData as unknown;
      
      // Validate the response structure before using it
      if (!joinCheck || typeof joinCheck !== 'object' || !('can_join' in joinCheck)) {
        toast({
          title: "Error",
          description: "Invalid response from server",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      const typedJoinCheck = joinCheck as CanJoinMeetingResponse;

      if (!typedJoinCheck.can_join) {
        toast({
          title: "Cannot join meeting",
          description: typedJoinCheck.reason || "Unable to join meeting",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Add or update participant record
      await supabase
        .from('meeting_participants')
        .upsert({
          meeting_id: data.id,
          user_id: user?.id,
          is_host: data.host_id === user?.id,
          status: 'joined',
          joined_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,meeting_id'
        });

      // Fetch all participants
      fetchParticipants();

    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast({
        title: "Error",
        description: "Failed to join meeting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (userName: string, audioOnly: boolean) => {
    try {
      console.log('🚀 Joining meeting with parameters:', {
        userName,
        audioOnly,
        meetingCode,
        userId: user?.id,
        isHost: meeting?.host_id === user?.id
      });

      setParticipantName(userName);
      const joinTime = meetingDuration;
      setUserJoinTime(joinTime);
      
      const isHost = meeting?.host_id === user?.id;
      
      if (isHost) {
        setHostJoinTime(joinTime);
      } else {
        if (hostJoinTime !== null && joinTime > hostJoinTime && !catchMeUpShown) {
          setCatchMeUpShown(true);
          setTimeout(() => {
            setShowLateJoinerWelcome(true);
          }, 2000);
        }
      }
      
      // Update participant status to joined
      if (meeting?.id) {
        await supabase
          .from('meeting_participants')
          .upsert({
            meeting_id: meeting.id,
            user_id: user?.id,
            is_host: isHost,
            status: 'joined',
            joined_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,meeting_id'
          });
      }
      
      // Initialize WebRTC with proper participant handling
      const tileSize = settings.compactMode ? 'small' : settings.gridSize;
      await initializeWebRTC(audioOnly, tileSize);
      setHasJoined(true);
      
      // Refresh participants list
      fetchParticipants();
      
      // Show success message with room confirmation
      toast({
        title: "Successfully joined meeting room",
        description: `Connected to room ${meetingCode} as ${userName}`,
      });

      console.log('✅ Successfully joined meeting room:', {
        meetingCode,
        roomStatus,
        participantName: userName
      });
      
    } catch (error) {
      console.error('❌ Error joining meeting:', error);
      toast({
        title: "Failed to join meeting",
        description: "Could not connect to the meeting room. Please check your internet connection and try again.",
        variant: "destructive"
      });
    }
  };

  const leaveMeeting = async () => {
    cleanupWebRTC();
    
    if (meeting && user) {
      // Mark participant as left
      await supabase
        .from('meeting_participants')
        .update({ 
          left_at: new Date().toISOString(),
          status: 'left'
        })
        .eq('meeting_id', meeting.id)
        .eq('user_id', user.id);

      // If user is host, mark meeting as inactive
      if (meeting.host_id === user.id) {
        await supabase
          .from('meetings')
          .update({ is_active: false })
          .eq('id', meeting.id);
      }
    }
    navigate('/dashboard');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Meeting recording has been saved" : "Meeting is now being recorded"
    });
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    toast({
      title: handRaised ? "Hand lowered" : "Hand raised",
      description: handRaised ? "You lowered your hand" : "You raised your hand"
    });
  };

  const copyMeetingCode = () => {
    navigator.clipboard.writeText(meetingCode || '');
    toast({
      title: "Meeting code copied",
      description: "Share this code with others to join"
    });
  };

  const addReaction = (emoji: string) => {
    const id = Date.now().toString();
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 60 + 20;
    
    setReactions(prev => [...prev, { id, emoji, x, y }]);
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTileSize = () => {
    return settings.compactMode ? 'small' : settings.gridSize === 'small' ? 'small' : 
           settings.gridSize === 'large' ? 'large' : 'medium';
  };

  const openValidationDashboard = () => {
    if (meeting?.id) {
      window.open(`/validation/${meeting.id}`, '_blank');
    }
  };

  const shareMeetingLink = () => {
    const meetingUrl = `${window.location.origin}/meeting/${meetingCode}`;
    navigator.clipboard.writeText(meetingUrl);
    toast({
      title: "Meeting link copied",
      description: "Share this link with others to join the meeting"
    });
  };

  const getMissedDuration = () => {
    if (hostJoinTime === null) return 0;
    return Math.max(0, userJoinTime - hostJoinTime);
  };

  const shouldShowCatchMeUp = () => {
    const isHost = meeting?.host_id === user?.id;
    if (isHost) return false; // Never show for host
    
    if (hostJoinTime === null) return false; // Host hasn't joined yet
    
    const missedTime = getMissedDuration();
    return missedTime > 30 && !catchMeUpShown; // Show if missed more than 30 seconds and not shown before
  };

  // Enhanced participant list that combines database and WebRTC participants
  const getAllParticipants = () => {
    const combinedParticipants = new Map();
    
    // Add database participants
    participants.forEach(p => {
      combinedParticipants.set(p.id, {
        ...p,
        stream: p.id === user?.id ? localStream : remoteStreams.get(p.id)
      });
    });
    
    // Add WebRTC participants
    webrtcParticipants.forEach((p, id) => {
      if (!combinedParticipants.has(id)) {
        combinedParticipants.set(id, {
          id,
          name: p.name || `Participant ${id.slice(0, 8)}`,
          isHost: p.isHost || false,
          isMuted: false,
          isVideoOff: false,
          handRaised: false,
          stream: id === user?.id ? localStream : remoteStreams.get(id)
        });
      }
    });
    
    return Array.from(combinedParticipants.values());
  };

  // Enhanced connection status display
  useEffect(() => {
    console.log('🎯 Meeting Room Status Update:', {
      meetingCode,
      roomStatus,
      connectionState,
      connectedPeers: connectedPeers.size,
      remoteStreams: remoteStreams.size,
      webrtcParticipants: webrtcParticipants.size
    });
  }, [meetingCode, roomStatus, connectionState, connectedPeers.size, remoteStreams.size, webrtcParticipants.size]);

  if (loading) {
    return (
      <SmoothLoader 
        message="Joining meeting..." 
        size="lg"
        showLogo={true}
      />
    );
  }

  if (!hasJoined) {
    return (
      <PreJoinScreen
        meeting={meeting}
        onJoin={handleJoinMeeting}
        onThemeToggle={() => {}} // No-op since theme is managed by useTheme
        theme={theme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Enhanced Meeting End Handler - triggers personalized email sending */}
      <EnhancedMeetingEndHandler
        meetingId={meeting?.id || ''}
        isActive={meeting?.is_active || false}
        onMeetingEnd={() => {
          toast({
            title: "Meeting Summary Sent",
            description: "All participants will receive personalized email summaries with their assigned tasks",
          });
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Late Joiner Welcome Modal */}
      <LateJoinerWelcome
        isVisible={showLateJoinerWelcome}
        onClose={() => setShowLateJoinerWelcome(false)}
        onOpenCatchUp={() => {
          setShowLateJoinerWelcome(false);
          setShowCatchMeUp(true);
        }}
        missedDuration={getMissedDuration()}
        participantCount={participants.length}
        meetingTitle={meeting?.title || 'Meeting'}
      />

      {/* Catch Me Up Modal */}
      <AnimatePresence>
        {showCatchMeUp && (
          <CatchMeUpModal
            meetingId={meeting?.id || ''}
            isVisible={showCatchMeUp}
            onClose={() => setShowCatchMeUp(false)}
            missedDuration={getMissedDuration()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTaskGenerator && (
          <TaskGenerator
            meetingId={meeting?.id || ''}
            isVisible={showTaskGenerator}
            onClose={() => setShowTaskGenerator(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTranslationChat && (
          <TranslationChatWidget
            meetingId={meeting?.id || ''}
            isVisible={showTranslationChat}
            onClose={() => setShowTranslationChat(false)}
          />
        )}
      </AnimatePresence>

      <MeetingLobby
        meetingId={meeting?.id || ''}
        isHost={meeting?.host_id === user?.id}
        onParticipantUpdate={() => {}}
      />

      <ShareLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        meetingCode={meetingCode || ''}
        meetingTitle={meeting?.title || 'Meeting'}
      />

      <LayoutCustomizationPanel
        isOpen={showLayoutPanel}
        onClose={() => setShowLayoutPanel(false)}
      />

      <AnimatePresence>
        {reactions.map(reaction => (
          <motion.div
            key={reaction.id}
            className="absolute z-50 text-4xl pointer-events-none"
            style={{ left: `${reaction.x}%`, top: `${reaction.y}%` }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0, 1.2, 1, 0.8], 
              y: -100,
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Meeting Interface */}
      <div className="absolute inset-0 flex flex-col">
        {/* Premium Header Bar with Enhanced Sharing */}
        <motion.header 
          className="bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 p-2 md:p-4 z-20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-6">
              <motion.img 
                src="/lovable-uploads/2d81a553-9d58-4ba7-94bd-f014ebe9d554.png" 
                alt="OmniMeet" 
                className="h-6 md:h-8 w-auto object-contain"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              
              <motion.h1 
                className="text-slate-800 dark:text-white font-bold text-sm md:text-xl truncate bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {meeting?.title || 'Meeting'}
              </motion.h1>
              
              {!isMobile && (
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 px-3 py-1 rounded-full border border-cyan-500/20 shadow-lg">
                    <span className="text-slate-600 dark:text-gray-400 text-sm font-mono">{meetingCode}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-6 w-6 p-0 hover:bg-cyan-500/10"
                      onClick={copyMeetingCode}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 bg-white/50 dark:bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-mono">{formatTime(meetingDuration)}</span>
                  </div>
                  
                  {isRecording && (
                    <motion.div 
                      className="flex items-center space-x-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-sm font-medium">Recording</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Enhanced Share Button for Instant Meeting */}
              <ShareMeetingButton
                meetingType="instant"
                meetingData={{
                  title: meeting?.title || 'Meeting',
                  code: meetingCode,
                  id: meeting?.id
                }}
              />

              {/* Conditional Catch Me Up Button - only for late joiners, not host */}
              {shouldShowCatchMeUp() && (
                <CatchMeUpButton
                  meetingDuration={meetingDuration}
                  joinTime={hostJoinTime || 0}
                  onOpenCatchUp={() => {
                    setShowCatchMeUp(true);
                    setCatchMeUpShown(true);
                  }}
                  isMobile={isMobile}
                />
              )}

              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowLayoutPanel(true)}
              >
                <Layout className="w-4 h-4 mr-1" />
                {!isMobile && "Layout"}
              </Button>

              {/* Translation Chat Toggle Button */}
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                className={`text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30 ${
                  showTranslationChat ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                }`}
                onClick={() => setShowTranslationChat(!showTranslationChat)}
              >
                <Globe className="w-4 h-4 mr-1" />
                {!isMobile && "Translate"}
              </Button>

              {/* Additional header buttons can be added here */}
            </div>
          </div>
        </motion.header>

        <div className="flex-1 flex relative">
          <motion.div 
            className={`flex-1 p-2 md:p-6 ${
              (showChat || showParticipants || showAI) && !isMobile ? 'mr-80' : ''
            } transition-all duration-300`}
            layout
          >
            {/* Connection Status Indicator */}
            {connectionState !== 'connected' && (
              <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      {connectionState === 'connecting' ? 'Connecting to meeting...' : 'Connection lost. Reconnecting...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className={`grid gap-2 md:gap-4 h-full ${getGridClasses()}`}>
              <OptimizedVideoTile
                participant={{
                  id: 'self',
                  name: participantName || 'You',
                  isHost: meeting?.host_id === user?.id,
                  isMuted,
                  isVideoOff,
                  handRaised,
                  stream: localStream
                }}
                isLocal={true}
                showNames={settings.showParticipantNames}
                showQuality={settings.showConnectionQuality}
                enableAnimations={settings.enableAnimations}
                tileSize={getTileSize()}
              />
              
              {/* Render remote participants with enhanced info */}
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => {
                const participant = webrtcParticipants.get(peerId) || {
                  id: peerId,
                  name: `Participant ${peerId.slice(0, 8)}`,
                  isHost: false
                };

                return (
                  <OptimizedVideoTile
                    key={peerId}
                    participant={{
                      id: peerId,
                      name: participant.name,
                      isHost: participant.isHost,
                      isMuted: false,
                      isVideoOff: false,
                      handRaised: false,
                      stream
                    }}
                    isLocal={false}
                    showNames={settings.showParticipantNames}
                    showQuality={settings.showConnectionQuality}
                    enableAnimations={settings.enableAnimations}
                    tileSize={getTileSize()}
                  />
                );
              })}
              
              {/* Enhanced placeholder tiles with room info */}
              {!isMobile && !settings.compactMode && Array.from({ length: Math.max(0, 6 - remoteStreams.size) }).map((_, i) => (
                <motion.div
                  key={`placeholder-${i}`}
                  className="relative bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-300/50 dark:border-cyan-500/30 min-h-[150px] md:min-h-[200px] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.5)' }}
                >
                  <div className="text-center text-slate-400 dark:text-gray-500">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <Users className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-3 opacity-50" />
                    </motion.div>
                    <p className="text-xs md:text-sm">Waiting for participants...</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Room: {meetingCode}
                    </p>
                    <p className="text-xs text-slate-400">
                      Connected: {connectedPeers.size} peers
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {(showChat || showParticipants || showAI) && (
              <motion.div
                className={`
                  absolute right-0 top-0 bottom-0 bg-white/95 dark:bg-black/30 backdrop-blur-2xl border-l border-slate-200/50 dark:border-white/10 z-10
                  ${isMobile ? 'left-0 w-full' : 'w-80'}
                `}
                initial={{ x: isMobile ? '100%' : 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: isMobile ? '100%' : 320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
                {showParticipants && <ParticipantsPanel participants={participants} onClose={() => setShowParticipants(false)} />}
                {showAI && (
                  <AIAssistantPanel 
                    meetingId={meeting?.id || ''}
                    isVisible={showAI}
                    onClose={() => setShowAI(false)}
                    userJoinTime={userJoinTime}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Room Status Indicator */}
        {roomStatus.joined && (
          <motion.div
            className="absolute top-20 left-4 z-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Connected to room {roomStatus.meetingCode}
                </span>
                <span className="text-xs opacity-80">
                  ({roomStatus.participantCount} participants)
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <ControlsBar
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          handRaised={handRaised}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
          onToggleRecording={toggleRecording}
          onToggleHandRaise={toggleHandRaise}
          onLeaveMeeting={leaveMeeting}
          onAddReaction={addReaction}
          onToggleAI={() => setShowAI(!showAI)}
          onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default Meeting;
