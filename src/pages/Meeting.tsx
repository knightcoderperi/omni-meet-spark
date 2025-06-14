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
import MeetingInsights from '@/components/meeting/MeetingInsights';
import Whiteboard from '@/components/whiteboard/Whiteboard';
import TaskGenerator from '@/components/meeting/TaskGenerator';
import TranslationChat from '@/components/meeting/TranslationChat';
import ShareLinkModal from '@/components/meeting/ShareLinkModal';
import LayoutCustomizationPanel from '@/components/meeting/LayoutCustomizationPanel';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useLayoutCustomization } from '@/hooks/useLayoutCustomization';
import { useTheme } from '@/hooks/useTheme';
import CatchMeUpButton from '@/components/meeting/CatchMeUpButton';
import LateJoinerWelcome from '@/components/meeting/LateJoinerWelcome';
import CatchMeUpModal from '@/components/meeting/CatchMeUpModal';

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
  const isMobile = useIsMobile();
  
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
  const [showTaskGenerator, setShowTaskGenerator] = useState(false);
  const [showTranslationChat, setShowTranslationChat] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [reactions, setReactions] = useState<Array<{id: string, emoji: string, x: number, y: number}>>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLateJoinerWelcome, setShowLateJoinerWelcome] = useState(false);
  const [showCatchMeUp, setShowCatchMeUp] = useState(false);
  const [userJoinTime, setUserJoinTime] = useState(0);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

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

  const { settings, getGridClasses } = useLayoutCustomization();

  const { toggleTheme: _toggleTheme } = useTheme();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (meetingCode) {
      fetchMeeting();
    }

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
      const joinTime = meetingDuration;
      setUserJoinTime(joinTime);
      
      // Use optimized tile size based on layout settings
      const tileSize = settings.compactMode ? 'small' : settings.gridSize;
      await initializeWebRTC(audioOnly, tileSize);
      setHasJoined(true);
      
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
      
      // Show late joiner welcome if user missed more than 1 minute and hasn't been shown before
      if (joinTime > 60 && !hasShownWelcome) {
        setHasShownWelcome(true);
        setTimeout(() => {
          setShowLateJoinerWelcome(true);
        }, 2000); // Show after 2 seconds to let UI settle
      }
      
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
    return Math.max(0, meetingDuration - userJoinTime);
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
      {/* Enhanced Animated Background */}
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

      {/* Meeting Enhancement Modals */}
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

      {/* Main Meeting Interface */}
      <div className="absolute inset-0 flex flex-col">
        {/* Premium Header Bar with Enhanced Catch Me Up Button */}
        <motion.header 
          className="bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 p-2 md:p-4 z-20"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-6">
              <motion.img 
                src="/lovable-uploads/7d88fd56-d3fa-4677-928c-8d654baae527.png" 
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
              {/* Prominent Catch Me Up Button */}
              <CatchMeUpButton
                meetingDuration={meetingDuration}
                joinTime={userJoinTime}
                onOpenCatchUp={() => setShowCatchMeUp(true)}
                isMobile={isMobile}
              />

              {/* Layout Customization Button */}
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                onClick={() => setShowLayoutPanel(true)}
              >
                <Layout className="w-4 h-4 mr-1" />
                {!isMobile && "Layout"}
              </Button>

              {/* Mobile Share Button */}
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              
              {!isMobile && (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-cyan-500/30"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                </>
              )}
              
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <Users className="w-4 h-4 mr-1" />
                {!isMobile && participants.length}
              </Button>
              
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "default"}
                className="text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Enhanced Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Optimized Video Grid */}
          <motion.div 
            className={`flex-1 p-2 md:p-6 ${
              (showChat || showParticipants || showAI) && !isMobile ? 'mr-80' : ''
            } transition-all duration-300`}
            layout
          >
            <div className={`grid gap-2 md:gap-4 h-full ${getGridClasses()}`}>
              {/* Self Video with Premium Styling */}
              <OptimizedVideoTile
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
                showNames={settings.showParticipantNames}
                showQuality={settings.showConnectionQuality}
                enableAnimations={settings.enableAnimations}
                tileSize={getTileSize()}
              />
              
              {/* Remote Participants */}
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
                <OptimizedVideoTile
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
                  showNames={settings.showParticipantNames}
                  showQuality={settings.showConnectionQuality}
                  enableAnimations={settings.enableAnimations}
                  tileSize={getTileSize()}
                />
              ))}
              
              {/* Enhanced Placeholder Tiles */}
              {!isMobile && !settings.compactMode && Array.from({ length: Math.max(0, 3 - remoteStreams.size) }).map((_, i) => (
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
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Side Panels */}
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

        {/* Enhanced Controls Bar */}
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
