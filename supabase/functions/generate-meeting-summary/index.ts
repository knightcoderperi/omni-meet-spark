
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MeetingSummaryRequest {
  meetingTitle: string;
  meetingDate: string;
  durationMinutes: number;
  attendeeNames: string;
  transcriptContent: string;
}

const MEETING_SUMMARY_PROMPT = `
You are an expert meeting analyst. Analyze the following meeting transcript and create a professional, actionable summary.

MEETING DETAILS:
- Title: {meeting_title}
- Date: {meeting_date} 
- Duration: {duration_minutes} minutes
- Attendees: {attendee_names}

TRANSCRIPT:
{transcript_content}

INSTRUCTIONS:
1. Create a comprehensive summary in JSON format
2. Focus on actionable insights and concrete outcomes
3. Be concise but thorough
4. Use professional language

REQUIRED JSON OUTPUT FORMAT:
{
  "meeting_overview": "Brief 2-3 sentence overview of the meeting",
  "key_discussion_points": [
    "Point 1 with specific details",
    "Point 2 with context",
    "Point 3 with outcomes"
  ],
  "decisions_made": [
    "Specific decision 1 with rationale",
    "Decision 2 with approval status"
  ],
  "action_items": [
    {
      "task": "Specific action item description",
      "owner": "Person responsible (if mentioned)",
      "deadline": "Date or timeframe (if mentioned)",
      "priority": "high/medium/low"
    }
  ],
  "next_steps": [
    "Next step 1",
    "Next step 2"
  ],
  "important_dates": [
    {
      "date": "YYYY-MM-DD",
      "event": "Description of the event/deadline"
    }
  ],
  "follow_up_required": [
    "Items requiring follow-up",
    "People to contact"
  ],
  "key_metrics_mentioned": [
    "Any numbers, percentages, or KPIs discussed"
  ]
}

Return only valid JSON. No additional text or formatting.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!groqApiKey) {
    return new Response(
      JSON.stringify({ error: 'Groq API key not configured' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const request: MeetingSummaryRequest = await req.json();
    const { meetingTitle, meetingDate, durationMinutes, attendeeNames, transcriptContent } = request;

    if (!transcriptContent || !meetingTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: meetingTitle and transcriptContent' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build the prompt with actual meeting data
    const prompt = MEETING_SUMMARY_PROMPT
      .replace('{meeting_title}', meetingTitle)
      .replace('{meeting_date}', meetingDate)
      .replace('{duration_minutes}', durationMinutes.toString())
      .replace('{attendee_names}', attendeeNames)
      .replace('{transcript_content}', transcriptContent);

    console.log('Generating meeting summary with Groq API...');

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional meeting summarizer. Provide accurate, actionable summaries while maintaining the meeting\'s professional tone and technical terminology. Preserve speaker attributions and meeting structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const data = await groqResponse.json();
    const summaryText = data.choices[0].message.content;

    // Parse the JSON response
    let summary;
    try {
      summary = JSON.parse(summaryText);
    } catch (parseError) {
      console.error('Failed to parse Groq response as JSON:', summaryText);
      // Fallback to basic summary if JSON parsing fails
      summary = {
        meeting_overview: summaryText.substring(0, 200) + '...',
        key_discussion_points: ['Summary generated but could not parse detailed structure'],
        decisions_made: [],
        action_items: [],
        next_steps: [],
        important_dates: [],
        follow_up_required: [],
        key_metrics_mentioned: []
      };
    }

    console.log('Meeting summary generated successfully');

    return new Response(
      JSON.stringify({ 
        summary,
        processingTimeMs: Date.now(),
        groqModel: 'llama-3.1-70b-versatile'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Meeting summary generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Meeting summary service temporarily unavailable',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
