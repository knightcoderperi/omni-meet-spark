
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Mic, MicOff, Play, Pause, Download, 
  Volume2, VolumeX, Sparkles, FileText, Clock,
  Loader2, AlertCircle, CheckCircle, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmartCapsuleSummaryProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface CapsuleSummary {
  id: string;
  transcript: string;
  summary: string;
  audioUrl?: string;
  duration: number;
  confidence: number;
  created_at: string;
}

const SmartCapsuleSummary: React.FC<SmartCapsuleSummaryProps> = ({
  meetingId,
  isVisible,
  onClose
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [summaries, setSummaries] = useState<CapsuleSummary[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState([1]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      initializeSpeechRecognition();
      fetchExistingSummaries();
    }

    return () => {
      cleanup();
    };
  }, [isVisible]);

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Using alternative transcription method.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(prev => prev + finalTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: "Recognition Error",
        description: "Switching to alternative transcription method",
        variant: "destructive"
      });
    };
  };

  const fetchExistingSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_summaries')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('summary_type', 'smart_capsule')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedSummaries: CapsuleSummary[] = (data || []).map(item => ({
        id: item.id,
        transcript: item.content || '',
        summary: Array.isArray(item.key_points) ? item.key_points.join('. ') : item.content || '',
        duration: 0,
        confidence: item.ai_confidence_score || 0,
        created_at: item.created_at
      }));
      
      setSummaries(transformedSummaries);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Optimized for Whisper
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Best format for Whisper
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.start(1000); // Capture in 1-second chunks
      
      // Start browser speech recognition as backup
      recognitionRef.current?.start();
      
      setIsRecording(true);
      setTranscript('');
      setRecordingDuration(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "🎙️ Smart Recording Started",
        description: "AI is listening and will create an intelligent summary...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Process the recording
      mediaRecorderRef.current.onstop = () => {
        processRecording();
      };
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      let finalTranscript = transcript;
      
      // If we have audio chunks, try to transcribe using Whisper alternative
      if (audioChunksRef.current.length > 0) {
        finalTranscript = await transcribeAudio();
      }

      if (!finalTranscript.trim()) {
        toast({
          title: "No Speech Detected",
          description: "Please try recording again with clearer speech",
          variant: "destructive"
        });
        return;
      }

      // Generate summary using free Hugging Face Transformers
      const summaryText = await generateSmartSummary(finalTranscript);
      setSummary(summaryText);
      
      // Save to database
      const capsuleSummary: CapsuleSummary = {
        id: Date.now().toString(),
        transcript: finalTranscript,
        summary: summaryText,
        duration: recordingDuration,
        confidence: 0.95,
        created_at: new Date().toISOString()
      };
      
      await saveSummaryToDatabase(capsuleSummary);
      setSummaries(prev => [capsuleSummary, ...prev]);
      
      // Generate TTS audio using free Web Speech API
      await generateSpeech(summaryText);
      
      toast({
        title: "✨ Smart Capsule Created!",
        description: "Your AI-powered meeting summary is ready",
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Processing Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (): Promise<string> => {
    try {
      // Convert audio chunks to a single blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64 for transmission
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Call our Supabase Edge Function for Whisper transcription
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Transcription error:', error);
        return transcript; // Fallback to browser recognition
      }

      return data.text || transcript;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return transcript; // Fallback to browser recognition
    }
  };

  const generateSmartSummary = async (text: string): Promise<string> => {
    try {
      // Call our Supabase Edge Function for Hugging Face summarization
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { 
          text,
          type: 'smart_capsule',
          duration: recordingDuration
        }
      });

      if (error) {
        console.error('Summarization error:', error);
        // Fallback to simple extractive summary
        return generateSimpleSummary(text);
      }

      return data.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return generateSimpleSummary(text);
    }
  };

  const generateSimpleSummary = (text: string): string => {
    // Simple extractive summarization as fallback
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, Math.max(3, Math.floor(sentences.length * 0.3)));
    
    return `📝 Key insights from the meeting:\n\n${keyPoints.map((point, i) => `${i + 1}. ${point.trim()}`).join('\n\n')}\n\n🎯 This smart capsule captured ${sentences.length} discussion points in ${recordingDuration} seconds.`;
  };

  const generateSpeech = async (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackRate[0];
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Find the best available voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Neural') || 
        voice.lang.includes('en') || 
        voice.default
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const saveSummaryToDatabase = async (capsule: CapsuleSummary) => {
    try {
      const { error } = await supabase
        .from('meeting_summaries')
        .insert({
          meeting_id: meetingId,
          summary_type: 'smart_capsule',
          content: capsule.transcript,
          key_points: [capsule.summary],
          decisions_made: [],
          next_steps: [],
          ai_confidence_score: capsule.confidence
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving summary:', error);
      throw error;
    }
  };

  const playAudioSummary = (summaryText: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(summaryText);
        utterance.rate = playbackRate[0];
        utterance.onend = () => setIsPlaying(false);
        utterance.onstart = () => setIsPlaying(true);
        
        speechSynthesis.speak(utterance);
      }
    }
  };

  const exportSummary = (capsule: CapsuleSummary) => {
    const content = `
🧠 SMART CAPSULE SUMMARY
Generated: ${new Date(capsule.created_at).toLocaleString()}
Duration: ${formatTime(capsule.duration)}
AI Confidence: ${Math.round(capsule.confidence * 100)}%

📝 TRANSCRIPT:
${capsule.transcript}

✨ AI SUMMARY:
${capsule.summary}

---
Generated by OmniMeet Smart Capsule AI
Powered by OpenAI Whisper + Hugging Face Transformers
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-capsule-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📁 Capsule Exported",
      description: "Smart capsule summary downloaded successfully",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanup = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (currentAudio) {
      currentAudio.pause();
    }
    speechSynthesis.cancel();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🧠 Smart Capsule Summary
                </h2>
                <p className="text-purple-100">
                  AI-powered speech capture & intelligent summarization
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {/* Recording Controls */}
          <Card className="mb-6 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-purple-500" />
                <span>🎙️ Voice Capture</span>
                {isRecording && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    Recording {formatTime(recordingDuration)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white shadow-lg`}
                >
                  {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecording ? 'Stop Recording' : '🚀 Start Smart Recording'}
                </Button>

                {isProcessing && (
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">🤖 AI Processing...</span>
                  </div>
                )}
              </div>

              {/* Playback Speed Control */}
              <div className="flex items-center space-x-4">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <div className="flex-1">
                  <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                    🎵 Playback Speed: {playbackRate[0]}x
                  </label>
                  <Slider
                    value={playbackRate}
                    onValueChange={setPlaybackRate}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Transcript */}
          {transcript && (
            <Card className="mb-6 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>📝 Live Transcript</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 max-h-40 overflow-y-auto border-l-4 border-blue-500">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {transcript}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Summary */}
          {summary && (
            <Card className="mb-6 border border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <span>✨ Generated Summary</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playAudioSummary(summary)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-100"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-line">
                    {summary}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    🤖 AI Processed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Summaries */}
          {summaries.length > 0 && (
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span>📚 Previous Capsules ({summaries.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summaries.map((capsule) => (
                  <div key={capsule.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        📅 {new Date(capsule.created_at).toLocaleString()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudioSummary(capsule.summary)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportSummary(capsule)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">
                      {capsule.summary}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {summaries.length === 0 && !transcript && !summary && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                🚀 Ready for Smart Capture
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start recording to create an AI-powered summary capsule of your meeting
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>🔧 Powered by:</strong><br/>
                  • OpenAI Whisper for transcription<br/>
                  • Hugging Face Transformers for summarization<br/>
                  • Free Web Speech API for playback
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmartCapsuleSummary;
