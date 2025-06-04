
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useHuggingFaceAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const summarizeText = useCallback(async (text: string, maxLength: number = 150): Promise<string> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would use Hugging Face Transformers
      // For now, we'll create an intelligent summary
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length <= 3) {
        return text;
      }

      // Extract key sentences based on length and position
      const keyPoints: string[] = [];
      const firstSentence = sentences[0]?.trim();
      const lastSentence = sentences[sentences.length - 1]?.trim();
      
      if (firstSentence) keyPoints.push(firstSentence);
      
      // Add middle sentences that are substantial
      const middleSentences = sentences.slice(1, -1)
        .filter(s => s.trim().split(' ').length > 5)
        .slice(0, 2);
      
      keyPoints.push(...middleSentences.map(s => s.trim()));
      
      if (lastSentence && lastSentence !== firstSentence) {
        keyPoints.push(lastSentence);
      }

      const summary = keyPoints.join('. ');
      
      // Ensure summary doesn't exceed max length
      if (summary.length > maxLength) {
        return summary.substring(0, maxLength - 3) + '...';
      }
      
      return summary;
    } catch (error) {
      console.error('Error summarizing text:', error);
      toast({
        title: "Summarization Error",
        description: "Failed to generate summary",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const extractKeyPoints = useCallback(async (text: string): Promise<string[]> => {
    setIsLoading(true);
    try {
      // Extract potential key points from text
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Look for sentences with key indicators
      const keywordIndicators = [
        'important', 'key', 'main', 'primary', 'essential', 'critical',
        'decision', 'action', 'next', 'follow up', 'task', 'goal',
        'we need to', 'we should', 'we will', 'we must',
        'agreed', 'decided', 'concluded', 'resolved'
      ];

      const keyPoints = sentences
        .filter(sentence => {
          const lowerSentence = sentence.toLowerCase();
          return keywordIndicators.some(keyword => lowerSentence.includes(keyword)) ||
                 sentence.trim().split(' ').length > 8; // Substantial sentences
        })
        .slice(0, 5) // Limit to 5 key points
        .map(s => s.trim());

      return keyPoints.length > 0 ? keyPoints : [text.substring(0, 100) + '...'];
    } catch (error) {
      console.error('Error extracting key points:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeActionItems = useCallback(async (text: string): Promise<string[]> => {
    setIsLoading(true);
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Look for action-oriented language
      const actionIndicators = [
        'will', 'should', 'need to', 'must', 'have to', 'going to',
        'action', 'task', 'todo', 'follow up', 'next step',
        'assign', 'responsible', 'deadline', 'by', 'schedule'
      ];

      const actionItems = sentences
        .filter(sentence => {
          const lowerSentence = sentence.toLowerCase();
          return actionIndicators.some(indicator => lowerSentence.includes(indicator));
        })
        .slice(0, 3)
        .map(s => s.trim());

      return actionItems;
    } catch (error) {
      console.error('Error analyzing action items:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    summarizeText,
    extractKeyPoints,
    analyzeActionItems
  };
};
