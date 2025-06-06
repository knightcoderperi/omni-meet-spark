
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, Shield, CheckCircle, XCircle, 
  UserCheck, UserX, Crown, Eye, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LobbyEntry {
  id: string;
  guest_name: string | null;
  user_id: string | null;
  email: string | null;
  joined_lobby_at: string | null;
  approval_status: string | null;
  device_info: any;
  network_quality: any;
  wait_time_estimate: number | null;
  host_notes: string | null;
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
  const [pendingParticipants, setPendingParticipants] = useState<LobbyEntry[]>([]);
  const [showLobby, setShowLobby] = useState(false);
  const [hostNotes, setHostNotes] = useState<{ [key: string]: string }>({});
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
          table: 'lobby_queue',
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
        .from('lobby_queue')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('approval_status', 'pending')
        .order('joined_lobby_at', { ascending: true });

      if (error) throw error;
      setPendingParticipants(data || []);
      setShowLobby((data || []).length > 0);
    } catch (error) {
      console.error('Error fetching pending participants:', error);
    }
  };

  const handleParticipantAction = async (entryId: string, action: 'approved' | 'rejected') => {
    try {
      const notes = hostNotes[entryId] || '';
      
      const updateData: any = {
        approval_status: action,
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      };

      if (action === 'rejected' && notes) {
        updateData.rejection_reason = notes;
      } else if (action === 'approved' && notes) {
        updateData.host_notes = notes;
      }

      const { error } = await supabase
        .from('lobby_queue')
        .update(updateData)
        .eq('id', entryId);

      if (error) throw error;

      // If approved, also add to meeting_participants
      if (action === 'approved') {
        const entry = pendingParticipants.find(p => p.id === entryId);
        if (entry) {
          const { error: participantError } = await supabase
            .from('meeting_participants')
            .insert({
              meeting_id: meetingId,
              user_id: entry.user_id,
              guest_name: entry.guest_name,
              email: entry.email,
              status: 'approved',
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
              device_info: entry.device_info
            });

          if (participantError) {
            console.error('Error adding participant:', participantError);
          }
        }
      }

      const participant = pendingParticipants.find(p => p.id === entryId);
      
      toast({
        title: action === 'approved' ? 'Participant approved' : 'Participant denied',
        description: `${participant?.guest_name || participant?.email || 'Participant'} has been ${action}`,
      });

      // Clear host notes for this entry
      setHostNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[entryId];
        return newNotes;
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
        .from('lobby_queue')
        .update({ 
          approval_status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('meeting_id', meetingId)
        .eq('approval_status', 'pending');

      if (error) throw error;

      // Add all pending participants to meeting_participants
      for (const entry of pendingParticipants) {
        await supabase
          .from('meeting_participants')
          .insert({
            meeting_id: meetingId,
            user_id: entry.user_id,
            guest_name: entry.guest_name,
            email: entry.email,
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
            device_info: entry.device_info
          });
      }

      toast({
        title: "All participants approved",
        description: `${pendingParticipants.length} participants have been approved`,
      });

      setHostNotes({});
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

  const formatWaitTime = (joinedAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 60000);
    return minutes < 1 ? 'Just joined' : `${minutes} min`;
  };

  if (!isHost || !showLobby || pendingParticipants.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 right-6 z-40 w-96"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
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
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {pendingParticipants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200/50 dark:border-slate-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(participant.guest_name || participant.email)?.charAt(0).toUpperCase() || 'G'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white text-sm">
                            {participant.guest_name || participant.email || 'Anonymous User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {participant.joined_lobby_at && formatWaitTime(participant.joined_lobby_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Host Notes Input */}
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Add a note (optional)"
                        value={hostNotes[participant.id] || ''}
                        onChange={(e) => setHostNotes(prev => ({
                          ...prev,
                          [participant.id]: e.target.value
                        }))}
                        className="flex-1 px-2 py-1 text-xs bg-white/30 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/50 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => handleParticipantAction(participant.id, 'approved')}
                        className="flex-1 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle className="w-4 h-4 mx-auto" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleParticipantAction(participant.id, 'rejected')}
                        className="flex-1 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <XCircle className="w-4 h-4 mx-auto" />
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
