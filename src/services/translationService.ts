
interface TranslationResponse {
  translatedText: string;
  confidence?: number;
}

interface LibreTranslateResponse {
  translatedText: string;
}

// LibreTranslate free API
const LIBRE_TRANSLATE_URL = 'https://libretranslate.de/translate';

// MyMemory free API
const MYMEMORY_API_KEY = '627759678f06bb76a538';
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

export class TranslationService {
  // Primary: LibreTranslate (free, no key required)
  static async translateWithLibreTranslate(
    text: string, 
    sourceLanguage: string, 
    targetLanguage: string
  ): Promise<TranslationResponse> {
    try {
      const response = await fetch(LIBRE_TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.status}`);
      }

      const data: LibreTranslateResponse = await response.json();
      return {
        translatedText: data.translatedText,
        confidence: 0.85 // LibreTranslate doesn't provide confidence scores
      };
    } catch (error) {
      console.error('LibreTranslate error:', error);
      throw error;
    }
  }

  // Fallback: MyMemory API (free tier with key)
  static async translateWithMyMemory(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResponse> {
    try {
      const langPair = `${sourceLanguage}|${targetLanguage}`;
      const url = new URL(MYMEMORY_URL);
      url.searchParams.append('q', text);
      url.searchParams.append('langpair', langPair);
      url.searchParams.append('key', MYMEMORY_API_KEY);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`MyMemory API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus !== 200) {
        throw new Error(`MyMemory API error: ${data.responseDetails}`);
      }

      return {
        translatedText: data.responseData.translatedText,
        confidence: data.responseData.match
      };
    } catch (error) {
      console.error('MyMemory error:', error);
      throw error;
    }
  }

  // Main translation method with fallback
  static async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResponse> {
    // Skip translation if source and target are the same
    if (sourceLanguage === targetLanguage) {
      return {
        translatedText: text,
        confidence: 1.0
      };
    }

    try {
      // Try LibreTranslate first (completely free)
      return await this.translateWithLibreTranslate(text, sourceLanguage, targetLanguage);
    } catch (error) {
      console.warn('LibreTranslate failed, trying MyMemory fallback:', error);
      
      try {
        // Fallback to MyMemory
        return await this.translateWithMyMemory(text, sourceLanguage, targetLanguage);
      } catch (fallbackError) {
        console.error('All translation services failed:', fallbackError);
        throw new Error('Translation service unavailable');
      }
    }
  }

  // Language detection (using LibreTranslate)
  static async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch('https://libretranslate.de/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (!response.ok) {
        throw new Error(`Language detection error: ${response.status}`);
      }

      const data = await response.json();
      return data[0]?.language || 'en'; // Default to English if detection fails
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }

  // Get supported languages from LibreTranslate
  static async getSupportedLanguages(): Promise<Array<{code: string, name: string}>> {
    try {
      const response = await fetch('https://libretranslate.de/languages');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status}`);
      }

      const languages = await response.json();
      return languages.map((lang: any) => ({
        code: lang.code,
        name: lang.name
      }));
    } catch (error) {
      console.error('Failed to fetch supported languages:', error);
      // Return default languages if API fails
      return [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' }
      ];
    }
  }
}
