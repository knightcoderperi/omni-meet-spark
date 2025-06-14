
interface GroqTranslationResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  timeframe?: string;
}

export class GroqTranslationService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama3-8b-8192';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translateMeetingContent(
    audioText: string, 
    targetLanguage: string, 
    timeframe: string,
    context?: {
      participants?: string[];
      topics?: string[];
      decisions?: string[];
    }
  ): Promise<string> {
    const prompt = this.buildTranslationPrompt(audioText, targetLanguage, timeframe, context);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
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
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data: GroqTranslationResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq translation error:', error);
      throw new Error('Translation service temporarily unavailable');
    }
  }

  private buildTranslationPrompt(
    text: string, 
    targetLang: string, 
    timeframe: string,
    context?: {
      participants?: string[];
      topics?: string[];
      decisions?: string[];
    }
  ): string {
    const languageName = this.getLanguageName(targetLang);
    
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
  }

  private getLanguageName(code: string): string {
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
  }

  // Parse natural language translation requests
  parseTranslationRequest(message: string): {
    type: 'timeframe' | 'entire_meeting' | 'custom_query' | 'realtime';
    minutes?: number;
    query?: string;
  } {
    const timeRegex = /last (\d+) minutes?/i;
    const entireRegex = /entire meeting|whole meeting|full meeting/i;
    const realtimeRegex = /right now|currently|what.*saying now/i;
    
    if (timeRegex.test(message)) {
      const minutes = parseInt(message.match(timeRegex)![1]);
      return { type: 'timeframe', minutes };
    }
    
    if (entireRegex.test(message)) {
      return { type: 'entire_meeting' };
    }
    
    if (realtimeRegex.test(message)) {
      return { type: 'realtime' };
    }
    
    return { type: 'custom_query', query: message };
  }

  // Batch translation for multiple segments
  async batchTranslate(requests: TranslationRequest[]): Promise<string[]> {
    const translations = await Promise.all(
      requests.map(async (request) => {
        return await this.translateMeetingContent(
          request.text,
          request.targetLanguage,
          request.timeframe || 'segment',
          request.context ? JSON.parse(request.context) : undefined
        );
      })
    );
    
    return translations;
  }

  // Real-time translation for live content
  async translateRealTime(
    currentText: string,
    targetLanguage: string,
    previousContext: string = ''
  ): Promise<string> {
    const contextualPrompt = `
Context from previous conversation:
${previousContext}

Current text to translate:
"${currentText}"

Please provide a real-time translation to ${this.getLanguageName(targetLanguage)} that:
1. Maintains continuity with the previous context
2. Handles incomplete sentences gracefully
3. Preserves the speaker's intent
4. Uses appropriate real-time translation conventions

Translation:
    `;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a real-time meeting translator. Provide smooth, contextual translations that work well for live speech.'
            },
            {
              role: 'user',
              content: contextualPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        })
      });

      const data: GroqTranslationResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Real-time translation error:', error);
      throw new Error('Real-time translation unavailable');
    }
  }
}

export default GroqTranslationService;
