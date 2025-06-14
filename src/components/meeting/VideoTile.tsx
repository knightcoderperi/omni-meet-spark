
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Hand, Pin, Volume2, VolumeX,
  Maximize, MoreVertical, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      
      // Always mute local video to prevent feedback, regardless of isLocal prop
      if (isLocal || participant.id === 'self') {
        videoRef.current.muted = true;
      }
      
      // Optimize video settings to reduce lag
      videoRef.current.playsInline = true;
      videoRef.current.preload = 'metadata';
      
      // Add event listeners for better video handling
      const handleLoadedData = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      };
      
      videoRef.current.addEventListener('loadeddata', handleLoadedData);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', handleLoadedData);
        }
      };
    }
  }, [participant.stream, isLocal, participant.id]);

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
    if (!name || name.trim() === '') return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      // For single word names, take first 2 characters or first 4 characters if name is long
      const singleName = words[0];
      if (singleName.length <= 4) {
        return singleName.substring(0, 2).toUpperCase();
      } else {
        return singleName.substring(0, 4).toUpperCase();
      }
    } else {
      // For multiple words, take first letter of each word (max 2)
      return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    }
  };

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      whileHover={!isMobile ? { scale: 1.02 } : {}}
    >
      <Card className={`
        relative overflow-hidden h-full transition-all duration-300
        ${isMobile ? 'min-h-[200px]' : 'min-h-[200px]'}
        ${isPinned ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        ${participant.isVideoOff ? 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900' : 'bg-black'}
        ${volume > 30 ? 'ring-2 ring-green-400 ring-opacity-60' : ''}
        backdrop-blur-xl border-slate-200/50 dark:border-white/10
        hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-purple-500/20
      `}>
        {/* Video Element with optimizations */}
        {!participant.isVideoOff && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || participant.id === 'self'}
            className="w-full h-full object-cover"
            style={{
              transform: isLocal ? 'scaleX(-1)' : 'none', // Mirror local video
              WebkitTransform: isLocal ? 'scaleX(-1)' : 'none'
            }}
          />
        )}

        {/* Avatar for video off with improved initials */}
        {participant.isVideoOff && (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div 
              className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                isMobile ? 'w-16 h-16 text-lg' : 'w-20 h-20 text-xl'
              }`}
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
          className={`absolute left-2 flex items-center space-x-1 ${isMobile ? 'bottom-2' : 'bottom-3'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {participant.isMuted ? (
            <motion.div
              className={`bg-red-500 rounded-full ${isMobile ? 'p-1' : 'p-1.5'}`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MicOff className={`text-white ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
            </motion.div>
          ) : (
            <motion.div
              className={`rounded-full transition-colors ${
                volume > 30 ? 'bg-green-500' : 'bg-gray-600'
              } ${isMobile ? 'p-1' : 'p-1.5'}`}
              animate={volume > 30 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Mic className={`text-white ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
            </motion.div>
          )}
          
          {participant.isVideoOff && (
            <div className={`bg-red-500 rounded-full ${isMobile ? 'p-1' : 'p-1.5'}`}>
              <VideoOff className={`text-white ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
            </div>
          )}
        </motion.div>

        {/* Raised Hand Indicator */}
        <AnimatePresence>
          {participant.handRaised && (
            <motion.div
              className={`absolute bg-yellow-500 rounded-full ${
                isMobile ? 'top-2 right-2 p-1.5' : 'top-3 right-3 p-2'
              }`}
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
              <Hand className={`text-white ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Tag */}
        <motion.div 
          className={`absolute bg-black/70 backdrop-blur-sm rounded-full flex items-center space-x-1 ${
            isMobile 
              ? 'bottom-2 right-2 px-2 py-0.5' 
              : 'bottom-3 right-3 px-3 py-1'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {participant.isHost && (
            <Crown className={`text-yellow-400 ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
          )}
          <span className={`text-white font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>
            {isMobile && participant.name.length > 8 
              ? `${participant.name.substring(0, 8)}...` 
              : participant.name
            }
          </span>
        </motion.div>

        {/* Hover Controls - Desktop Only */}
        <AnimatePresence>
          {isHovered && !isLocal && !isMobile && (
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Quality Indicator */}
        <div className={`absolute ${isMobile ? 'top-2 right-8' : 'top-3 right-16'}`}>
          <div className="flex space-x-0.5">
            <div className={`bg-green-400 rounded-full ${isMobile ? 'w-0.5 h-1.5' : 'w-1 h-2'}`} />
            <div className={`bg-green-400 rounded-full ${isMobile ? 'w-0.5 h-2' : 'w-1 h-3'}`} />
            <div className={`bg-green-400 rounded-full ${isMobile ? 'w-0.5 h-2.5' : 'w-1 h-4'}`} />
            <div className={`bg-gray-400 rounded-full ${isMobile ? 'w-0.5 h-1.5' : 'w-1 h-2'}`} />
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
