
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY') || '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';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, type, duration } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for summarization');
    }

    console.log('Generating smart summary using Hugging Face...');

    // Use different models based on text length and type
    const modelName = text.length > 1000 
      ? 'facebook/bart-large-cnn'  // Better for longer texts
      : 'sshleifer/distilbart-cnn-12-6'; // Faster for shorter texts

    // Prepare request for Hugging Face Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: Math.min(150, Math.max(50, duration * 2)), // Dynamic length based on duration
            min_length: Math.max(30, Math.floor(duration * 0.5)),
            do_sample: false,
            early_stopping: true,
            num_beams: 4,
            temperature: 0.7,
            repetition_penalty: 1.1
          },
          options: {
            wait_for_model: true,
            use_cache: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      
      // Fallback to simple extractive summarization
      return new Response(
        JSON.stringify({ 
          summary: generateFallbackSummary(text, duration),
          source: 'fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    
    // Handle different response formats
    let summaryText = '';
    if (Array.isArray(result) && result.length > 0) {
      summaryText = result[0].summary_text || result[0].generated_text || '';
    } else if (result.summary_text) {
      summaryText = result.summary_text;
    } else if (result.generated_text) {
      summaryText = result.generated_text;
    }

    if (!summaryText) {
      throw new Error('No summary generated');
    }

    // Enhance the summary with smart formatting for Smart Capsule
    const enhancedSummary = enhanceSmartSummary(summaryText, duration, type);

    console.log('Smart summary generated successfully');

    return new Response(
      JSON.stringify({ 
        summary: enhancedSummary,
        source: 'huggingface',
        model: modelName,
        confidence: 0.9
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Summarization error:', error);
    
    // Always provide a fallback
    const { text, duration } = await req.json().catch(() => ({ text: '', duration: 0 }));
    
    return new Response(
      JSON.stringify({ 
        summary: generateFallbackSummary(text, duration),
        source: 'fallback',
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function enhanceSmartSummary(summary: string, duration: number, type: string): string {
  const timeLabel = duration > 60 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration}s`;
  
  let enhancedSummary = `🎯 Smart Capsule Summary (${timeLabel}):\n\n`;
  
  // Clean and format the summary
  const cleanSummary = summary
    .replace(/^(Summary:|The discussion|The meeting|In summary)/i, '')
    .trim();
  
  // Add smart formatting based on content
  if (cleanSummary.includes('.')) {
    const sentences = cleanSummary.split('.').filter(s => s.trim().length > 10);
    enhancedSummary += sentences.map((sentence, i) => {
      const trimmed = sentence.trim();
      if (trimmed) {
        return `${getEmoji(i)} ${trimmed}.`;
      }
      return '';
    }).filter(Boolean).join('\n\n');
  } else {
    enhancedSummary += `📝 ${cleanSummary}`;
  }
  
  enhancedSummary += `\n\n💡 This capsule was intelligently generated using AI summarization technology.`;
  
  return enhancedSummary;
}

function getEmoji(index: number): string {
  const emojis = ['🔑', '💡', '📊', '🎯', '⚡', '🌟', '🔍', '📈'];
  return emojis[index % emojis.length];
}

function generateFallbackSummary(text: string, duration: number): string {
  if (!text || text.length < 20) {
    return "🤖 No content detected. Please try recording with clearer speech.";
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const numSentences = Math.max(2, Math.min(5, Math.floor(sentences.length * 0.4)));
  const keyPoints = sentences.slice(0, numSentences);
  
  const timeLabel = duration > 60 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration}s`;
  
  let summary = `🎯 Smart Capsule Summary (${timeLabel}):\n\n`;
  summary += keyPoints.map((point, i) => `${getEmoji(i)} ${point.trim()}.`).join('\n\n');
  summary += `\n\n📊 Extracted ${keyPoints.length} key insights from ${sentences.length} discussion points.`;
  
  return summary;
}
