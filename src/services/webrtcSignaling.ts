
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  peerId: string;
  targetPeerId?: string;
  data?: any;
  meetingId: string;
}

export class WebRTCSignalingService {
  private channel: RealtimeChannel | null = null;
  private meetingId: string;
  private userId: string;
  private onMessageCallback?: (message: SignalingMessage) => void;

  constructor(meetingId: string, userId: string) {
    this.meetingId = meetingId;
    this.userId = userId;
  }

  connect(onMessage: (message: SignalingMessage) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onMessageCallback = onMessage;
      
      this.channel = supabase
        .channel(`webrtc-${this.meetingId}`)
        .on('broadcast', { event: 'signaling' }, (payload) => {
          const message = payload.payload as SignalingMessage;
          
          // Only process messages not from ourselves and either targeted to us or broadcast
          if (message.peerId !== this.userId && 
              (!message.targetPeerId || message.targetPeerId === this.userId)) {
            this.onMessageCallback?.(message);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('WebRTC signaling connected for meeting:', this.meetingId);
            // Announce our presence
            this.sendMessage({
              type: 'user-joined',
              peerId: this.userId,
              meetingId: this.meetingId,
              data: { timestamp: Date.now() }
            });
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error('Failed to connect to signaling channel'));
          }
        });
    });
  }

  sendMessage(message: SignalingMessage): void {
    if (!this.channel) {
      console.error('Signaling channel not connected');
      return;
    }

    this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message
    });
  }

  sendOffer(targetPeerId: string, offer: RTCSessionDescriptionInit): void {
    this.sendMessage({
      type: 'offer',
      peerId: this.userId,
      targetPeerId,
      meetingId: this.meetingId,
      data: offer
    });
  }

  sendAnswer(targetPeerId: string, answer: RTCSessionDescriptionInit): void {
    this.sendMessage({
      type: 'answer',
      peerId: this.userId,
      targetPeerId,
      meetingId: this.meetingId,
      data: answer
    });
  }

  sendIceCandidate(targetPeerId: string, candidate: RTCIceCandidateInit): void {
    this.sendMessage({
      type: 'ice-candidate',
      peerId: this.userId,
      targetPeerId,
      meetingId: this.meetingId,
      data: candidate
    });
  }

  disconnect(): void {
    if (this.channel) {
      // Announce we're leaving
      this.sendMessage({
        type: 'user-left',
        peerId: this.userId,
        meetingId: this.meetingId,
        data: { timestamp: Date.now() }
      });
      
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
