
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, Monitor, MonitorOff, 
  Hand, HandMetal, Camera, Settings, MoreVertical, PenTool,
  Sparkles, Smile, Heart, ThumbsUp, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ControlsBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  handRaised: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleHandRaise: () => void;
  onLeaveMeeting: () => void;
  onAddReaction: (emoji: string) => void;
  onToggleAI: () => void;
  onToggleWhiteboard?: () => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  handRaised,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleHandRaise,
  onLeaveMeeting,
  onAddReaction,
  onToggleAI,
  onToggleWhiteboard
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const reactions = ['😀', '👍', '❤️', '👏', '😮', '😢'];

  return (
    <motion.div
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Reactions Popup */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-4">
              <div className="flex space-x-2">
                {reactions.map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    onClick={() => {
                      onAddReaction(emoji);
                      setShowReactions(false);
                    }}
                    className="text-2xl p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Options Popup */}
      <AnimatePresence>
        {showMoreOptions && (
          <motion.div
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-4">
              <div className="flex flex-col space-y-2 min-w-[200px]">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    onToggleRecording();
                    setShowMoreOptions(false);
                  }}
                >
                  <div className={`w-3 h-3 rounded-full mr-3 ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`} />
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    onToggleAI();
                    setShowMoreOptions(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  AI Assistant
                </Button>

                {onToggleWhiteboard && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      onToggleWhiteboard();
                      setShowMoreOptions(false);
                    }}
                  >
                    <PenTool className="w-4 h-4 mr-3" />
                    Whiteboard
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-4">
        <div className="flex items-center space-x-4">
          {/* Audio Control */}
          <motion.button
            onClick={onToggleMute}
            className={`p-3 rounded-full transition-all duration-200 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          {/* Video Control */}
          <motion.button
            onClick={onToggleVideo}
            className={`p-3 rounded-full transition-all duration-200 ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </motion.button>

          {/* Screen Share */}
          <motion.button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-full transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </motion.button>

          {/* Whiteboard */}
          {onToggleWhiteboard && (
            <motion.button
              onClick={onToggleWhiteboard}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PenTool className="w-5 h-5" />
            </motion.button>
          )}

          {/* Hand Raise */}
          <motion.button
            onClick={onToggleHandRaise}
            className={`p-3 rounded-full transition-all duration-200 ${
              handRaised 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/25' 
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {handRaised ? <HandMetal className="w-5 h-5" /> : <Hand className="w-5 h-5" />}
          </motion.button>

          {/* Reactions */}
          <motion.button
            onClick={() => setShowReactions(!showReactions)}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Smile className="w-5 h-5" />
          </motion.button>

          {/* More Options */}
          <motion.button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical className="w-5 h-5" />
          </motion.button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

          {/* Leave Meeting */}
          <motion.button
            onClick={onLeaveMeeting}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Phone className="w-5 h-5 rotate-180" />
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ControlsBar;
