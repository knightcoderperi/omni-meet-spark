
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Video, Sparkles, Shield, Eye, EyeOff, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CanJoinMeetingResponse {
  can_join: boolean;
  reason?: string;
  meeting_id?: string;
  requires_approval?: boolean;
  is_host?: boolean;
  password_required?: boolean;
}

const JoinMeetingModal = ({ isOpen, onClose }: JoinMeetingModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'waiting' | 'approved' | 'rejected'>('form');
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    meetingCode: '',
    password: '',
    guestName: ''
  });

  const handleJoinMeeting = async () => {
    if (!formData.meetingCode) {
      toast({
        title: "Meeting code required",
        description: "Please enter a valid meeting code",
        variant: "destructive"
      });
      return;
    }

    if (!user && !formData.guestName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join as a guest",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use the database function to check if user can join
      const { data: joinCheckData, error: joinError } = await supabase
        .rpc('can_join_meeting', {
          meeting_code_param: formData.meetingCode.toUpperCase(),
          user_id_param: user?.id || null
        });

      if (joinError) {
        throw joinError;
      }

      // Cast the response to our interface with proper type conversion
      const joinCheck = joinCheckData as unknown as CanJoinMeetingResponse;

      if (!joinCheck.can_join) {
        toast({
          title: "Cannot join meeting",
          description: joinCheck.reason,
          variant: "destructive"
        });
        return;
      }

      // Check password if required
      if (joinCheck.password_required && !joinCheck.is_host) {
        if (!formData.password) {
          toast({
            title: "Password required",
            description: "This meeting requires a password",
            variant: "destructive"
          });
          return;
        }

        // Verify password
        const { data: meeting, error: meetingError } = await supabase
          .from('meetings')
          .select('meeting_password')
          .eq('id', joinCheck.meeting_id)
          .single();

        if (meetingError || formData.password !== meeting.meeting_password) {
          toast({
            title: "Incorrect password",
            description: "The password you entered is incorrect",
            variant: "destructive"
          });
          return;
        }
      }

      // If user is host or meeting doesn't require approval, join directly
      if (joinCheck.is_host || !joinCheck.requires_approval) {
        // Add to participants if not host
        if (!joinCheck.is_host) {
          await supabase
            .from('meeting_participants')
            .insert({
              meeting_id: joinCheck.meeting_id,
              user_id: user?.id || null,
              guest_name: user ? null : formData.guestName,
              email: user?.email || null,
              status: 'approved',
              is_host: false,
              device_info: {
                userAgent: navigator.userAgent,
                platform: navigator.platform
              }
            });
        }

        toast({
          title: "Joining meeting...",
          description: "Redirecting to meeting room"
        });

        navigate(`/meeting/${formData.meetingCode.toUpperCase()}`);
        onClose();
        return;
      }

      // Add to lobby queue for approval
      const { data: lobbyEntry, error: lobbyError } = await supabase
        .from('lobby_queue')
        .insert({
          meeting_id: joinCheck.meeting_id,
          user_id: user?.id || null,
          guest_name: user ? null : formData.guestName,
          email: user?.email || null,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          },
          network_quality: {
            connection: navigator.onLine ? 'online' : 'offline'
          }
        })
        .select()
        .single();

      if (lobbyError) {
        throw lobbyError;
      }

      setLobbyId(lobbyEntry.id);
      setStep('waiting');
      
      // Set up real-time listener for approval status
      const channel = supabase
        .channel(`lobby-${lobbyEntry.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'lobby_queue',
            filter: `id=eq.${lobbyEntry.id}`
          },
          (payload) => {
            const status = payload.new.approval_status;
            if (status === 'approved') {
              setStep('approved');
              setTimeout(() => {
                navigate(`/meeting/${formData.meetingCode.toUpperCase()}`);
                onClose();
              }, 2000);
            } else if (status === 'rejected') {
              setStep('rejected');
            }
          }
        )
        .subscribe();

    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Connection error",
        description: "Failed to join meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setLobbyId(null);
    setFormData({
      meetingCode: '',
      password: '',
      guestName: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            {step === 'form' && (
              <>
                {/* Header */}
                <div className="relative p-8 pb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-50" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          Join Meeting
                        </h2>
                        <p className="text-sm text-gray-400">Enter your meeting details</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-0 space-y-6">
                  <div className="space-y-4">
                    {!user && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          <User className="w-4 h-4 inline mr-1" />
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={formData.guestName}
                          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-white/10"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Meeting Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.meetingCode}
                          onChange={(e) => setFormData({ ...formData, meetingCode: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono text-center tracking-wider text-lg transition-all duration-300 hover:bg-white/10"
                          placeholder="ENTER-CODE"
                          maxLength={10}
                          required
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-cyan-400" />
                          <span>Meeting Password</span>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-white/10"
                          placeholder="Enter password (if required)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Leave empty if meeting doesn't require a password</span>
                      </p>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">End-to-end encrypted</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-2">
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        className="w-full border-gray-600/50 text-gray-300 hover:bg-white/5 hover:border-gray-500 py-4 rounded-2xl font-medium transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleJoinMeeting}
                        disabled={loading || !formData.meetingCode || (!user && !formData.guestName.trim())}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-2xl font-medium shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <motion.div 
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <Video className="w-4 h-4 mr-2" />
                        )}
                        Join Meeting
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </>
            )}

            {step === 'waiting' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-white animate-pulse" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Waiting for Approval</h3>
                  <p className="text-gray-400">The meeting host will review your request to join</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Please wait while we notify the host</p>
                </div>

                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel Request
                </Button>
              </motion.div>
            )}

            {step === 'approved' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Video className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Approved!</h3>
                  <p className="text-gray-400">Redirecting you to the meeting room...</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-sm">You have been approved to join the meeting</p>
                </div>
              </motion.div>
            )}

            {step === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Rejected</h3>
                  <p className="text-gray-400">The meeting host has declined your request to join</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">Please contact the meeting organizer if you believe this was an error</p>
                </div>

                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                >
                  Close
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JoinMeetingModal;
