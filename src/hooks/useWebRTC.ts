
import { useState, useRef, useCallback, useEffect } from 'react';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenStream = useRef<MediaStream | null>(null);

  // Performance optimization: Use lower quality constraints for better performance
  const getOptimizedConstraints = useCallback((audioOnly: boolean = false, tileSize: 'small' | 'medium' | 'large' = 'medium') => {
    const videoConstraints = {
      small: { width: { ideal: 320, max: 640 }, height: { ideal: 240, max: 480 }, frameRate: { ideal: 15, max: 24 } },
      medium: { width: { ideal: 640, max: 1280 }, height: { ideal: 480, max: 720 }, frameRate: { ideal: 24, max: 30 } },
      large: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
    };

    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1 // Mono for better performance
      },
      video: audioOnly ? false : {
        ...videoConstraints[tileSize],
        facingMode: 'user'
      }
    };
  }, []);

  const initializeWebRTC = useCallback(async (audioOnly: boolean = false, tileSize: 'small' | 'medium' | 'large' = 'medium') => {
    try {
      const constraints = getOptimizedConstraints(audioOnly, tileSize);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Performance optimization: Configure audio track for better performance
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
        // Apply audio constraints for better performance
        await audioTrack.applyConstraints({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        });
      }
      
      // Performance optimization: Configure video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && !audioOnly) {
        // Apply video constraints based on tile size for performance
        await videoTrack.applyConstraints(constraints.video as MediaTrackConstraints);
      }
      
      setLocalStream(stream);
      setIsVideoOff(audioOnly);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        // Performance optimization: Set playback quality
        localVideoRef.current.playsInline = true;
        localVideoRef.current.preload = 'metadata';
      }

      console.log('WebRTC initialized successfully with optimized settings');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, [getOptimizedConstraints]);

  const createPeerConnection = useCallback((peerId: string) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' } // Additional STUN servers for better connectivity
      ],
      iceCandidatePoolSize: 10, // Performance optimization
      bundlePolicy: 'max-bundle' as RTCBundlePolicy, // Performance optimization
      rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy // Performance optimization
    };

    const pc = new RTCPeerConnection(configuration);

    // Performance optimization: Configure peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, localStream);
        
        // Performance optimization: Configure encoding parameters
        if (track.kind === 'video') {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 1000000; // 1Mbps max for better performance
            params.encodings[0].scaleResolutionDownBy = 1;
            sender.setParameters(params);
          }
        }
      });
    }

    // Handle remote stream with performance optimizations
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('Received remote stream:', remoteStream.id);
      
      // Performance optimization: Configure remote stream
      remoteStream.getVideoTracks().forEach(track => {
        track.contentHint = 'motion'; // Optimize for video calls
      });
      
      setRemoteStreams(prev => new Map(prev.set(peerId, remoteStream)));
    };

    // Handle ICE candidates with better error handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
        // Send ICE candidate to remote peer via signaling server
      }
    };

    // Enhanced connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('Peer connection failed for:', peerId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
      }
    };

    // Performance monitoring
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [localStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const displayMediaOptions = {
        video: {
          displaySurface: 'monitor',
          logicalSurface: true,
          cursor: 'always',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          suppressLocalAudioPlayback: true // Performance optimization
        }
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      screenStream.current = stream;
      setIsScreenSharing(true);

      // Performance optimization: Replace video track efficiently
      const videoTrack = stream.getVideoTracks()[0];
      const promises: Promise<void>[] = [];
      
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender && videoTrack) {
          promises.push(sender.replaceTrack(videoTrack));
        }
      });

      await Promise.all(promises);

      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };

    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
      screenStream.current = null;
    }

    setIsScreenSharing(false);

    // Performance optimization: Restore camera video efficiently
    if (localStream && !isVideoOff) {
      const videoTrack = localStream.getVideoTracks()[0];
      const promises: Promise<void>[] = [];
      
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender && videoTrack) {
          promises.push(sender.replaceTrack(videoTrack));
        }
      });

      await Promise.all(promises);
    }
  }, [localStream, isVideoOff]);

  const cleanupWebRTC = useCallback(() => {
    console.log('Cleaning up WebRTC resources...');
    
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
    }
    
    if (screenStream.current) {
      screenStream.current.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    peerConnections.current.forEach((pc, peerId) => {
      console.log('Closing peer connection:', peerId);
      pc.close();
    });
    peerConnections.current.clear();

    // Clear streams
    setLocalStream(null);
    setRemoteStreams(new Map());
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [localStream]);

  // Performance optimization: Effect to ensure proper video element configuration
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      const video = localVideoRef.current;
      video.srcObject = localStream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      
      // Performance optimization: Set video element properties
      video.style.objectFit = 'cover';
      video.preload = 'metadata';
    }
  }, [localStream]);

  // Performance monitoring effect
  useEffect(() => {
    const interval = setInterval(() => {
      peerConnections.current.forEach(async (pc, peerId) => {
        try {
          const stats = await pc.getStats();
          // Log connection quality metrics for debugging
          stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
              console.log(`Video quality for ${peerId}:`, {
                bytesReceived: report.bytesReceived,
                packetsLost: report.packetsLost,
                jitter: report.jitter
              });
            }
          });
        } catch (error) {
          console.warn('Error getting stats for peer:', peerId, error);
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
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
    cleanupWebRTC,
    createPeerConnection,
    localVideoRef
  };
};
