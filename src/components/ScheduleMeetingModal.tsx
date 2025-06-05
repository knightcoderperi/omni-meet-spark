
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Lock, Users, Copy, Check, Share, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingScheduled: () => void;
}

const ScheduleMeetingModal = ({ isOpen, onClose, onMeetingScheduled }: ScheduleMeetingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    meetingPassword: '',
    confirmPassword: '',
    requireApproval: true,
    maxParticipants: 50
  });

  const generateMeetingCode = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a meeting title",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: "Date and time required",
        description: "Please select a date and time for the meeting",
        variant: "destructive"
      });
      return false;
    }

    if (formData.meetingPassword && formData.meetingPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match",
        variant: "destructive"
      });
      return false;
    }

    if (formData.meetingPassword && formData.meetingPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleScheduleMeeting = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const meetingCode = generateMeetingCode();
      const password = formData.meetingPassword || generatePassword();
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      const meetingData = {
        host_id: user.id,
        creator_id: user.id,
        title: formData.title,
        description: formData.description,
        meeting_code: meetingCode,
        meeting_password: password,
        scheduled_time: scheduledDateTime.toISOString(),
        duration_minutes: formData.duration,
        is_active: false,
        require_approval: formData.requireApproval,
        max_participants: formData.maxParticipants,
        password_protected: true,
        status: 'scheduled' as const
      };

      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMeetingDetails({
        ...data,
        shareableLink: `${window.location.origin}/meeting/${meetingCode}`
      });

      setShowSuccess(true);

      toast({
        title: "Meeting scheduled!",
        description: `Meeting "${formData.title}" has been scheduled successfully.`
      });

      onMeetingScheduled();

    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type} copied!`,
        description: `${type} has been copied to your clipboard.`
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setMeetingDetails(null);
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      meetingPassword: '',
      confirmPassword: '',
      requireApproval: true,
      maxParticipants: 50
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/20 p-6">
            {!showSuccess ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Schedule Meeting
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      rows={3}
                      placeholder="Enter meeting description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time *
                      </label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Max Participants
                      </label>
                      <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        min="2"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Lock className="w-4 h-4 inline mr-1" />
                        Meeting Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.meetingPassword}
                          onChange={(e) => setFormData({ ...formData, meetingPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-24 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Enter password (optional)"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Button
                            type="button"
                            onClick={() => {
                              const password = generatePassword();
                              setFormData({ ...formData, meetingPassword: password, confirmPassword: password });
                            }}
                            size="sm"
                            className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                          >
                            Gen
                          </Button>
                        </div>
                      </div>
                    </div>

                    {formData.meetingPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-300">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                              formData.meetingPassword === formData.confirmPassword && formData.confirmPassword
                                ? 'border-green-500/50 focus:ring-green-500/50'
                                : 'border-white/10 focus:ring-cyan-500'
                            }`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formData.confirmPassword && (
                          <div className="flex items-center space-x-2 text-sm">
                            {formData.meetingPassword === formData.confirmPassword ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-green-400">Passwords match</span>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 text-red-500" />
                                <span className="text-red-400">Passwords don't match</span>
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="requireApproval"
                      checked={formData.requireApproval}
                      onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                      className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="requireApproval" className="text-sm text-gray-300">
                      Require host approval for participants to join
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleScheduleMeeting}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      ) : null}
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Meeting Scheduled!</h3>
                  <p className="text-gray-400">Your meeting has been created successfully</p>
                </div>

                <div className="bg-white/5 rounded-lg p-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">{meetingDetails?.title}</h4>
                    <p className="text-gray-400 text-sm">{meetingDetails?.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Meeting Code:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-400">{meetingDetails?.meeting_code}</span>
                        <button
                          onClick={() => copyToClipboard(meetingDetails?.meeting_code, 'Meeting code')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Password:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-400">{meetingDetails?.meeting_password}</span>
                        <button
                          onClick={() => copyToClipboard(meetingDetails?.meeting_password, 'Password')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Share className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-300">Shareable Link</span>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(meetingDetails?.shareableLink, 'Meeting link')}
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg">
                      <strong>Share this information with participants:</strong>
                      <div className="mt-2 font-mono text-gray-400">
                        Meeting: {meetingDetails?.title}<br/>
                        Link: {meetingDetails?.shareableLink}<br/>
                        Code: {meetingDetails?.meeting_code}<br/>
                        Password: {meetingDetails?.meeting_password}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleMeetingModal;
