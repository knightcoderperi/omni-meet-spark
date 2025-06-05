
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Video } from 'lucide-react';
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
        title: "Error",
        description: "Please enter a meeting code",
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
        title: "Error",
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Join Meeting
              </h2>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Code *
                </label>
                <input
                  type="text"
                  value={formData.meetingCode}
                  onChange={(e) => setFormData({ ...formData, meetingCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-center tracking-wider"
                  placeholder="Enter meeting code"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter meeting password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if meeting doesn't require a password
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinMeeting}
                  disabled={loading || !formData.meetingCode}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Video className="w-4 h-4 mr-2" />
                  )}
                  Join Meeting
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JoinMeetingModal;
