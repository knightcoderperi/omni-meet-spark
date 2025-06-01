import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Shield, CheckCircle, XCircle, 
  UserCheck, UserX, Crown, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingParticipant {
  id: string;
  guest_name: string | null;
  user_id: string | null;
  joined_at: string | null;
  status: string | null;
  is_co_host: boolean | null;
  is_host: boolean | null;
  left_at: string | null;
  meeting_id: string | null;
  role: string | null;
}

interface MeetingLobbyProps {
  meetingId: string;
  isHost: boolean;
  onParticipantUpdate: () => void;
}

const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  meetingId,
  isHost,
  onParticipantUpdate
}) => {
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([]);
  const [showLobby, setShowLobby] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isHost) return;
    
    fetchPendingParticipants();
    
    // Set up real-time subscription for pending participants
    const channel = supabase
      .channel('lobby-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_participants',
          filter: `meeting_id=eq.${meetingId}`
        },
        () => {
          fetchPendingParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, isHost]);

  const fetchPendingParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('status', 'pending')
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setPendingParticipants(data || []);
      setShowLobby((data || []).length > 0);
    } catch (error) {
      console.error('Error fetching pending participants:', error);
    }
  };

  const handleParticipantAction = async (participantId: string, action: 'approve' | 'deny') => {
    try {
      const status = action === 'approve' ? 'approved' : 'denied';
      
      const { error } = await supabase
        .from('meeting_participants')
        .update({ status })
        .eq('id', participantId);

      if (error) throw error;

      const participant = pendingParticipants.find(p => p.id === participantId);
      
      toast({
        title: action === 'approve' ? 'Participant approved' : 'Participant denied',
        description: `${participant?.guest_name || 'Participant'} has been ${action}d`,
      });

      onParticipantUpdate();
    } catch (error) {
      console.error('Error updating participant status:', error);
      toast({
        title: "Error",
        description: "Failed to update participant status",
        variant: "destructive"
      });
    }
  };

  const approveAll = async () => {
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .update({ status: 'approved' })
        .eq('meeting_id', meetingId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "All participants approved",
        description: `${pendingParticipants.length} participants have been approved`,
      });

      onParticipantUpdate();
    } catch (error) {
      console.error('Error approving all participants:', error);
      toast({
        title: "Error",
        description: "Failed to approve all participants",
        variant: "destructive"
      });
    }
  };

  if (!isHost || !showLobby || pendingParticipants.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 right-6 z-40 w-80"
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <Card className="bg-gradient-to-br from-white/95 to-slate-100/95 dark:from-slate-900/95 dark:to-black/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Meeting Lobby
                </h3>
              </div>
              <div className="bg-cyan-500/20 px-2 py-1 rounded-full">
                <span className="text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                  {pendingParticipants.length}
                </span>
              </div>
            </div>

            {/* Pending Participants */}
            <div className="space-y-3 mb-4">
              {pendingParticipants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.guest_name?.charAt(0).toUpperCase() || 'G'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">
                          {participant.guest_name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting {Math.floor((Date.now() - new Date(participant.joined_at).getTime()) / 60000)} min
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <motion.button
                        onClick={() => handleParticipantAction(participant.id, 'approve')}
                        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleParticipantAction(participant.id, 'deny')}
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Deny"
                      >
                        <XCircle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={approveAll}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm"
                size="sm"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Approve All
              </Button>
              
              <Button
                onClick={() => setShowLobby(false)}
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default MeetingLobby;
