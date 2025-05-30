
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Settings, Monitor, 
  Sun, Moon, Volume2, Camera, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Meeting {
  id: string;
  title: string;
  meeting_code: string;
  host_id: string;
  is_active: boolean;
}

interface PreJoinScreenProps {
  meeting: Meeting | null;
  onJoin: (userName: string, audioOnly: boolean) => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

const PreJoinScreen: React.FC<PreJoinScreenProps> = ({
  meeting,
  onJoin,
  onThemeToggle,
  theme
}) => {
  const [userName, setUserName] = useState('');
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializePreview();
    getDevices();
    
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializePreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVideoOff,
        audio: true
      });
      
      setPreviewStream(stream);
      
      if (videoRef.current && !isVideoOff) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      
      if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const toggleVideo = async () => {
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);
    
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !newVideoState ? { deviceId: selectedVideoDevice } : false,
        audio: { deviceId: selectedAudioDevice }
      });
      
      setPreviewStream(stream);
      
      if (videoRef.current && !newVideoState) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const toggleMute = () => {
    if (previewStream) {
      const audioTrack = previewStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const handleJoin = async () => {
    if (!userName.trim()) {
      return;
    }
    
    setIsLoading(true);
    await onJoin(userName, isVideoOff);
  };

  const testSpeaker = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEfBSuBzvPXiTQIG2m98OScSwwOUarm7blnIAY9k9n1y3UqBSl+zPLbizEIF2+/7eCcUAwKVK3r8rBrHgU7k9n1y3UqBSl+zPLbizEIF2+/7eCcUAwKVK3r8rBrHgU7l9v1yXEoBSJ+zPHaizEIF2+/7eCcUAwKVK3r8rBrHgU7l9v1yXEoBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEoBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEoBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEoBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEoBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7l9v1yXEqBSJ+zPHaizEIF26/7uGbUAwKVK3r8rBrHgU7');
    audio.play().catch(() => {
      console.log('Speaker test requires user interaction');
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'UN';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-64 h-64 bg-purple-400/20 dark:bg-purple-500/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-slate-200/50 dark:border-white/10 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {meeting?.title || 'Join Meeting'}
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-sm">
                      Get ready to join • {meeting?.meeting_code}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={onThemeToggle}
                  className="relative w-12 h-6 rounded-full p-0 bg-slate-200 dark:bg-slate-700"
                >
                  <motion.div
                    className="absolute w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-400 dark:to-blue-600 rounded-full shadow-lg"
                    animate={{
                      x: theme === 'dark' ? 2 : 26,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-1">
                    <Moon className="w-3 h-3 text-slate-600" />
                    <Sun className="w-3 h-3 text-slate-600" />
                  </div>
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Camera Preview
                </h3>
                
                <Card className="relative overflow-hidden bg-black aspect-video">
                  {!isVideoOff ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                      <motion.div 
                        className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {getInitials(userName)}
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Preview Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <Button
                      variant={isMuted ? "destructive" : "secondary"}
                      className="rounded-full w-10 h-10"
                      onClick={toggleMute}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant={isVideoOff ? "destructive" : "secondary"}
                      className="rounded-full w-10 h-10"
                      onClick={toggleVideo}
                    >
                      {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Join Settings */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Join Settings
                </h3>
                
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-gray-300">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-white/80 dark:bg-black/40 border-slate-200 dark:border-slate-600"
                  />
                </div>

                {/* Audio Device Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-gray-300">
                    Microphone
                  </Label>
                  <select
                    value={selectedAudioDevice}
                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300"
                  >
                    {audioDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testSpeaker}
                    className="mt-2"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Test Speaker
                  </Button>
                </div>

                {/* Camera Device Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-gray-300">
                    Camera
                  </Label>
                  <select
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300"
                  >
                    {videoDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Join Options */}
                <div className="flex flex-col space-y-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleJoin}
                      disabled={!userName.trim() || isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium text-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Joining...</span>
                        </div>
                      ) : (
                        <>
                          <Video className="w-5 h-5 mr-2" />
                          Join Meeting
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleJoin()}
                      disabled={!userName.trim() || isLoading}
                      className="w-full h-12 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-300 rounded-xl"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Join with Audio Only
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PreJoinScreen;
