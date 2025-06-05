import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, Users, MessageSquare, 
  Settings, Share, Circle, MoreVertical, Monitor, Hand, Clock,
  Copy, Lock, Shield, Volume2, VolumeX, Camera, Maximize,
  PenTool, Presentation, Brain, Lightbulb, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VideoTile from '@/components/meeting/VideoTile';
import ControlsBar from '@/components/meeting/ControlsBar';
import ChatPanel from '@/components/meeting/ChatPanel';
import ParticipantsPanel from '@/components/meeting/ParticipantsPanel';
import AIAssistantPanel from '@/components/meeting/AIAssistantPanel';
import PreJoinScreen from '@/components/meeting/PreJoinScreen';
import MeetingLobby from '@/components/meeting/MeetingLobby';
import MeetingInsights from '@/components/meeting/MeetingInsights';
import Whiteboard from '@/components/whiteboard/Whiteboard';
import SmartSummary from '@/components/meeting/SmartSummary';
import TaskGenerator from '@/components/meeting/TaskGenerator';
import TranslationChat from '@/components/meeting/TranslationChat';
import SmartCapsuleSummary from '@/components/meeting/SmartCapsuleSummary';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useTheme } from '@/hooks/useTheme';

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

const Meeting = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showSmartSummary, setShowSmartSummary] = useState(false);
  const [showTaskGenerator, setShowTaskGenerator] = useState(false);
  const [showTranslationChat, setShowTranslationChat] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [reactions, setReactions] = useState<Array<{id: string, emoji: string, x: number, y: number}>>([]);
  const [showSmartCapsule, setShowSmartCapsule] = useState(false);

  const {
    localStream,
    remoteStreams,
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    initializeWebRTC,
    cleanupWebRTC
  } = useWebRTC();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (meetingCode) {
      fetchMeeting();
    }

    // Timer for meeting duration
    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [user, meetingCode, navigate]);

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
      
      // Add user as participant
      await supabase
        .from('meeting_participants')
        .upsert({
          meeting_id: data.id,
          user_id: user?.id,
          is_host: data.host_id === user?.id
        });

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
      await initializeWebRTC(audioOnly);
      setHasJoined(true);
      
      // Add self as participant
      const newParticipant: Participant = {
        id: user?.id || 'self',
        name: userName,
        isHost: meeting?.host_id === user?.id,
        isMuted: false,
        isVideoOff: audioOnly,
        handRaised: false,
        stream: localStream
      };
      
      setParticipants([newParticipant]);
      
      toast({
        title: "Joined meeting",
        description: `Welcome to ${meeting?.title}`,
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Error",
        description: "Failed to access camera/microphone",
        variant: "destructive"
      });
    }
  };

  const leaveMeeting = async () => {
    cleanupWebRTC();
    
    if (meeting && user) {
      await supabase
        .from('meeting_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('meeting_id', meeting.id)
        .eq('user_id', user.id);
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
    const x = Math.random() * 80 + 10; // 10-90%
    const y = Math.random() * 60 + 20; // 20-80%
    
    setReactions(prev => [...prev, { id, emoji, x, y }]);
    
    // Remove reaction after animation
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

  const openValidationDashboard = () => {
    if (meeting?.id) {
      window.open(`/validation/${meeting.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 dark:text-white text-lg">Joining meeting...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <PreJoinScreen
        meeting={meeting}
        onJoin={handleJoinMeeting}
        onThemeToggle={toggleTheme}
        theme={theme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Meeting Lobby */}
      <MeetingLobby
        meetingId={meeting?.id || ''}
        isHost={meeting?.host_id === user?.id}
        onParticipantUpdate={() => {}}
      />

      {/* Emoji Reactions Overlay */}
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

      {/* Meeting Enhancement Features */}
      <AnimatePresence>
        {showSmartCapsule && (
          <SmartCapsuleSummary
            meetingId={meeting?.id || ''}
            isVisible={showSmartCapsule}
            onClose={() => setShowSmartCapsule(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSmartSummary && (
          <SmartSummary
            meetingId={meeting?.id || ''}
            isVisible={showSmartSummary}
            onClose={() => setShowSmartSummary(false)}
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
          <TranslationChat
            meetingId={meeting?.id || ''}
            isVisible={showTranslationChat}
            onClose={() => setShowTranslationChat(false)}
          />
        )}
      </AnimatePresence>

      {/* Meeting Insights Panel */}
      <MeetingInsights
        meetingId={meeting?.id || ''}
        isVisible={showInsights}
      />

      {/* Whiteboard Overlay */}
      <AnimatePresence>
        {showWhiteboard && (
          <Whiteboard
            isVisible={showWhiteboard}
            onClose={() => setShowWhiteboard(false)}
            meetingId={meeting?.id || ''}
            userId={user?.id}
          />
        )}
      </AnimatePresence>

      {/* Main Meeting Interface */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header Bar */}
        <motion.header 
          className="bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 p-4 z-20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <img 
                src="/lovable-uploads/7d88fd56-d3fa-4677-928c-8d654baae527.png" 
                alt="OmniMeet" 
                className="h-8 w-auto object-contain"
              />
              
              <motion.h1 
                className="text-slate-800 dark:text-white font-bold text-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {meeting?.title || 'Meeting'}
              </motion.h1>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-cyan-500/20">
                  <span className="text-slate-600 dark:text-gray-400 text-sm font-mono">{meetingCode}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-6 w-6 p-0"
                    onClick={copyMeetingCode}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 text-slate-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono">{formatTime(meetingDuration)}</span>
                </div>
                
                {isRecording && (
                  <motion.div 
                    className="flex items-center space-x-2 text-red-500"
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
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowSmartCapsule(true)}
              >
                <Brain className="w-4 h-4 mr-2" />
                Smart Capsule
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowSmartSummary(true)}
              >
                <Brain className="w-4 h-4 mr-2" />
                Smart Summary
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowTaskGenerator(true)}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                AI Tasks
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowTranslationChat(true)}
              >
                <Languages className="w-4 h-4 mr-2" />
                Translate
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowInsights(!showInsights)}
              >
                <Brain className="w-4 h-4 mr-2" />
                Insights
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowWhiteboard(true)}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Whiteboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Users className="w-4 h-4 mr-2" />
                {participants.length}
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              {/* Add System Validation Button */}
              {meeting?.host_id === user?.id && (
                <Button 
                  variant="ghost" 
                  className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                  onClick={openValidationDashboard}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Validation
                </Button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Video Grid */}
          <motion.div 
            className={`flex-1 p-6 ${showChat || showParticipants || showAI ? 'mr-80' : ''} transition-all duration-300`}
            layout
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
              {/* Self Video */}
              <VideoTile
                participant={{
                  id: 'self',
                  name: 'You',
                  isHost: meeting?.host_id === user?.id,
                  isMuted,
                  isVideoOff,
                  handRaised,
                  stream: localStream
                }}
                isLocal={true}
              />
              
              {/* Remote Participants */}
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
                <VideoTile
                  key={peerId}
                  participant={{
                    id: peerId,
                    name: `Participant ${peerId}`,
                    isHost: false,
                    isMuted: false,
                    isVideoOff: false,
                    handRaised: false,
                    stream
                  }}
                  isLocal={false}
                />
              ))}
              
              {/* Placeholder Tiles */}
              {Array.from({ length: Math.max(0, 6 - remoteStreams.size) }).map((_, i) => (
                <motion.div
                  key={`placeholder-${i}`}
                  className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-cyan-500/30 min-h-[200px] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center text-slate-400 dark:text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Waiting for participants...</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Side Panels */}
          <AnimatePresence>
            {(showChat || showParticipants || showAI) && (
              <motion.div
                className="absolute right-0 top-0 bottom-0 w-80 bg-white/90 dark:bg-black/30 backdrop-blur-xl border-l border-slate-200/50 dark:border-white/10 z-10"
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
                {showParticipants && <ParticipantsPanel participants={participants} onClose={() => setShowParticipants(false)} />}
                {showAI && (
                  <AIAssistantPanel 
                    meetingId={meeting?.id || ''}
                    isVisible={showAI}
                    onClose={() => setShowAI(false)} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Bar */}
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
        />
      </div>
    </div>
  );
};

export default Meeting;
