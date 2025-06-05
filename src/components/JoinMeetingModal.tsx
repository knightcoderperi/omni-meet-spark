
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Video, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinMeetingModal = ({ isOpen, onClose }: JoinMeetingModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meetingCode: '',
    password: ''
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

    setLoading(true);
    try {
      // Check if meeting exists and validate password
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', formData.meetingCode.toUpperCase())
        .single();

      if (error || !meeting) {
        toast({
          title: "Meeting not found",
          description: "The meeting code you entered is invalid",
          variant: "destructive"
        });
        return;
      }

      // Check if meeting requires password
      if (meeting.password_protected && meeting.meeting_password) {
        if (!formData.password) {
          toast({
            title: "Password required",
            description: "This meeting requires a password",
            variant: "destructive"
          });
          return;
        }

        if (formData.password !== meeting.meeting_password) {
          toast({
            title: "Incorrect password",
            description: "The password you entered is incorrect",
            variant: "destructive"
          });
          return;
        }
      }

      // Check if meeting is expired
      if (meeting.scheduled_time) {
        const scheduledTime = new Date(meeting.scheduled_time);
        const currentTime = new Date();
        const endTime = new Date(scheduledTime.getTime() + (meeting.duration_minutes * 60000));
        
        if (currentTime > endTime) {
          toast({
            title: "Meeting expired",
            description: "This meeting has already ended",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Joining meeting...",
        description: "Redirecting to meeting room"
      });

      // Navigate to meeting
      navigate(`/meeting/${meeting.meeting_code}`);
      onClose();

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
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
                  onClick={onClose}
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
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:bg-white/10"
                      placeholder="Enter password (if required)"
                    />
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
                    onClick={onClose}
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
                    disabled={loading || !formData.meetingCode}
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
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JoinMeetingModal;
