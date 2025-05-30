
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Phone, Monitor, Hand,
  Circle, Share, MoreVertical, Smile, Heart, ThumbsUp,
  Volume2, Settings, Users, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onToggleAI
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const reactions = [
    { emoji: '👍', label: 'Thumbs up' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '👏', label: 'Clap' },
    { emoji: '🎉', label: 'Celebrate' }
  ];

  const primaryControls = [
    {
      icon: isMuted ? MicOff : Mic,
      label: isMuted ? 'Unmute' : 'Mute',
      isActive: isMuted,
      onClick: onToggleMute,
      variant: isMuted ? 'destructive' : 'secondary',
      hotkey: 'M'
    },
    {
      icon: isVideoOff ? VideoOff : Video,
      label: isVideoOff ? 'Turn on camera' : 'Turn off camera',
      isActive: isVideoOff,
      onClick: onToggleVideo,
      variant: isVideoOff ? 'destructive' : 'secondary',
      hotkey: 'V'
    },
    {
      icon: Monitor,
      label: isScreenSharing ? 'Stop sharing' : 'Share screen',
      isActive: isScreenSharing,
      onClick: onToggleScreenShare,
      variant: isScreenSharing ? 'destructive' : 'secondary',
      hotkey: 'S'
    }
  ];

  const secondaryControls = [
    {
      icon: Circle,
      label: isRecording ? 'Stop recording' : 'Start recording',
      isActive: isRecording,
      onClick: onToggleRecording,
      variant: isRecording ? 'destructive' : 'secondary'
    },
    {
      icon: Hand,
      label: handRaised ? 'Lower hand' : 'Raise hand',
      isActive: handRaised,
      onClick: onToggleHandRaise,
      variant: handRaised ? 'default' : 'secondary'
    }
  ];

  return (
    <motion.div 
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Reactions Panel */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 dark:border-white/10 shadow-xl"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex space-x-2">
              {reactions.map((reaction, index) => (
                <motion.button
                  key={reaction.emoji}
                  className="text-2xl p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    onAddReaction(reaction.emoji);
                    setShowReactions(false);
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {reaction.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Options Panel */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            className="absolute bottom-full mb-4 right-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 dark:border-white/10 shadow-xl min-w-[200px]"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700 dark:text-gray-300"
                onClick={onToggleAI}
              >
                🤖 AI Assistant
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700 dark:text-gray-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700 dark:text-gray-300"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Audio Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700 dark:text-gray-300"
              >
                <Share className="w-4 h-4 mr-2" />
                Invite Others
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls Bar */}
      <motion.div 
        className="flex items-center space-x-3 bg-white/90 dark:bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-4 border border-slate-200/50 dark:border-white/10 shadow-xl"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Primary Controls */}
        <div className="flex items-center space-x-2">
          {primaryControls.map((control, index) => (
            <motion.div
              key={control.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={control.variant as "destructive" | "secondary"}
                className={`
                  relative rounded-full w-12 h-12 transition-all duration-200
                  ${control.variant === 'destructive' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-300'
                  }
                  shadow-lg hover:shadow-xl
                `}
                onClick={control.onClick}
              >
                <control.icon className="w-5 h-5" />
                
                {/* Hotkey indicator */}
                <span className="absolute -top-2 -right-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {control.hotkey}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

        {/* Secondary Controls */}
        <div className="flex items-center space-x-2">
          {secondaryControls.map((control, index) => (
            <motion.div
              key={control.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (primaryControls.length + index) * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={control.variant as "destructive" | "secondary" | "default"}
                className={`
                  rounded-full w-12 h-12 transition-all duration-200
                  ${control.isActive 
                    ? control.variant === 'destructive'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-300'
                  }
                  shadow-lg hover:shadow-xl
                `}
                onClick={control.onClick}
              >
                <control.icon className="w-5 h-5" />
              </Button>
            </motion.div>
          ))}

          {/* Reactions Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (primaryControls.length + secondaryControls.length) * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="secondary"
              className="rounded-full w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowReactions(!showReactions)}
            >
              <Smile className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* More Options */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (primaryControls.length + secondaryControls.length + 1) * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="secondary"
              className="rounded-full w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowMore(!showMore)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

        {/* Leave Meeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (primaryControls.length + secondaryControls.length + 2) * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="destructive"
            className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={onLeaveMeeting}
          >
            <Phone className="w-5 h-5 transform rotate-[135deg]" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
      >
        Press M to mute • V for video • S to share screen
      </motion.div>
    </motion.div>
  );
};

export default ControlsBar;
