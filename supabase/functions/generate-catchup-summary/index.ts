
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { meetingId, joinTime } = await req.json();
    
    if (!meetingId) {
      throw new Error('Meeting ID is required');
    }

    console.log('Generating catch-up summary for meeting:', meetingId);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get meeting transcriptions from when the user joined
    const { data: transcriptions, error: transcriptionError } = await supabase
      .from('meeting_transcriptions')
      .select('transcript_text, start_time, end_time')
      .eq('meeting_id', meetingId)
      .eq('is_final', true)
      .lte('start_time', joinTime || 999999) // Get transcriptions before user joined
      .order('start_time', { ascending: true });

    if (transcriptionError) {
      console.error('Error fetching transcriptions:', transcriptionError);
      throw new Error('Failed to fetch meeting transcriptions');
    }

    if (!transcriptions || transcriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: "🤖 No previous discussion found. You haven't missed any content yet!",
          source: 'no_content'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine all transcriptions into meeting content
    const meetingContent = transcriptions
      .map(t => t.transcript_text)
      .join(' ')
      .trim();

    if (meetingContent.length < 50) {
      return new Response(
        JSON.stringify({ 
          summary: "📝 Very little has been discussed so far. You're all caught up!",
          source: 'minimal_content'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate AI summary using OpenAI
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that creates concise "Catch Me Up" summaries for meeting participants who joined late. 

Your task is to summarize what has been discussed in the meeting so far. Focus on:
- Key topics discussed
- Important decisions made
- Action items mentioned
- Main points and context

Keep the summary concise but informative. Use bullet points for clarity. Start with "🎯 Catch Me Up Summary:" and make it engaging and easy to read.`
          },
          {
            role: 'user',
            content: `Please create a catch-up summary based on this meeting discussion:\n\n${meetingContent}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to generate AI summary');
    }

    const result = await response.json();
    const aiSummary = result.choices[0]?.message?.content || '';

    if (!aiSummary) {
      throw new Error('No summary generated');
    }

    // Calculate missed duration for context
    const totalDuration = Math.max(...transcriptions.map(t => t.end_time));
    const missedMinutes = Math.floor(totalDuration / 60);
    
    let enhancedSummary = aiSummary;
    if (missedMinutes > 0) {
      enhancedSummary += `\n\n⏰ You missed approximately ${missedMinutes} minute${missedMinutes > 1 ? 's' : ''} of discussion.`;
    }

    console.log('Catch-up summary generated successfully');

    return new Response(
      JSON.stringify({ 
        summary: enhancedSummary,
        source: 'ai_transcription',
        missedDuration: totalDuration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Catch-up summary error:', error);
    
    return new Response(
      JSON.stringify({ 
        summary: "🤖 Unable to generate catch-up summary at the moment. Please try again.",
        source: 'error',
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
