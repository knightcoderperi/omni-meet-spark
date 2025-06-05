
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  feature: string;
  status: 'PASS' | 'FAIL' | 'DEGRADED';
  latency: number;
  details: Record<string, any>;
  errorMessage?: string;
}

interface ValidationTestReportProps {
  results: {
    smartCapsuleSummary: TestResult;
    aiTaskGenerator: TestResult;
    translationChatbot: TestResult;
    overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL';
  };
}

const ValidationTestReport: React.FC<ValidationTestReportProps> = ({ results }) => {
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'OPERATIONAL':
        return '✅';
      case 'DEGRADED':
        return '⚠️';
      case 'FAIL':
      case 'CRITICAL':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getPerformanceScore = (latency: number) => {
    if (latency < 1000) return 'Excellent';
    if (latency < 2000) return 'Good';
    if (latency < 3000) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          🧪 FEATURE STATUS REPORT
        </h2>
        <div className="text-6xl mb-4">
          {getStatusEmoji(results.overallStatus)}
        </div>
        <h3 className="text-2xl font-semibold">
          OVERALL SYSTEM: {results.overallStatus}
        </h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Smart Capsule Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <span>Smart Capsule Summary</span>
                <Badge variant={results.smartCapsuleSummary.status === 'PASS' ? 'default' : 'destructive'}>
                  {results.smartCapsuleSummary.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Whisper Transcription:</span>
                  <Badge variant="outline">
                    {results.smartCapsuleSummary.details.whisperTranscription}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>BART Summarization:</span>
                  <Badge variant="outline">
                    {results.smartCapsuleSummary.details.summaryGeneration}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>TTS Generation:</span>
                  <Badge variant="outline">
                    {results.smartCapsuleSummary.details.ttsOutput}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">End-to-end Latency:</span>
                  <div className="text-right">
                    <div className="font-mono">{(results.smartCapsuleSummary.latency / 1000).toFixed(2)}s</div>
                    <div className="text-xs text-slate-500">
                      {getPerformanceScore(results.smartCapsuleSummary.latency)}
                    </div>
                  </div>
                </div>
              </div>

              {results.smartCapsuleSummary.errorMessage && (
                <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  Error: {results.smartCapsuleSummary.errorMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Task Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🧑‍💻</span>
                <span>AI Task Generator</span>
                <Badge variant={results.aiTaskGenerator.status === 'PASS' ? 'default' : 'destructive'}>
                  {results.aiTaskGenerator.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Groq API:</span>
                  <Badge variant="outline">
                    {results.aiTaskGenerator.details.groqAPI}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Task Extraction:</span>
                  <Badge variant="outline">
                    {results.aiTaskGenerator.details.taskExtraction}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Platform Integration:</span>
                  <Badge variant="outline">
                    {results.aiTaskGenerator.details.platformIntegration}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate:</span>
                  <div className="text-right">
                    <div className="font-mono text-lg">{results.aiTaskGenerator.details.successRate}%</div>
                  </div>
                </div>
              </div>

              {results.aiTaskGenerator.errorMessage && (
                <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  Error: {results.aiTaskGenerator.errorMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Translation Chatbot */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🌍</span>
                <span>Translation Chatbot</span>
                <Badge variant={results.translationChatbot.status === 'PASS' ? 'default' : 'destructive'}>
                  {results.translationChatbot.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Speech Recognition:</span>
                  <Badge variant="outline">
                    {results.translationChatbot.details.speechRecognition}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Translation Engine:</span>
                  <Badge variant="outline">
                    {results.translationChatbot.details.translationEngine}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Multi-language Support:</span>
                  <Badge variant="outline">
                    {results.translationChatbot.details.multiLanguageSupport}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time:</span>
                  <div className="text-right">
                    <div className="font-mono">{results.translationChatbot.details.responseTime?.toFixed(2)}s</div>
                    <div className="text-xs text-slate-500">
                      {getPerformanceScore((results.translationChatbot.details.responseTime || 0) * 1000)}
                    </div>
                  </div>
                </div>
              </div>

              {results.translationChatbot.errorMessage && (
                <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  Error: {results.translationChatbot.errorMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">📊 PERFORMANCE SUMMARY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {[results.smartCapsuleSummary, results.aiTaskGenerator, results.translationChatbot]
                    .filter(r => r.status === 'PASS').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Features Passing</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {[results.smartCapsuleSummary, results.aiTaskGenerator, results.translationChatbot]
                    .filter(r => r.status === 'DEGRADED').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Features Degraded</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {[results.smartCapsuleSummary, results.aiTaskGenerator, results.translationChatbot]
                    .filter(r => r.status === 'FAIL').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Features Failed</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round([results.smartCapsuleSummary.latency, results.aiTaskGenerator.latency, results.translationChatbot.latency]
                    .reduce((sum, latency) => sum + latency, 0) / 3)}ms
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ValidationTestReport;
