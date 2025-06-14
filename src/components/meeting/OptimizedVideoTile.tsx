
import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Hand, Pin, Volume2, VolumeX,
  Maximize, Crown, Wifi, WifiOff, Signal
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

interface OptimizedVideoTileProps {
  participant: Participant;
  isLocal: boolean;
  isPinned?: boolean;
  showNames?: boolean;
  showQuality?: boolean;
  enableAnimations?: boolean;
  tileSize?: 'small' | 'medium' | 'large';
  onPin?: () => void;
  onMute?: () => void;
  onRemove?: () => void;
}

const OptimizedVideoTile: React.FC<OptimizedVideoTileProps> = memo(({
  participant,
  isLocal,
  isPinned = false,
  showNames = true,
  showQuality = true,
  enableAnimations = true,
  tileSize = 'medium',
  onPin,
  onMute,
  onRemove
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isMobile = useIsMobile();

  // Optimized video setup with performance improvements
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      const video = videoRef.current;
      
      // Performance optimizations
      video.srcObject = participant.stream;
      video.playsInline = true;
      video.muted = isLocal || participant.id === 'self';
      
      // Optimize video quality based on tile size
      const constraints = {
        width: tileSize === 'small' ? 320 : tileSize === 'medium' ? 640 : 1280,
        height: tileSize === 'small' ? 240 : tileSize === 'medium' ? 480 : 720
      };
      
      // Apply video constraints for performance
      if (participant.stream.getVideoTracks().length > 0) {
        const videoTrack = participant.stream.getVideoTracks()[0];
        videoTrack.applyConstraints(constraints).catch(console.warn);
      }

      const handleLoadedData = () => setIsVideoLoaded(true);
      video.addEventListener('loadeddata', handleLoadedData);

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [participant.stream, isLocal, participant.id, tileSize]);

  // Optimized audio level detection with throttling
  useEffect(() => {
    if (!participant.stream || participant.isMuted) return;

    let animationFrame: number;
    let lastUpdate = 0;
    
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(participant.stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkVolume = (timestamp: number) => {
        // Throttle updates to improve performance
        if (timestamp - lastUpdate > 100) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(average);
          lastUpdate = timestamp;
        }
        animationFrame = requestAnimationFrame(checkVolume);
      };
      
      animationFrame = requestAnimationFrame(checkVolume);
      
      return () => {
        cancelAnimationFrame(animationFrame);
        audioContext.close();
      };
    } catch (error) {
      console.warn('Audio analysis not available:', error);
    }
  }, [participant.stream, participant.isMuted]);

  // Simulated connection quality (in real app, this would come from WebRTC stats)
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities: Array<'good' | 'fair' | 'poor'> = ['good', 'good', 'good', 'fair', 'poor'];
      setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  const getTileClasses = useCallback(() => {
    const baseClasses = "relative overflow-hidden transition-all duration-300";
    const sizeClasses = {
      small: "min-h-[120px] md:min-h-[150px]",
      medium: "min-h-[180px] md:min-h-[220px]",
      large: "min-h-[240px] md:min-h-[300px]"
    };
    
    const qualityClasses = {
      good: "ring-green-400/60",
      fair: "ring-yellow-400/60", 
      poor: "ring-red-400/60"
    };

    return `${baseClasses} ${sizeClasses[tileSize]} ${
      isPinned ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
    } ${volume > 30 ? `ring-2 ${qualityClasses[connectionQuality]}` : ''}`;
  }, [tileSize, isPinned, volume, connectionQuality]);

  const animationProps = enableAnimations ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 },
    whileHover: !isMobile ? { scale: 1.02 } : {},
    layout: true
  } : {};

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      {...animationProps}
    >
      <Card className={`
        ${getTileClasses()}
        ${participant.isVideoOff 
          ? 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900' 
          : 'bg-black'
        }
        backdrop-blur-xl border-slate-200/50 dark:border-white/10
        hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-purple-500/20
      `}>
        
        {/* Optimized Video Element */}
        {!participant.isVideoOff && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || participant.id === 'self'}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Loading State */}
        {!participant.isVideoOff && !isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Avatar for video off */}
        {participant.isVideoOff && (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div 
              className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                tileSize === 'small' ? 'w-8 h-8 text-sm' :
                tileSize === 'medium' ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl'
              }`}
              initial={enableAnimations ? { scale: 0 } : {}}
              animate={enableAnimations ? { scale: 1 } : {}}
              transition={enableAnimations ? { delay: 0.2 } : {}}
            >
              {getInitials(participant.name)}
            </motion.div>
          </div>
        )}

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Status Indicators */}
        <motion.div 
          className={`absolute left-2 flex items-center space-x-1 ${
            tileSize === 'small' ? 'bottom-1' : 'bottom-2'
          }`}
          initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
          animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
          transition={enableAnimations ? { delay: 0.3 } : {}}
        >
          {participant.isMuted ? (
            <motion.div
              className={`bg-red-500 rounded-full ${
                tileSize === 'small' ? 'p-0.5' : 'p-1'
              }`}
              animate={enableAnimations && volume > 30 ? { scale: [1, 1.1, 1] } : {}}
              transition={enableAnimations ? { duration: 2, repeat: Infinity } : {}}
            >
              <MicOff className={`text-white ${
                tileSize === 'small' ? 'w-2 h-2' : 'w-3 h-3'
              }`} />
            </motion.div>
          ) : (
            <motion.div
              className={`rounded-full transition-colors ${
                volume > 30 ? 'bg-green-500' : 'bg-gray-600'
              } ${tileSize === 'small' ? 'p-0.5' : 'p-1'}`}
              animate={enableAnimations && volume > 30 ? { scale: [1, 1.2, 1] } : {}}
              transition={enableAnimations ? { duration: 0.3 } : {}}
            >
              <Mic className={`text-white ${
                tileSize === 'small' ? 'w-2 h-2' : 'w-3 h-3'
              }`} />
            </motion.div>
          )}
          
          {participant.isVideoOff && (
            <div className={`bg-red-500 rounded-full ${
              tileSize === 'small' ? 'p-0.5' : 'p-1'
            }`}>
              <VideoOff className={`text-white ${
                tileSize === 'small' ? 'w-2 h-2' : 'w-3 h-3'
              }`} />
            </div>
          )}
        </motion.div>

        {/* Connection Quality Indicator */}
        {showQuality && (
          <div className={`absolute ${
            tileSize === 'small' ? 'top-1 right-1' : 'top-2 right-2'
          }`}>
            <div className="flex space-x-0.5">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`rounded-full transition-colors ${
                    tileSize === 'small' ? 'w-0.5' : 'w-1'
                  } ${
                    connectionQuality === 'good' ? 'bg-green-400' :
                    connectionQuality === 'fair' && bar <= 2 ? 'bg-yellow-400' :
                    connectionQuality === 'poor' && bar === 1 ? 'bg-red-400' : 'bg-gray-400'
                  }`}
                  style={{
                    height: tileSize === 'small' ? 
                      `${bar * 2 + 2}px` : 
                      `${bar * 3 + 3}px`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Raised Hand Indicator */}
        <AnimatePresence>
          {participant.handRaised && (
            <motion.div
              className={`absolute bg-yellow-500 rounded-full ${
                tileSize === 'small' ? 'top-1 right-6 p-1' : 'top-2 right-8 p-1.5'
              }`}
              initial={enableAnimations ? { scale: 0, rotate: -90 } : {}}
              animate={enableAnimations ? { 
                scale: 1, 
                rotate: 0,
                y: [0, -5, 0]
              } : {}}
              exit={enableAnimations ? { scale: 0, rotate: 90 } : {}}
              transition={enableAnimations ? { 
                duration: 0.5,
                y: { duration: 1, repeat: Infinity }
              } : {}}
            >
              <Hand className={`text-white ${
                tileSize === 'small' ? 'w-2 h-2' : 'w-3 h-3'
              }`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Tag */}
        {showNames && (
          <motion.div 
            className={`absolute bg-black/70 backdrop-blur-sm rounded-full flex items-center space-x-1 ${
              tileSize === 'small' 
                ? 'bottom-1 right-1 px-1.5 py-0.5' 
                : 'bottom-2 right-2 px-2 py-1'
            }`}
            initial={enableAnimations ? { opacity: 0, x: 20 } : {}}
            animate={enableAnimations ? { opacity: 1, x: 0 } : {}}
            transition={enableAnimations ? { delay: 0.4 } : {}}
          >
            {participant.isHost && (
              <Crown className={`text-yellow-400 ${
                tileSize === 'small' ? 'w-2 h-2' : 'w-3 h-3'
              }`} />
            )}
            <span className={`text-white font-medium ${
              tileSize === 'small' ? 'text-xs' : 'text-xs'
            }`}>
              {tileSize === 'small' && participant.name.length > 6 
                ? `${participant.name.substring(0, 6)}...` 
                : participant.name
              }
            </span>
          </motion.div>
        )}

        {/* Hover Controls */}
        <AnimatePresence>
          {isHovered && !isLocal && !isMobile && (
            <motion.div
              className={`absolute flex space-x-1 ${
                tileSize === 'small' ? 'top-1 left-1' : 'top-2 left-2'
              }`}
              initial={enableAnimations ? { opacity: 0, scale: 0.8 } : {}}
              animate={enableAnimations ? { opacity: 1, scale: 1 } : {}}
              exit={enableAnimations ? { opacity: 0, scale: 0.8 } : {}}
              transition={enableAnimations ? { duration: 0.2 } : {}}
            >
              <Button
                variant="secondary"
                size="sm"
                className={`${
                  tileSize === 'small' ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'
                } bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70`}
                onClick={onPin}
              >
                <Pin className={`${
                  tileSize === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'
                } text-white`} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                className={`${
                  tileSize === 'small' ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'
                } bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70`}
                onClick={() => {}}
              >
                <Maximize className={`${
                  tileSize === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'
                } text-white`} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Visualization Ring */}
        {!participant.isMuted && volume > 10 && enableAnimations && (
          <motion.div
            className="absolute inset-0 ring-2 ring-green-400 ring-opacity-60 rounded-lg pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </Card>
    </motion.div>
  );
});

OptimizedVideoTile.displayName = 'OptimizedVideoTile';

export default OptimizedVideoTile;
