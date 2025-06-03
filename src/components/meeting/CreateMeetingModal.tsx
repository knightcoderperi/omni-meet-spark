import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Users, Settings, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: (meetingCode: string) => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    durationMinutes: 60,
    requireApproval: true,
    lobbyEnabled: true,
    passwordProtected: false,
    meetingPassword: '',
    allowAnonymous: false,
    recordingEnabled: false,
    maxParticipants: 50,
    welcomeMessage: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<{ code: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating meeting, user:', user);
    
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be logged in to create a meeting.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log('Generating meeting code...');
      // First generate a meeting code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_meeting_code');

      if (codeError) {
        console.error('Error generating meeting code:', codeError);
        throw codeError;
      }

      console.log('Generated meeting code:', codeData);

      // Create the insert data object with the generated meeting code
      const insertData = {
        meeting_code: codeData,
        title: formData.title,
        description: formData.description || null,
        creator_id: user.id,
        scheduled_time: formData.scheduledTime || null,
        duration_minutes: formData.durationMinutes,
        require_approval: formData.requireApproval,
        lobby_enabled: formData.lobbyEnabled,
        password_protected: formData.passwordProtected,
        meeting_password: formData.passwordProtected ? formData.meetingPassword : null,
        allow_anonymous: formData.allowAnonymous,
        recording_enabled: formData.recordingEnabled,
        max_participants: formData.maxParticipants,
        welcome_message: formData.welcomeMessage || null,
        status: 'scheduled' as const
      };

      console.log('Inserting meeting data:', insertData);

      const { data, error } = await supabase
        .from('meetings')
        .insert(insertData)
        .select('meeting_code, id')
        .single();

      if (error) {
        console.error('Error inserting meeting:', error);
        throw error;
      }

      console.log('Meeting created successfully:', data);
      setCreatedMeeting({ code: data.meeting_code, id: data.id });
      
      toast({
        title: "Meeting Created",
        description: "Your meeting has been created successfully!",
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: `Failed to create meeting: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyMeetingLink = () => {
    if (!createdMeeting) return;
    
    const link = `${window.location.origin}/meeting/${createdMeeting.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Link Copied",
      description: "Meeting link has been copied to clipboard",
    });
  };

  const handleJoinMeeting = () => {
    if (createdMeeting) {
      onMeetingCreated(createdMeeting.code);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {!createdMeeting ? (
          <>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Create New Meeting
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter meeting title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Meeting description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    max="1000"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Lobby System</Label>
                      <p className="text-sm text-slate-500">Participants wait for approval</p>
                    </div>
                    <Switch
                      checked={formData.lobbyEnabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lobbyEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Approval</Label>
                      <p className="text-sm text-slate-500">Host must approve participants</p>
                    </div>
                    <Switch
                      checked={formData.requireApproval}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireApproval: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Anonymous Users</Label>
                      <p className="text-sm text-slate-500">Users can join without accounts</p>
                    </div>
                    <Switch
                      checked={formData.allowAnonymous}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowAnonymous: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Password Protection</Label>
                      <p className="text-sm text-slate-500">Require password to join</p>
                    </div>
                    <Switch
                      checked={formData.passwordProtected}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, passwordProtected: checked }))}
                    />
                  </div>

                  {formData.passwordProtected && (
                    <div>
                      <Label htmlFor="password">Meeting Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.meetingPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingPassword: e.target.value }))}
                        placeholder="Enter meeting password"
                        required
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Recording Enabled</Label>
                      <p className="text-sm text-slate-500">Allow meeting recording</p>
                    </div>
                    <Switch
                      checked={formData.recordingEnabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recordingEnabled: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !user}>
                  {isCreating ? 'Creating...' : 'Create Meeting'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Meeting Created Successfully!
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Your meeting is ready. You can share the link or join now.
                </p>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Meeting Code</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={createdMeeting.code}
                          readOnly
                          className="font-mono text-center text-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyMeetingLink}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Meeting Link</Label>
                      <Input
                        value={`${window.location.origin}/meeting/${createdMeeting.code}`}
                        readOnly
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={handleJoinMeeting}>
                  Join Meeting Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreateMeetingModal;
