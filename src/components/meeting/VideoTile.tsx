
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Hand, Pin, Volume2, VolumeX,
  Maximize, MoreVertical, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  handRaised: boolean;
  stream?: MediaStream;
}

interface VideoTileProps {
  participant: Participant;
  isLocal: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onMute?: () => void;
  onRemove?: () => void;
}

const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isLocal,
  isPinned = false,
  onPin,
  onMute,
  onRemove
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      
      if (isLocal) {
        videoRef.current.muted = true; // Always mute local video to prevent feedback
      }
    }
  }, [participant.stream, isLocal]);

  // Audio level visualization
  useEffect(() => {
    if (participant.stream && !participant.isMuted) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(participant.stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
      
      return () => {
        audioContext.close();
      };
    }
  }, [participant.stream, participant.isMuted]);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`
        relative overflow-hidden h-full min-h-[200px] transition-all duration-300
        ${isPinned ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        ${participant.isVideoOff ? 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900' : 'bg-black'}
        ${volume > 30 ? 'ring-2 ring-green-400 ring-opacity-60' : ''}
        backdrop-blur-xl border-slate-200/50 dark:border-white/10
        hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-purple-500/20
      `}>
        {/* Video Element */}
        {!participant.isVideoOff && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover"
          />
        )}

        {/* Avatar for video off */}
        {participant.isVideoOff && (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getInitials(participant.name)}
            </motion.div>
          </div>
        )}

        {/* Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Status Indicators - Bottom Left */}
        <motion.div 
          className="absolute bottom-3 left-3 flex items-center space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {participant.isMuted ? (
            <motion.div
              className="p-1.5 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MicOff className="w-3 h-3 text-white" />
            </motion.div>
          ) : (
            <motion.div
              className={`p-1.5 rounded-full transition-colors ${
                volume > 30 ? 'bg-green-500' : 'bg-gray-600'
              }`}
              animate={volume > 30 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Mic className="w-3 h-3 text-white" />
            </motion.div>
          )}
          
          {participant.isVideoOff && (
            <div className="p-1.5 bg-red-500 rounded-full">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </motion.div>

        {/* Raised Hand Indicator */}
        <AnimatePresence>
          {participant.handRaised && (
            <motion.div
              className="absolute top-3 right-3 p-2 bg-yellow-500 rounded-full"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                y: [0, -5, 0]
              }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ 
                duration: 0.5,
                y: { duration: 1, repeat: Infinity }
              }}
            >
              <Hand className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Tag */}
        <motion.div 
          className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {participant.isHost && (
            <Crown className="w-3 h-3 text-yellow-400" />
          )}
          <span className="text-white text-xs font-medium">
            {participant.name}
          </span>
        </motion.div>

        {/* Hover Controls */}
        <AnimatePresence>
          {isHovered && !isLocal && (
            <motion.div
              className="absolute top-3 left-3 flex space-x-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
                onClick={onPin}
              >
                <Pin className="w-3 h-3 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-3 h-3 text-white" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
              >
                <MoreVertical className="w-3 h-3 text-white" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Quality Indicator */}
        <div className="absolute top-3 right-3">
          <div className="flex space-x-0.5">
            <div className="w-1 h-2 bg-green-400 rounded-full" />
            <div className="w-1 h-3 bg-green-400 rounded-full" />
            <div className="w-1 h-4 bg-green-400 rounded-full" />
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </div>
        </div>

        {/* Audio Visualization */}
        {!participant.isMuted && volume > 10 && (
          <motion.div
            className="absolute inset-0 ring-2 ring-green-400 ring-opacity-60 rounded-lg pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default VideoTile;
