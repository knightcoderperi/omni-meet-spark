
interface AudioChunk {
  audio: Blob;
  duration: number;
  timestamp: number;
  transcript?: string;
}

interface AudioTimeframe {
  start: number;
  end: number;
  chunks: AudioChunk[];
}

export class MeetingAudioProcessor {
  private audioBuffer = new Map<number, AudioChunk>();
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private chunkInterval: number | null = null;
  private readonly CHUNK_DURATION = 30000; // 30 seconds
  private readonly MAX_BUFFER_TIME = 1800000; // 30 minutes

  constructor() {
    this.initializeAudioRecording();
  }

  private async initializeAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveCurrentChunk();
      };
    } catch (error) {
      console.error('Failed to initialize audio recording:', error);
    }
  }

  startMeetingRecording(): void {
    if (!this.mediaRecorder || this.isRecording) return;
    
    this.isRecording = true;
    this.mediaRecorder.start();
    
    // Create chunks every 30 seconds
    this.chunkInterval = window.setInterval(() => {
      if (this.isRecording && this.mediaRecorder) {
        this.mediaRecorder.stop();
        setTimeout(() => {
          if (this.isRecording && this.mediaRecorder) {
            this.mediaRecorder.start();
          }
        }, 100);
      }
    }, this.CHUNK_DURATION);
  }

  stopMeetingRecording(): void {
    this.isRecording = false;
    
    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
      this.chunkInterval = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private saveCurrentChunk(): void {
    if (this.audioChunks.length === 0) return;
    
    const timestamp = Date.now();
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    
    const chunk: AudioChunk = {
      audio: audioBlob,
      duration: this.CHUNK_DURATION,
      timestamp
    };
    
    this.audioBuffer.set(timestamp, chunk);
    this.audioChunks = [];
    
    // Clean old chunks to prevent memory issues
    this.cleanOldAudioChunks();
  }

  private cleanOldAudioChunks(): void {
    const currentTime = Date.now();
    const cutoffTime = currentTime - this.MAX_BUFFER_TIME;
    
    for (const [timestamp] of this.audioBuffer) {
      if (timestamp < cutoffTime) {
        this.audioBuffer.delete(timestamp);
      }
    }
  }

  getAudioForTimeframe(minutes: number): AudioTimeframe {
    const currentTime = Date.now();
    const targetTime = currentTime - (minutes * 60 * 1000);
    
    const relevantChunks = Array.from(this.audioBuffer.entries())
      .filter(([timestamp]) => timestamp >= targetTime)
      .map(([_, chunk]) => chunk)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return {
      start: targetTime,
      end: currentTime,
      chunks: relevantChunks
    };
  }

  getEntireMeetingAudio(): AudioTimeframe {
    const allChunks = Array.from(this.audioBuffer.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    if (allChunks.length === 0) {
      return {
        start: Date.now(),
        end: Date.now(),
        chunks: []
      };
    }
    
    return {
      start: allChunks[0].timestamp,
      end: allChunks[allChunks.length - 1].timestamp,
      chunks: allChunks
    };
  }

  async getLastFewSeconds(seconds: number): Promise<Blob | null> {
    // For real-time translation, get the most recent audio
    const recentChunks = Array.from(this.audioBuffer.values())
      .filter(chunk => (Date.now() - chunk.timestamp) < (seconds * 1000))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (recentChunks.length === 0) return null;
    
    const audioBlobs = recentChunks.map(chunk => chunk.audio);
    return new Blob(audioBlobs, { type: 'audio/webm' });
  }

  async mergeAudioChunks(chunks: Blob[]): Promise<Blob> {
    return new Blob(chunks, { type: 'audio/webm' });
  }

  // Convert audio to text using Web Speech API or external service
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      // This is a simplified implementation
      // In production, you'd use a proper transcription service
      
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resolve('[Audio transcription not available - would use external service like Whisper API]');
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      let transcript = '';
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
      };
      
      recognition.onend = () => {
        resolve(transcript.trim() || '[No speech detected in audio segment]');
      };
      
      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      // Convert blob to audio URL and play for recognition
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => {
        recognition.start();
      };
      
      audio.onended = () => {
        recognition.stop();
      };
      
      audio.play();
    });
  }

  // Get audio chunks with their transcripts
  async getTranscribedTimeframe(minutes: number): Promise<{
    timeframe: AudioTimeframe;
    fullTranscript: string;
  }> {
    const timeframe = this.getAudioForTimeframe(minutes);
    
    // Transcribe each chunk if not already done
    const transcriptionPromises = timeframe.chunks.map(async (chunk) => {
      if (!chunk.transcript) {
        try {
          chunk.transcript = await this.transcribeAudio(chunk.audio);
        } catch (error) {
          console.error('Transcription failed for chunk:', error);
          chunk.transcript = '[Transcription failed]';
        }
      }
      return chunk.transcript;
    });
    
    const transcripts = await Promise.all(transcriptionPromises);
    const fullTranscript = transcripts.join('\n\n');
    
    return {
      timeframe,
      fullTranscript
    };
  }

  // Real-time audio capture for live translation
  startRealTimeCapture(callback: (audioBlob: Blob) => void): void {
    if (!this.mediaRecorder) return;
    
    const realTimeRecorder = new MediaRecorder(this.mediaRecorder.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    let chunks: Blob[] = [];
    
    realTimeRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
    realTimeRecorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      callback(audioBlob);
      chunks = [];
    };
    
    // Capture audio every 3 seconds for real-time translation
    const realTimeInterval = setInterval(() => {
      if (realTimeRecorder.state === 'recording') {
        realTimeRecorder.stop();
        setTimeout(() => {
          if (realTimeRecorder.state === 'inactive') {
            realTimeRecorder.start();
          }
        }, 100);
      }
    }, 3000);
    
    realTimeRecorder.start();
    
    // Store the interval for cleanup
    (realTimeRecorder as any).cleanup = () => {
      clearInterval(realTimeInterval);
      if (realTimeRecorder.state === 'recording') {
        realTimeRecorder.stop();
      }
    };
  }

  cleanup(): void {
    this.stopMeetingRecording();
    
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    this.audioBuffer.clear();
  }
}

export default MeetingAudioProcessor;
