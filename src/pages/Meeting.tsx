
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, Users, MessageSquare, 
  Settings, Share, Record, MoreVertical, Monitor 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Meeting {
  id: string;
  title: string;
  meeting_code: string;
  host_id: string;
  is_active: boolean;
}

const Meeting = () => {
  const { meetingCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (meetingCode) {
      fetchMeeting();
    }
  }, [user, meetingCode, navigate]);

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode)
        .single();

      if (error || !data) {
        toast({
          title: "Meeting not found",
          description: "The meeting code you entered is invalid",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setMeeting(data);
      
      // Add user as participant
      await supabase
        .from('meeting_participants')
        .upsert({
          meeting_id: data.id,
          user_id: user?.id,
          is_host: data.host_id === user?.id
        });

    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast({
        title: "Error",
        description: "Failed to join meeting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveMeeting = async () => {
    if (meeting && user) {
      await supabase
        .from('meeting_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('meeting_id', meeting.id)
        .eq('user_id', user.id);
    }
    navigate('/dashboard');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone unmuted" : "Microphone muted",
      description: isMuted ? "You can now speak" : "Others cannot hear you"
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({
      title: isVideoOff ? "Camera turned on" : "Camera turned off",
      description: isVideoOff ? "Others can now see you" : "Others cannot see you"
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Meeting recording has been saved" : "Meeting is now being recorded"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Main Video Area */}
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-white font-medium">{meeting?.title || 'Meeting'}</h1>
              <span className="text-gray-400 text-sm font-mono">{meetingCode}</span>
              {isRecording && (
                <div className="flex items-center space-x-2 text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Recording</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                <Users className="w-4 h-4 mr-2" />
                {participants}
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {/* Main Video (You) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className="bg-black/40 backdrop-blur-xl border-white/10 h-full min-h-[200px] flex items-center justify-center relative overflow-hidden">
                {isVideoOff ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-xl">
                        {user?.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white font-medium">You</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-white/50 mx-auto mb-2" />
                      <p className="text-white/50">Camera Preview</p>
                    </div>
                  </div>
                )}
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                  {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                  {isVideoOff && <VideoOff className="w-4 h-4 text-red-400" />}
                </div>
                
                <div className="absolute bottom-2 right-2">
                  <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">You</span>
                </div>
              </Card>
            </motion.div>

            {/* Placeholder for other participants */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i + 1) * 0.1 }}
                className="relative"
              >
                <Card className="bg-black/20 backdrop-blur-xl border-white/10 h-full min-h-[200px] flex items-center justify-center border-dashed">
                  <div className="text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Waiting for participants...</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-black/40 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <Button
              onClick={toggleVideo}
              variant={isVideoOff ? "destructive" : "secondary"}
              className={`rounded-full w-12 h-12 ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>

            <Button
              variant="secondary"
              className="rounded-full w-12 h-12 bg-gray-600 hover:bg-gray-700"
            >
              <Monitor className="w-5 h-5" />
            </Button>

            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "secondary"}
              className={`rounded-full w-12 h-12 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              <Record className="w-5 h-5" />
            </Button>

            <Button
              variant="secondary"
              className="rounded-full w-12 h-12 bg-gray-600 hover:bg-gray-700"
            >
              <Share className="w-5 h-5" />
            </Button>

            <Button
              variant="secondary"
              className="rounded-full w-12 h-12 bg-gray-600 hover:bg-gray-700"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>

            <Button
              onClick={leaveMeeting}
              variant="destructive"
              className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
            >
              <Phone className="w-5 h-5 transform rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
