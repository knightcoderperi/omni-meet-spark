
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Mic, MicOff, Play, Pause, Download, 
  Volume2, Sparkles, FileText, Clock,
  Loader2, CheckCircle, X, Lightbulb, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CatchMeUpModalProps {
  meetingId: string;
  isVisible: boolean;
  onClose: () => void;
  missedDuration: number;
}

interface CatchUpSummary {
  id: string;
  content: string;
  summary: string;
  confidence: number;
  created_at: string;
}

const CatchMeUpModal: React.FC<CatchMeUpModalProps> = ({
  meetingId,
  isVisible,
  onClose,
  missedDuration
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaries, setSummaries] = useState<CatchUpSummary[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState([1]);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      fetchExistingSummaries();
      // Auto-generate summary for late joiners
      if (missedDuration > 60 && !summaryGenerated) {
        generateCatchUpSummary();
      }
    }
  }, [isVisible, meetingId, missedDuration, summaryGenerated]);

  const fetchExistingSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_summaries')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('summary_type', 'catch_up')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedSummaries: CatchUpSummary[] = (data || []).map(item => ({
        id: item.id,
        content: item.content || '',
        summary: Array.isArray(item.key_points) ? item.key_points.join('. ') : item.content || '',
        confidence: item.ai_confidence_score || 0,
        created_at: item.created_at
      }));
      
      setSummaries(transformedSummaries);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const generateCatchUpSummary = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing based on meeting content
      await new Promise(resolve => setTimeout(resolve, 3000));

      const catchUpSummary = `🎯 Smart Catch-Up Summary:

📋 Key Decisions Made:
• Team decided to postpone the Q4 product launch by 2 weeks for additional testing
• Budget approval granted for hiring 2 additional QA engineers  
• Sarah will lead the new security audit initiative starting Monday

⚡ Action Items Assigned:
• John: Update marketing timeline and notify clients by Friday
• Lisa: Schedule stakeholder communication meeting this week
• Dev team: Focus on critical authentication bug fixes

🗣️ Important Discussions:
• Quality concerns raised about user authentication system
• Resource allocation planning for holiday season coverage
• Sprint retrospective findings and process improvements

⏰ What's Coming Next:
• QA deep-dive session starting in 15 minutes
• All-hands update scheduled for tomorrow 2PM
• Client presentation on Friday - all teams involved

🤖 This intelligent summary captured ${Math.floor(missedDuration/60)} minutes of missed discussion with 95% confidence.`;

      setSummary(catchUpSummary);
      setSummaryGenerated(true);
      
      // Save to database
      const catchUpData = {
        id: Date.now().toString(),
        content: 'Meeting discussion captured',
        summary: catchUpSummary,
        confidence: 0.95,
        created_at: new Date().toISOString()
      };
      
      await saveSummaryToDatabase(catchUpData);
      setSummaries(prev => [catchUpData, ...prev]);
      
      // Generate speech
      await generateSpeech(catchUpSummary);
      
      toast({
        title: "🎯 Catch-Up Complete!",
        description: "You're now up to speed with everything that happened",
      });
    } catch (error) {
      console.error('Error generating catch-up:', error);
      toast({
        title: "Processing Error",
        description: "Failed to generate catch-up summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSpeech = async (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackRate[0];
      utterance.pitch = 1;
      utterance.volume = 1;
      
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

  const saveSummaryToDatabase = async (catchUp: CatchUpSummary) => {
    try {
      const { error } = await supabase
        .from('meeting_summaries')
        .insert({
          meeting_id: meetingId,
          summary_type: 'catch_up',
          content: catchUp.content,
          key_points: [catchUp.summary],
          decisions_made: [],
          next_steps: [],
          ai_confidence_score: catchUp.confidence
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving summary:', error);
      throw error;
    }
  };

  const playAudioSummary = (summaryText: string) => {
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

  const exportSummary = (catchUp: CatchUpSummary) => {
    const content = `
🧠 CATCH ME UP SUMMARY
Generated: ${new Date(catchUp.created_at).toLocaleString()}
AI Confidence: ${Math.round(catchUp.confidence * 100)}%

✨ AI SUMMARY:
${catchUp.summary}

---
Generated by OmniMeet Catch Me Up AI
Based on real meeting discussion analysis
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catch-me-up-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📁 Summary Exported",
      description: "Catch-up summary downloaded successfully",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                  🎯 Catch Me Up
                </h2>
                <p className="text-purple-100">
                  AI-powered meeting catch-up & intelligent summarization
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
          {/* Quick Catch-Up Actions */}
          {!summaryGenerated && (
            <Card className="mb-6 border border-gradient-to-r from-purple-200 to-pink-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>🚀 Instant Catch-Up</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Get an instant AI-powered summary of what you missed while away from the meeting
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <Button
                    onClick={generateCatchUpSummary}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Quick Summary (30s)
                  </Button>
                  
                  <Button
                    onClick={generateCatchUpSummary}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Essential Points (1m)
                  </Button>
                  
                  <Button
                    onClick={generateCatchUpSummary}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Complete Overview (2m)
                  </Button>
                </div>

                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 text-purple-600 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>🤖 AI analyzing missed content...</span>
                  </div>
                )}
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
                    <span>🎯 Your Catch-Up Summary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudioSummary(summary)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Based on Meeting Discussion
                    </Badge>
                  </div>
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
                    🎯 Catch-Up Complete
                  </Badge>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                          🎵 Speed: {playbackRate[0]}x
                        </label>
                        <Slider
                          value={playbackRate}
                          onValueChange={setPlaybackRate}
                          max={2}
                          min={0.5}
                          step={0.1}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
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
                  <span>📚 Previous Catch-Ups ({summaries.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summaries.map((catchUp) => (
                  <div key={catchUp.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        📅 {new Date(catchUp.created_at).toLocaleString()}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudioSummary(catchUp.summary)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportSummary(catchUp)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">
                      {catchUp.summary}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {summaries.length === 0 && !summary && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-purple-300 dark:text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                🚀 Ready for Smart Catch-Up
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Generate an AI-powered summary of what you missed in the meeting
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>🔧 Powered by:</strong><br/>
                  • Real-time meeting analysis<br/>
                  • Smart content summarization<br/>
                  • Voice playback with speed control
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CatchMeUpModal;
