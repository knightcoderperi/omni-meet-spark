
interface AudioChunk {
  audio: Blob;
  timestamp: number;
  duration: number;
}

interface TranscribedSegment {
  text: string;
  timestamp: number;
  duration: number;
}

class MeetingAudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: AudioChunk[] = [];
  private transcribedSegments: TranscribedSegment[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private recordingStartTime = 0;

  async startMeetingRecording(): Promise<void> {
    try {
      // Get audio from microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.recordingStartTime = Date.now();
      this.isRecording = true;

      let tempChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          tempChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (tempChunks.length > 0) {
          const audioBlob = new Blob(tempChunks, { type: 'audio/webm' });
          const chunk: AudioChunk = {
            audio: audioBlob,
            timestamp: Date.now() - this.recordingStartTime,
            duration: 5000 // 5 second chunks
          };
          this.audioChunks.push(chunk);
          tempChunks = [];
        }
      };

      // Record in 5-second chunks
      this.mediaRecorder.start();
      
      // Create recurring chunks every 5 seconds
      setInterval(() => {
        if (this.isRecording && this.mediaRecorder?.state === 'recording') {
          this.mediaRecorder.stop();
          setTimeout(() => {
            if (this.isRecording && this.mediaRecorder) {
              this.mediaRecorder.start();
            }
          }, 100);
        }
      }, 5000);

      console.log('Meeting audio recording started');
    } catch (error) {
      console.error('Failed to start meeting recording:', error);
      throw error;
    }
  }

  async getTranscribedTimeframe(minutes: number): Promise<{ fullTranscript: string }> {
    const targetDuration = minutes * 60 * 1000; // Convert to milliseconds
    const currentTime = Date.now() - this.recordingStartTime;
    const startTime = Math.max(0, currentTime - targetDuration);

    // Get audio chunks from the specified timeframe
    const relevantChunks = this.audioChunks.filter(chunk => 
      chunk.timestamp >= startTime && chunk.timestamp <= currentTime
    );

    if (relevantChunks.length === 0) {
      return { fullTranscript: 'No audio available for the specified timeframe.' };
    }

    // Transcribe each chunk and combine
    const transcripts: string[] = [];
    
    for (const chunk of relevantChunks) {
      try {
        const transcript = await this.transcribeAudio(chunk.audio);
        if (transcript && transcript.trim() && !transcript.includes('No speech detected')) {
          transcripts.push(transcript);
        }
      } catch (error) {
        console.error('Error transcribing chunk:', error);
      }
    }

    const fullTranscript = transcripts.join(' ').trim();
    return { 
      fullTranscript: fullTranscript || 'No speech detected in the specified timeframe.' 
    };
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));

      // Call Supabase edge function for transcription
      const { data, error } = await import('@/integrations/supabase/client').then(module => 
        module.supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        })
      );

      if (error) {
        console.error('Transcription error:', error);
        return 'Transcription failed';
      }

      return data?.text || 'No speech detected';
    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      return 'Transcription error';
    }
  }

  getEntireMeetingAudio(): { chunks: AudioChunk[] } {
    return { chunks: [...this.audioChunks] };
  }

  startRealTimeCapture(onAudioChunk: (audioBlob: Blob) => void): void {
    // This would start continuous real-time capture
    // For now, we'll use the existing chunks
    const interval = setInterval(() => {
      if (this.audioChunks.length > 0) {
        const latestChunk = this.audioChunks[this.audioChunks.length - 1];
        onAudioChunk(latestChunk.audio);
      }
    }, 5000);

    // Store interval ID for cleanup
    (this as any).realTimeInterval = interval;
  }

  cleanup(): void {
    this.isRecording = false;
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if ((this as any).realTimeInterval) {
      clearInterval((this as any).realTimeInterval);
    }

    console.log('Meeting audio processor cleaned up');
  }
}

export default MeetingAudioProcessor;
