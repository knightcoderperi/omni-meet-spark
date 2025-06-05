
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, CheckCircle, XCircle, AlertTriangle, 
  Clock, Cpu, Zap, Globe, Brain, Target,
  RefreshCw, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AIFeatureValidator } from '@/services/aiFeatureValidator';
import { useToast } from '@/hooks/use-toast';

interface SystemValidationDashboardProps {
  meetingId: string;
}

const SystemValidationDashboard: React.FC<SystemValidationDashboardProps> = ({ meetingId }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [endToEndResults, setEndToEndResults] = useState<any>(null);
  const { toast } = useToast();

  const validator = new AIFeatureValidator();

  const runSystemCheck = async () => {
    setIsRunning(true);
    try {
      toast({
        title: "System Validation Started",
        description: "Running comprehensive AI features check...",
      });

      const results = await validator.runComprehensiveSystemCheck(meetingId);
      setValidationResults(results);

      const workflowResults = await validator.testEndToEndWorkflow(meetingId);
      setEndToEndResults(workflowResults);

      toast({
        title: "Validation Complete",
        description: `System status: ${results.overallStatus}`,
        variant: results.overallStatus === 'CRITICAL' ? 'destructive' : 'default'
      });

    } catch (error) {
      console.error('Validation failed:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to complete system validation",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'OPERATIONAL':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'FAIL':
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'OPERATIONAL':
        return 'bg-green-500';
      case 'DEGRADED':
        return 'bg-yellow-500';
      case 'FAIL':
      case 'CRITICAL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            AI Features System Validation
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive testing of Smart Summary, Task Generator, and Translation Chatbot
          </p>
        </div>
        
        <Button
          onClick={runSystemCheck}
          disabled={isRunning}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isRunning ? 'Running Tests...' : 'Run System Check'}
        </Button>
      </div>

      {/* Overall Status */}
      {validationResults && (
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {getStatusIcon(validationResults.overallStatus)}
              <span>Overall System Status: {validationResults.overallStatus}</span>
              <Badge variant={validationResults.overallStatus === 'OPERATIONAL' ? 'default' : 'destructive'}>
                {validationResults.overallStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-semibold">
                    {validationResults.resourceUsage.memoryUsage.toFixed(2)} MB
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Memory Usage</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold">
                    {validationResults.resourceUsage.averageResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Response Time</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-semibold">
                    {new Date(validationResults.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Last Check</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Test Results */}
      {validationResults && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Smart Capsule Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <span>Smart Capsule Summary</span>
                  {getStatusIcon(validationResults.smartCapsuleSummary.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Whisper Transcription</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.smartCapsuleSummary.details.whisperTranscription}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Summary Generation</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.smartCapsuleSummary.details.summaryGeneration}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">TTS Output</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.smartCapsuleSummary.details.ttsOutput}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Latency</span>
                    <span>{validationResults.smartCapsuleSummary.latency}ms</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (2000 - validationResults.smartCapsuleSummary.latency) / 20)} 
                    className="h-2"
                  />
                </div>

                {validationResults.smartCapsuleSummary.errorMessage && (
                  <div className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {validationResults.smartCapsuleSummary.errorMessage}
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-green-500" />
                  <span>AI Task Generator</span>
                  {getStatusIcon(validationResults.aiTaskGenerator.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Groq API</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.aiTaskGenerator.details.groqAPI}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Task Extraction</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.aiTaskGenerator.details.taskExtraction}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Integration</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.aiTaskGenerator.details.platformIntegration}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{validationResults.aiTaskGenerator.details.successRate}%</span>
                  </div>
                  <Progress 
                    value={validationResults.aiTaskGenerator.details.successRate} 
                    className="h-2"
                  />
                </div>

                {validationResults.aiTaskGenerator.errorMessage && (
                  <div className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {validationResults.aiTaskGenerator.errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Translation Chatbot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <span>Translation Chatbot</span>
                  {getStatusIcon(validationResults.translationChatbot.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Speech Recognition</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.translationChatbot.details.speechRecognition}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Translation Engine</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.translationChatbot.details.translationEngine}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Multi-language Support</span>
                    <Badge variant="outline" className="text-xs">
                      {validationResults.translationChatbot.details.multiLanguageSupport}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time</span>
                    <span>{validationResults.translationChatbot.details.responseTime?.toFixed(2)}s</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (5 - (validationResults.translationChatbot.details.responseTime || 0)) * 20)} 
                    className="h-2"
                  />
                </div>

                {validationResults.translationChatbot.errorMessage && (
                  <div className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {validationResults.translationChatbot.errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* End-to-End Workflow Results */}
      {endToEndResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 text-indigo-500" />
              <span>End-to-End Workflow Test</span>
              {getStatusIcon(endToEndResults.success ? 'PASS' : 'FAIL')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3">
                  Completed Steps ({endToEndResults.steps.length})
                </h4>
                <ul className="space-y-2">
                  {endToEndResults.steps.map((step: string, index: number) => (
                    <li key={index} className="text-sm text-green-600 dark:text-green-400">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3">
                  Errors ({endToEndResults.errors.length})
                </h4>
                {endToEndResults.errors.length > 0 ? (
                  <ul className="space-y-2">
                    {endToEndResults.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No errors detected</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Workflow Time:</span>
                <Badge variant="outline">{endToEndResults.totalTime}ms</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResults.overallStatus !== 'OPERATIONAL' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    🔧 <strong>Performance Alert:</strong> System is not fully operational. Review failed components above.
                  </p>
                </div>
              )}
              
              {validationResults.resourceUsage.averageResponseTime > 2000 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ⚡ <strong>Performance Optimization:</strong> Response times are high. Consider implementing caching or API optimization.
                  </p>
                </div>
              )}
              
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ <strong>Best Practice:</strong> Regular validation helps maintain system reliability. Run checks after updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemValidationDashboard;
