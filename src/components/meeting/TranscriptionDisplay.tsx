
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Settings, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIFeatures } from '@/hooks/useAIFeatures';

interface TranscriptionDisplayProps {
  meetingId: string;
  isVisible: boolean;
  onToggle: () => void;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  meetingId,
  isVisible,
  onToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const { transcriptions, fetchTranscriptions } = useAIFeatures(meetingId);

  useEffect(() => {
    if (isVisible) {
      fetchTranscriptions();
      
      // Set up real-time subscription for new transcriptions
      const interval = setInterval(fetchTranscriptions, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible, fetchTranscriptions]);

  const filteredTranscriptions = transcriptions.filter(transcript =>
    transcript.transcript_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would integrate with actual speech-to-text service
  };

  const exportTranscript = () => {
    const fullTranscript = transcriptions
      .map(t => `[${Math.floor(t.start_time)}s] ${t.transcript_text}`)
      .join('\n');
    
    const blob = new Blob([fullTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-4 w-96 h-80 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Mic className="w-5 h-5 text-blue-500" />
                <span>Live Transcription</span>
                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse">
                    Recording
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  className={isRecording ? 'text-red-500' : 'text-slate-500'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={exportTranscript}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[calc(100%-5rem)]">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Transcript List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredTranscriptions.length > 0 ? (
                filteredTranscriptions.map((transcript) => (
                  <motion.div
                    key={transcript.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(transcript.start_time)}s
                      </Badge>
                      <Badge 
                        variant={transcript.confidence_score > 0.8 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {Math.round(transcript.confidence_score * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-white leading-relaxed">
                      {searchTerm ? (
                        transcript.transcript_text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, index) =>
                          part.toLowerCase() === searchTerm.toLowerCase() ? (
                            <mark key={index} className="bg-yellow-200 dark:bg-yellow-700">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )
                      ) : (
                        transcript.transcript_text
                      )}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Mic className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm text-center">
                    {isRecording ? 'Listening...' : 'Start recording to see live transcription'}
                  </p>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isRecording ? 'Live' : 'Stopped'}</span>
              </div>
              <span className="text-xs text-slate-500">
                {transcriptions.length} segments
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default TranscriptionDisplay;
