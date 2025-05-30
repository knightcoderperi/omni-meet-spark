
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Globe, FileText, ListTodo, Clock, 
  Languages, Mic, MicOff, Download, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface AIAssistantPanelProps {
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'translate' | 'summary' | 'tasks'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m your AI assistant. I can help with translations, meeting summaries, and generating action items. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' }
  ];

  const tabs = [
    { id: 'chat', icon: Send, label: 'Chat' },
    { id: 'translate', icon: Languages, label: 'Translate' },
    { id: 'summary', icon: FileText, label: 'Summary' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' }
  ];

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'I understand your request. Let me help you with that...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const generateSummary = () => {
    const summary = {
      id: Date.now().toString(),
      type: 'ai',
      content: `**Meeting Summary:**
      
📊 **Key Discussion Points:**
• Project timeline and milestones
• Resource allocation for Q2
• Client feedback implementation

✅ **Decisions Made:**
• Moving forward with Option A for the UI redesign
• Weekly sprint reviews starting next Monday
• Budget approval for additional team member

🎯 **Action Items:**
• Sarah to prepare mockups by Friday
• John to coordinate with the dev team
• Mike to schedule client review meeting`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, summary]);
  };

  const generateTasks = () => {
    const tasks = {
      id: Date.now().toString(),
      type: 'ai',
      content: `**Generated Action Items:**

🔹 **For Developers:**
• Implement user authentication flow
• Optimize database queries for performance
• Set up CI/CD pipeline

🔹 **For Designers:**
• Create wireframes for mobile app
• Design system documentation
• User testing session setup

🔹 **For Project Managers:**
• Update project timeline
• Schedule client checkpoint meeting
• Resource planning for next quarter`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, tasks]);
  };

  const translateLast5Minutes = () => {
    const translation = {
      id: Date.now().toString(),
      type: 'ai',
      content: `**Translation (Last 5 minutes):**

🇬🇧 **English:** "Let's move forward with the new design approach."
🇮🇳 **Hindi:** "आइए नए डिज़ाइन दृष्टिकोण के साथ आगे बढ़ते हैं।"

🇬🇧 **English:** "The deadline is next Friday."
🇮🇳 **Hindi:** "समय सीमा अगले शुक्रवार है।"

🇬🇧 **English:** "Great work everyone!"
🇮🇳 **Hindi:** "सभी का बहुत अच्छा काम!"`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, translation]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl rounded-bl-md'
                  } px-4 py-3`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-1 opacity-70 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200/50 dark:border-white/10">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ask AI anything about the meeting..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="bg-slate-100 dark:bg-slate-800 border-0 pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleListening}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 ${
                      isListening ? 'text-red-500' : 'text-slate-400'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'translate':
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2 block">
                  Translate to:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-gray-300"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={translateLast5Minutes}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Globe className="w-4 h-4 mr-2" />
                Translate Last 5 Minutes
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                <Languages className="w-4 h-4 mr-2" />
                Real-time Translation (Beta)
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Quick Actions</h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                  <p>• Ask "What did John say about the budget?"</p>
                  <p>• Request "Translate the last discussion in Hindi"</p>
                  <p>• Say "Explain the technical terms used"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'summary':
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <Button
                onClick={generateSummary}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Meeting Summary
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timeline View
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Summary
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Summary Features</h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                  <p>• Key discussion points</p>
                  <p>• Decisions made</p>
                  <p>• Important timestamps</p>
                  <p>• Participant contributions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'tasks':
        return (
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <Button
                onClick={generateTasks}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <ListTodo className="w-4 h-4 mr-2" />
                Generate Action Items
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-800 dark:text-white mb-2">Task Categories</h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                  <p>🔹 Developer tasks</p>
                  <p>🔹 Designer tasks</p>
                  <p>🔹 Project manager tasks</p>
                  <p>🔹 Follow-up meetings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-white/90 dark:bg-black/80 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            AI Assistant
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/50 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 p-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAssistantPanel;
