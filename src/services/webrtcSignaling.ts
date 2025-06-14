
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'participant-update';
  peerId: string;
  targetPeerId?: string;
  data?: any;
  meetingCode: string;
  timestamp: number;
  participantInfo?: {
    name: string;
    isHost: boolean;
  };
}

export class WebRTCSignalingService {
  private channel: RealtimeChannel | null = null;
  private meetingCode: string;
  private userId: string;
  private participantName: string;
  private isHost: boolean;
  private onMessageCallback?: (message: SignalingMessage) => void;
  private connectionRetryCount = 0;
  private maxRetries = 3;

  constructor(meetingCode: string, userId: string, participantName: string, isHost: boolean = false) {
    this.meetingCode = this.normalizeeMeetingCode(meetingCode);
    this.userId = userId;
    this.participantName = participantName;
    this.isHost = isHost;
    
    console.log('🚀 WebRTC Signaling Service initialized:', {
      meetingCode: this.meetingCode,
      userId: this.userId,
      participantName: this.participantName,
      isHost: this.isHost
    });
  }

  private normalizeeMeetingCode(code: string): string {
    // Normalize meeting codes to prevent case sensitivity issues
    return code.toUpperCase().trim();
  }

  private generateRoomId(): string {
    // Create consistent room ID from meeting code
    return `meeting-${this.meetingCode}`;
  }

  connect(onMessage: (message: SignalingMessage) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onMessageCallback = onMessage;
      const roomId = this.generateRoomId();
      
      console.log('🔌 Connecting to signaling channel:', roomId);
      
      this.channel = supabase
        .channel(roomId)
        .on('broadcast', { event: 'webrtc-signal' }, (payload) => {
          const message = payload.payload as SignalingMessage;
          
          console.log('📨 Received signaling message:', {
            type: message.type,
            from: message.peerId,
            to: message.targetPeerId || 'broadcast',
            meetingCode: message.meetingCode
          });
          
          // Validate message is for correct meeting
          if (message.meetingCode !== this.meetingCode) {
            console.warn('⚠️ Ignoring message for different meeting:', message.meetingCode);
            return;
          }
          
          // Only process messages not from ourselves and either targeted to us or broadcast
          if (message.peerId !== this.userId && 
              (!message.targetPeerId || message.targetPeerId === this.userId)) {
            this.onMessageCallback?.(message);
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const presenceState = this.channel?.presenceState();
          console.log('👥 Presence sync:', presenceState);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('➕ New participant joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('➖ Participant left:', leftPresences);
        })
        .subscribe(async (status) => {
          console.log('📡 Channel status:', status);
          
          if (status === 'SUBSCRIBED') {
            // Track presence
            await this.channel?.track({
              userId: this.userId,
              participantName: this.participantName,
              isHost: this.isHost,
              joinedAt: Date.now(),
              meetingCode: this.meetingCode
            });
            
            console.log('✅ WebRTC signaling connected for meeting:', this.meetingCode);
            
            // Announce our presence with participant info
            this.sendMessage({
              type: 'user-joined',
              peerId: this.userId,
              meetingCode: this.meetingCode,
              timestamp: Date.now(),
              participantInfo: {
                name: this.participantName,
                isHost: this.isHost
              },
              data: { 
                timestamp: Date.now(),
                participantName: this.participantName,
                isHost: this.isHost
              }
            });
            
            this.connectionRetryCount = 0;
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel connection error');
            this.handleConnectionError(reject);
          } else if (status === 'CLOSED') {
            console.warn('⚠️ Channel closed unexpectedly');
            if (this.connectionRetryCount < this.maxRetries) {
              this.retryConnection(onMessage);
            }
          }
        });
    });
  }

  private handleConnectionError(reject: (reason?: any) => void) {
    if (this.connectionRetryCount < this.maxRetries) {
      this.connectionRetryCount++;
      console.log(`🔄 Retrying connection (${this.connectionRetryCount}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.retryConnection(this.onMessageCallback!);
      }, 2000 * this.connectionRetryCount); // Exponential backoff
    } else {
      reject(new Error('Failed to connect to signaling channel after multiple retries'));
    }
  }

  private retryConnection(onMessage: (message: SignalingMessage) => void) {
    this.disconnect();
    this.connect(onMessage);
  }

  sendMessage(message: SignalingMessage): void {
    if (!this.channel) {
      console.error('❌ Signaling channel not connected');
      return;
    }

    // Ensure message has correct meeting code and timestamp
    const messageWithMetadata = {
      ...message,
      meetingCode: this.meetingCode,
      timestamp: message.timestamp || Date.now()
    };

    console.log('📤 Sending signaling message:', {
      type: messageWithMetadata.type,
      to: messageWithMetadata.targetPeerId || 'broadcast',
      meetingCode: messageWithMetadata.meetingCode
    });

    this.channel.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: messageWithMetadata
    });
  }

  sendOffer(targetPeerId: string, offer: RTCSessionDescriptionInit): void {
    console.log('📝 Sending offer to:', targetPeerId);
    this.sendMessage({
      type: 'offer',
      peerId: this.userId,
      targetPeerId,
      meetingCode: this.meetingCode,
      timestamp: Date.now(),
      data: offer
    });
  }

  sendAnswer(targetPeerId: string, answer: RTCSessionDescriptionInit): void {
    console.log('✅ Sending answer to:', targetPeerId);
    this.sendMessage({
      type: 'answer',
      peerId: this.userId,
      targetPeerId,
      meetingCode: this.meetingCode,
      timestamp: Date.now(),
      data: answer
    });
  }

  sendIceCandidate(targetPeerId: string, candidate: RTCIceCandidateInit): void {
    console.log('🧊 Sending ICE candidate to:', targetPeerId);
    this.sendMessage({
      type: 'ice-candidate',
      peerId: this.userId,
      targetPeerId,
      meetingCode: this.meetingCode,
      timestamp: Date.now(),
      data: candidate
    });
  }

  sendParticipantUpdate(participants: any[]): void {
    this.sendMessage({
      type: 'participant-update',
      peerId: this.userId,
      meetingCode: this.meetingCode,
      timestamp: Date.now(),
      data: { participants }
    });
  }

  getConnectedParticipants(): any[] {
    if (!this.channel) return [];
    
    const presenceState = this.channel.presenceState();
    const participants: any[] = [];
    
    Object.values(presenceState).forEach((presences: any) => {
      presences.forEach((presence: any) => {
        if (presence.meetingCode === this.meetingCode) {
          participants.push({
            userId: presence.userId,
            name: presence.participantName,
            isHost: presence.isHost,
            joinedAt: presence.joinedAt
          });
        }
      });
    });
    
    return participants;
  }

  disconnect(): void {
    if (this.channel) {
      console.log('📡 Disconnecting from signaling channel');
      
      // Announce we're leaving
      this.sendMessage({
        type: 'user-left',
        peerId: this.userId,
        meetingCode: this.meetingCode,
        timestamp: Date.now(),
        data: { 
          timestamp: Date.now(),
          participantName: this.participantName
        }
      });
      
      // Untrack presence
      this.channel.untrack();
      
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
