
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  timeframe?: string;
  context?: {
    participants?: string[];
    topics?: string[];
    decisions?: string[];
  };
  requestType?: 'timeframe' | 'entire_meeting' | 'custom_query' | 'realtime';
}

const getLanguageName = (code: string): string => {
  const languageMap: Record<string, string> = {
    'es': 'Spanish',
    'fr': 'French', 
    'de': 'German',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ar': 'Arabic',
    'pt': 'Portuguese',
    'ru': 'Russian'
  };
  return languageMap[code] || 'English';
};

const buildTranslationPrompt = (
  text: string, 
  targetLang: string, 
  timeframe: string,
  context?: {
    participants?: string[];
    topics?: string[];
    decisions?: string[];
  }
): string => {
  const languageName = getLanguageName(targetLang);
  
  let contextInfo = '';
  if (context) {
    contextInfo = `
MEETING CONTEXT:
${context.participants ? `- Participants: ${context.participants.join(', ')}` : ''}
${context.topics ? `- Main Topics: ${context.topics.join(', ')}` : ''}
${context.decisions ? `- Key Decisions: ${context.decisions.join(', ')}` : ''}
`;
  }

  return `
Please translate the following meeting content from the ${timeframe}:

${contextInfo}

MEETING CONTENT:
"${text}"

TRANSLATION REQUIREMENTS:
- Target Language: ${languageName}
- Maintain professional meeting tone
- Preserve technical terms and proper nouns
- Keep speaker context if mentioned (e.g., "John said..." should become "John dijo..." in Spanish)
- Format as clear, readable text with proper paragraphs
- If there are action items or decisions, clearly highlight them
- Maintain any timestamps or structural elements

TRANSLATION:
  `;
};

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
    const request: TranslationRequest = await req.json();
    const { text, targetLanguage, timeframe = 'meeting segment', context, requestType = 'custom_query' } = request;

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text and targetLanguage' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = buildTranslationPrompt(text, targetLanguage, timeframe, context);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a professional meeting translator. Provide accurate, contextual translations while maintaining the meeting\'s professional tone and technical terminology. Preserve speaker attributions and meeting structure.'
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
    const translatedText = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        translatedText,
        targetLanguage,
        timeframe,
        requestType 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Translation service temporarily unavailable',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
