
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
    setupRealtimeSubscription();
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
      
      const { error } = await supabase
        .from('lobby_queue')
        .update({ 
          approval_status: status,
          approved_at: approve ? new Date().toISOString() : null,
          approved_by: approve ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', participantId);

      if (error) {
        console.error('Error updating approval status:', error);
        toast({
          title: "Error",
          description: "Failed to update participant status",
          variant: "destructive"
        });
        return;
      }

      // If approved, also add to meeting_participants
      if (approve) {
        const participant = lobbyParticipants.find(p => p.id === participantId);
        if (participant) {
          const { error: participantError } = await supabase
            .from('meeting_participants')
            .insert({
              meeting_id: meetingId,
              user_id: participant.user_id,
              guest_name: participant.guest_name,
              email: participant.email,
              status: 'approved',
              is_host: false,
              device_info: participant.device_info
            });

          if (participantError) {
            console.error('Error adding participant:', participantError);
          }
        }
      }

      toast({
        title: approve ? "Participant approved" : "Participant rejected",
        description: approve 
          ? "The participant can now join the meeting" 
          : "The participant has been rejected",
      });

      onParticipantUpdate();
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-20 right-4 z-50 w-80"
    >
      <Card className="bg-white/95 dark:bg-black/30 backdrop-blur-2xl border border-orange-200/50 dark:border-orange-500/20 shadow-xl">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Lobby Queue
            </h3>
            <Badge variant="secondary" className="ml-auto">
              {lobbyParticipants.length}
            </Badge>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            <AnimatePresence>
              {lobbyParticipants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getDisplayName(participant).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {getDisplayName(participant)}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatJoinTime(participant.joined_lobby_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                      onClick={() => handleApproval(participant.id, true)}
                      disabled={loading}
                    >
                      <UserCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => handleApproval(participant.id, false)}
                      disabled={loading}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
              Approve participants to let them join the meeting
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MeetingLobby;
