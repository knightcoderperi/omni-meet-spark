
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, UserX, Clock, Users, Shield, 
  CheckCircle, XCircle, Eye, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LobbyParticipant {
  id: string;
  user_id?: string;
  guest_name?: string;
  email?: string;
  joined_lobby_at: string;
  approval_status: 'pending' | 'approved' | 'denied';
  device_info?: any;
  network_quality?: any;
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
  const { toast } = useToast();
  const [lobbyParticipants, setLobbyParticipants] = useState<LobbyParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHost || !meetingId) return;

    fetchLobbyParticipants();
    const cleanup = setupRealtimeSubscription();
    
    return cleanup;
  }, [meetingId, isHost]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`lobby-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_queue',
          filter: `meeting_id=eq.${meetingId}`
        },
        (payload) => {
          console.log('Lobby update:', payload);
          fetchLobbyParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchLobbyParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('lobby_queue')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('approval_status', 'pending')
        .order('joined_lobby_at', { ascending: true });

      if (error) {
        console.error('Error fetching lobby participants:', error);
        return;
      }

      setLobbyParticipants(data || []);
    } catch (error) {
      console.error('Error in fetchLobbyParticipants:', error);
    }
  };

  const handleApproval = async (participantId: string, approve: boolean) => {
    setLoading(true);
    try {
      const status = approve ? 'approved' : 'denied';
      
      // Update lobby queue status
      const { error: lobbyError } = await supabase
        .from('lobby_queue')
        .update({ 
          approval_status: status,
          approved_at: approve ? new Date().toISOString() : null,
          approved_by: approve ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', participantId);

      if (lobbyError) {
        console.error('Error updating approval status:', lobbyError);
        toast({
          title: "Error",
          description: "Failed to update participant status",
          variant: "destructive"
        });
        return;
      }

      // If approved, add to meeting_participants using the new unique constraint
      if (approve) {
        const participant = lobbyParticipants.find(p => p.id === participantId);
        if (participant) {
          const { error: participantError } = await supabase
            .from('meeting_participants')
            .upsert({
              meeting_id: meetingId,
              user_id: participant.user_id,
              guest_name: participant.guest_name,
              email: participant.email,
              status: 'approved',
              is_host: false,
              device_info: participant.device_info,
              joined_at: new Date().toISOString()
            }, {
              onConflict: 'meeting_id,user_id'
            });

          if (participantError) {
            console.error('Error adding participant:', participantError);
            toast({
              title: "Error",
              description: "Failed to add participant to meeting",
              variant: "destructive"
            });
            return;
          }
        }
      }

      toast({
        title: approve ? "Participant approved" : "Participant rejected",
        description: approve 
          ? "The participant can now join the meeting" 
          : "The participant has been rejected",
      });

      // Notify parent component to refresh participant list
      onParticipantUpdate();
      
      // Refresh lobby list
      fetchLobbyParticipants();
      
    } catch (error) {
      console.error('Error handling approval:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (participant: LobbyParticipant) => {
    return participant.guest_name || participant.email || 'Anonymous User';
  };

  const formatJoinTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isHost || lobbyParticipants.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute top-20 right-4 z-50 w-80"
    >
      <Card className="glass-auto border-2 shadow-2xl overflow-hidden">
        <div className="p-4">
          <motion.div 
            className="flex items-center space-x-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-5 h-5 text-blue-500" />
            </motion.div>
            <h3 className="font-semibold text-slate-800 dark:text-white text-gradient-premium">
              Lobby Queue
            </h3>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
            >
              <Badge 
                variant="secondary" 
                className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none"
              >
                {lobbyParticipants.length}
              </Badge>
            </motion.div>
          </motion.div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {lobbyParticipants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  style={{ '--item-index': index } as React.CSSProperties}
                  className="flex items-center justify-between p-3 card-premium-auto animate-fade-in-scale"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {getDisplayName(participant).charAt(0).toUpperCase()}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {getDisplayName(participant)}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-gray-400">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            <Clock className="w-3 h-3" />
                          </motion.div>
                          <span>{formatJoinTime(participant.joined_lobby_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 btn-premium-auto border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                        onClick={() => handleApproval(participant.id, true)}
                        disabled={loading}
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 btn-premium-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => handleApproval(participant.id, false)}
                        disabled={loading}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
              Approve participants to let them join the meeting
            </p>
            <motion.div 
              className="flex justify-center mt-2"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MeetingLobby;
