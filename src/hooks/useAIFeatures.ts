
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Use the actual database types instead of strict union types
interface AIConversation {
  id: string;
  meeting_id: string;
  message: string;
  response: string | null;
  ai_feature_type: string;
  created_at: string;
}

interface AIInsight {
  id: string;
  meeting_id: string;
  insight_type: string;
  content: any;
  confidence_score: number;
  created_at: string;
}

interface Transcription {
  id: string;
  meeting_id: string;
  participant_id: string;
  transcript_text: string;
  start_time: number;
  end_time: number;
  confidence_score: number;
  language_code: string;
  is_final: boolean;
  created_at: string;
}

export const useAIFeatures = (meetingId: string) => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching AI conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI conversations",
        variant: "destructive"
      });
    }
  }, [meetingId, toast]);

  const fetchInsights = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_meeting_insights')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI insights",
        variant: "destructive"
      });
    }
  }, [meetingId, toast]);

  const fetchTranscriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('is_final', true)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTranscriptions(data || []);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transcriptions",
        variant: "destructive"
      });
    }
  }, [meetingId, toast]);

  const sendAIMessage = useCallback(async (message: string, featureType: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          meeting_id: meetingId,
          message,
          ai_feature_type: featureType,
          response: `AI response for ${featureType}: ${message}` // This would be replaced with actual AI integration
        })
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [...prev, data]);
      
      toast({
        title: "AI Response Generated",
        description: `Your ${featureType.replace('_', ' ')} request has been processed`,
      });

      return data;
    } catch (error) {
      console.error('Error sending AI message:', error);
      toast({
        title: "Error",
        description: "Failed to process AI request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, toast]);

  const generateCatchUp = useCallback(async (joinTime?: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-catchup-summary', {
        body: { 
          meetingId,
          joinTime: joinTime || 0
        }
      });

      if (error) throw error;

      // Store the catch-up summary as a conversation
      const conversationData = await supabase
        .from('ai_conversations')
        .insert({
          meeting_id: meetingId,
          message: 'Generate catch-up summary based on meeting discussion',
          ai_feature_type: 'catch_me_up',
          response: data.summary
        })
        .select()
        .single();

      if (conversationData.data) {
        setConversations(prev => [...prev, conversationData.data]);
      }

      toast({
        title: "🎯 Catch Me Up Ready",
        description: "Summary generated based on meeting discussion",
      });

      return data;
    } catch (error) {
      console.error('Error generating catch-up summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate catch-up summary",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, toast]);

  const getInsights = useCallback(async () => {
    return sendAIMessage('Analyze the meeting and provide intelligent insights', 'intelligent_insights');
  }, [sendAIMessage]);

  return {
    conversations,
    insights,
    transcriptions,
    isLoading,
    fetchConversations,
    fetchInsights,
    fetchTranscriptions,
    sendAIMessage,
    generateCatchUp,
    getInsights
  };
};
