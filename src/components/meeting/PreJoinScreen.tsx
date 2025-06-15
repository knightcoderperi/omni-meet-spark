
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Settings, Monitor, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PreJoinScreenProps {
  meeting: any;
  onJoin: (userName: string, audioOnly: boolean) => void;
  onThemeToggle: () => void;
  theme: string;
}

const PreJoinScreen: React.FC<PreJoinScreenProps> = ({
  meeting,
  onJoin,
  onThemeToggle,
  theme
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState(user?.user_metadata?.full_name || user?.email || '');
  const [audioOnly, setAudioOnly] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [devicePermissions, setDevicePermissions] = useState({
    camera: false,
    microphone: false
  });
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    checkDevicePermissions();
    if (!audioOnly) {
      startPreview();
    }
    
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioOnly]);

  const checkDevicePermissions = async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setDevicePermissions(prev => ({
        ...prev,
        camera: permissions.state === 'granted'
      }));
    } catch (error) {
      console.warn('Could not check camera permissions:', error);
    }
  };

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !audioOnly,
        audio: true
      });
      setPreviewStream(stream);
      setDevicePermissions({
        camera: !audioOnly,
        microphone: true
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const addToLobbyQueue = async () => {
    if (!meeting?.id) return false;

    try {
      const { error } = await supabase
        .from('lobby_queue')
        .upsert({
          meeting_id: meeting.id,
          user_id: user?.id || null,
          guest_name: user ? null : userName,
          email: user?.email || null,
          approval_status: 'pending',
          device_info: {
            userAgent: navigator.userAgent,
            audioOnly
          }
        }, {
          onConflict: user?.id ? 'user_id,meeting_id' : 'guest_name,meeting_id'
        });

      if (error) {
        console.error('Error adding to lobby queue:', error);
        toast({
          title: "Error",
          description: "Failed to join meeting lobby",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addToLobbyQueue:', error);
      return false;
    }
  };

  const addAsParticipant = async () => {
    if (!meeting?.id) return false;

    try {
      console.log('Adding participant with upsert for meeting:', meeting.id, 'user:', user?.id);
      
      // Use the new unique constraint that was created in the migration
      const { error } = await supabase
        .from('meeting_participants')
        .upsert({
          meeting_id: meeting.id,
          user_id: user?.id || null,
          guest_name: user ? null : userName,
          email: user?.email || null,
          status: 'approved',
          is_host: user?.id === meeting.host_id,
          device_info: {
            userAgent: navigator.userAgent,
            audioOnly
          }
        }, {
          onConflict: 'meeting_id,user_id'
        });

      if (error) {
        console.error('Error adding participant:', error);
        toast({
          title: "Error",
          description: "Failed to join meeting",
          variant: "destructive"
        });
        return false;
      }

      console.log('Successfully added/updated participant');
      return true;
    } catch (error) {
      console.error('Error in addAsParticipant:', error);
      return false;
    }
  };

  const handleJoin = async () => {
    if (isJoining || !meeting) return;
    
    setIsJoining(true);
    console.log('Starting join process for meeting:', meeting.id, 'user:', user?.id);
    
    try {
      // Stop preview stream
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }

      const isHost = user?.id === meeting.host_id;
      const requiresApproval = meeting.require_approval && !isHost;

      console.log('Join settings:', { isHost, requiresApproval });

      // Handle joining logic based on approval requirements
      if (requiresApproval) {
        // Add to lobby queue for approval
        const success = await addToLobbyQueue();
        if (!success) {
          setIsJoining(false);
          return;
        }
        
        toast({
          title: "Waiting for approval",
          description: "The host will review your request to join the meeting",
        });
        
        // For now, we'll still proceed to onJoin to show the waiting screen
        // The actual meeting room access will be controlled by the lobby system
      } else {
        // Direct join - add as participant immediately
        const success = await addAsParticipant();
        if (!success) {
          setIsJoining(false);
          return;
        }
      }

      // Proceed to join with consistent room ID (using meeting.id)
      console.log('Successfully processed join request, proceeding to meeting room');
      onJoin(userName, audioOnly);
      
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Error",
        description: "Failed to join meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/95 dark:bg-black/30 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-2xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.img 
                src="/lovable-uploads/2d81a553-9d58-4ba7-94bd-f014ebe9d554.png" 
                alt="OmniMeet" 
                className="h-12 w-auto object-contain mx-auto mb-4"
                whileHover={{ scale: 1.05 }}
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Join Meeting
              </h1>
              <p className="text-slate-600 dark:text-gray-400">
                {meeting?.title || 'Meeting Room'}
              </p>
              <div className="inline-flex items-center space-x-2 mt-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-mono text-slate-600 dark:text-gray-400">
                  {meeting?.meeting_code}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <div className="space-y-4">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
                  {previewStream && !audioOnly ? (
                    <video
                      ref={(video) => {
                        if (video && previewStream) {
                          video.srcObject = previewStream;
                        }
                      }}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-slate-600 dark:text-gray-400">
                          {audioOnly ? 'Audio Only Mode' : 'Camera Preview'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Controls overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 dark:bg-black/50 backdrop-blur-sm"
                      onClick={() => {
                        if (previewStream) {
                          const audioTrack = previewStream.getAudioTracks()[0];
                          if (audioTrack) {
                            audioTrack.enabled = !audioTrack.enabled;
                          }
                        }
                      }}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 dark:bg-black/50 backdrop-blur-sm"
                      onClick={() => setAudioOnly(!audioOnly)}
                    >
                      {audioOnly ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Device Status */}
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className={`flex items-center space-x-1 ${devicePermissions.camera ? 'text-green-600' : 'text-gray-400'}`}>
                    <Video className="w-4 h-4" />
                    <span>Camera {devicePermissions.camera ? 'Ready' : 'Not Available'}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${devicePermissions.microphone ? 'text-green-600' : 'text-gray-400'}`}>
                    <Mic className="w-4 h-4" />
                    <span>Microphone {devicePermissions.microphone ? 'Ready' : 'Not Available'}</span>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="userName" className="text-base font-medium">Your Name</Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Audio Only Mode</Label>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        Join with audio only to save bandwidth
                      </p>
                    </div>
                    <Switch
                      checked={audioOnly}
                      onCheckedChange={setAudioOnly}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleJoin}
                    disabled={!userName.trim() || isJoining}
                    className="w-full h-14 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    {isJoining ? 'Joining...' : 'Join Meeting'}
                  </Button>
                </div>

                <div className="text-center text-sm text-slate-600 dark:text-gray-400">
                  <p>By joining, you agree to our meeting guidelines</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PreJoinScreen;
