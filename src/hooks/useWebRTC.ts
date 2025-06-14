
import { useState, useRef, useCallback, useEffect } from 'react';
import { WebRTCSignalingService, SignalingMessage } from '@/services/webrtcSignaling';

export const useWebRTC = (meetingId?: string, userId?: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenStream = useRef<MediaStream | null>(null);
  const signalingService = useRef<WebRTCSignalingService | null>(null);
  const isInitialized = useRef(false);

  // Optimized constraints for better performance and reduced lag
  const getOptimizedConstraints = useCallback((audioOnly: boolean = false, tileSize: 'small' | 'medium' | 'large' = 'medium') => {
    const videoConstraints = {
      small: { 
        width: { ideal: 320, max: 480 }, 
        height: { ideal: 240, max: 360 }, 
        frameRate: { ideal: 15, max: 20 }
      },
      medium: { 
        width: { ideal: 640, max: 800 }, 
        height: { ideal: 480, max: 600 }, 
        frameRate: { ideal: 20, max: 25 }
      },
      large: { 
        width: { ideal: 960, max: 1280 }, 
        height: { ideal: 720, max: 720 }, 
        frameRate: { ideal: 25, max: 30 }
      }
    };

    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
      },
      video: audioOnly ? false : {
        ...videoConstraints[tileSize],
        facingMode: 'user',
        aspectRatio: 16/9,
        resizeMode: 'crop-and-scale'
      }
    };
  }, []);

  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle' as RTCBundlePolicy,
      rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, localStream);
        
        // Optimize encoding for reduced lag
        if (track.kind === 'video') {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 800000; // 800kbps for better balance
            params.encodings[0].scaleResolutionDownBy = 1;
            params.encodings[0].maxFramerate = 25; // Cap at 25fps for stability
            sender.setParameters(params);
          }
        }
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('Received remote stream from peer:', peerId);
      
      // Optimize remote stream for performance
      remoteStream.getVideoTracks().forEach(track => {
        track.contentHint = 'motion';
        track.applyConstraints({
          frameRate: { max: 25 }
        }).catch(console.warn);
      });
      
      setRemoteStreams(prev => new Map(prev.set(peerId, remoteStream)));
      setConnectedPeers(prev => new Set(prev.add(peerId)));
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingService.current) {
        console.log('Sending ICE candidate to peer:', peerId);
        signalingService.current.sendIceCandidate(peerId, event.candidate.toJSON());
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer ${peerId} connection state:`, pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        setConnectedPeers(prev => new Set(prev.add(peerId)));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('Peer connection failed for:', peerId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
        setConnectedPeers(prev => {
          const newSet = new Set(prev);
          newSet.delete(peerId);
          return newSet;
        });
        // Clean up the peer connection
        peerConnections.current.delete(peerId);
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [localStream]);

  // Handle signaling messages
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    console.log('Received signaling message:', message.type, 'from:', message.peerId);

    switch (message.type) {
      case 'user-joined':
        console.log('User joined:', message.peerId);
        // Create offer for new user
        if (!peerConnections.current.has(message.peerId)) {
          const pc = createPeerConnection(message.peerId);
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            signalingService.current?.sendOffer(message.peerId, offer);
          } catch (error) {
            console.error('Error creating offer:', error);
          }
        }
        break;

      case 'offer':
        console.log('Received offer from:', message.peerId);
        if (!peerConnections.current.has(message.peerId)) {
          const pc = createPeerConnection(message.peerId);
          try {
            await pc.setRemoteDescription(message.data);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            signalingService.current?.sendAnswer(message.peerId, answer);
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        }
        break;

      case 'answer':
        console.log('Received answer from:', message.peerId);
        const pc = peerConnections.current.get(message.peerId);
        if (pc) {
          try {
            await pc.setRemoteDescription(message.data);
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        }
        break;

      case 'ice-candidate':
        console.log('Received ICE candidate from:', message.peerId);
        const peerConnection = peerConnections.current.get(message.peerId);
        if (peerConnection) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
        break;

      case 'user-left':
        console.log('User left:', message.peerId);
        const leavingPc = peerConnections.current.get(message.peerId);
        if (leavingPc) {
          leavingPc.close();
          peerConnections.current.delete(message.peerId);
        }
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(message.peerId);
          return newMap;
        });
        setConnectedPeers(prev => {
          const newSet = new Set(prev);
          newSet.delete(peerId);
          return newSet;
        });
        break;
    }
  }, [createPeerConnection]);

  const initializeWebRTC = useCallback(async (audioOnly: boolean = false, tileSize: 'small' | 'medium' | 'large' = 'medium') => {
    if (isInitialized.current || !meetingId || !userId) {
      console.log('WebRTC already initialized or missing meetingId/userId');
      return;
    }

    try {
      setConnectionState('connecting');
      console.log('Initializing WebRTC for meeting:', meetingId, 'user:', userId);

      // Get user media
      const constraints = getOptimizedConstraints(audioOnly, tileSize);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Apply immediate optimizations to tracks
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
        await audioTrack.applyConstraints({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        });
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && !audioOnly) {
        await videoTrack.applyConstraints({
          ...constraints.video as MediaTrackConstraints,
          advanced: [{ 
            width: { min: 320, ideal: 640, max: 1280 },
            height: { min: 240, ideal: 480, max: 720 },
            frameRate: { min: 15, ideal: 25, max: 30 }
          }]
        });
      }
      
      setLocalStream(stream);
      setIsVideoOff(audioOnly);

      // Setup video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        localVideoRef.current.autoplay = true;
        localVideoRef.current.style.transform = 'translateZ(0)';
        localVideoRef.current.style.willChange = 'transform';
      }

      // Initialize signaling service
      signalingService.current = new WebRTCSignalingService(meetingId, userId);
      await signalingService.current.connect(handleSignalingMessage);

      setConnectionState('connected');
      isInitialized.current = true;
      console.log('WebRTC initialized successfully');

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setConnectionState('disconnected');
      throw error;
    }
  }, [meetingId, userId, getOptimizedConstraints, handleSignalingMessage]);

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
          suppressLocalAudioPlayback: true
        }
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      screenStream.current = stream;
      setIsScreenSharing(true);

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
    
    // Disconnect signaling
    if (signalingService.current) {
      signalingService.current.disconnect();
      signalingService.current = null;
    }

    // Stop local streams
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

    // Reset state
    setLocalStream(null);
    setRemoteStreams(new Map());
    setConnectedPeers(new Set());
    setIsScreenSharing(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setConnectionState('disconnected');
    isInitialized.current = false;
  }, [localStream]);

  // Performance optimization effect
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      const video = localVideoRef.current;
      video.srcObject = localStream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      
      // Hardware acceleration and performance optimizations
      video.style.objectFit = 'cover';
      video.style.transform = 'translateZ(0)';
      video.style.willChange = 'transform';
      video.preload = 'metadata';
    }
  }, [localStream]);

  return {
    localStream,
    remoteStreams,
    connectedPeers,
    connectionState,
    isMuted,
    isVideoOff,
    isScreenSharing,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    initializeWebRTC,
    cleanupWebRTC,
    localVideoRef
  };
};
