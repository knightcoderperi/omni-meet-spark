
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Smile, Paperclip, MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'file';
  isPrivate?: boolean;
}

interface ChatPanelProps {
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'John Doe',
      content: 'Welcome to the meeting everyone! 👋',
      timestamp: new Date(Date.now() - 300000),
      type: 'text'
    },
    {
      id: '2',
      sender: 'Sarah Wilson',
      content: 'Thanks for organizing this!',
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    },
    {
      id: '3',
      sender: 'Mike Chen',
      content: '🎉',
      timestamp: new Date(Date.now() - 180000),
      type: 'emoji'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const sendEmoji = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: emoji,
      timestamp: new Date(),
      type: 'emoji'
    };
    
    setMessages(prev => [...prev, message]);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉', '🤔', '👋'];

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
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Chat
          </h3>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
            {messages.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200/50 dark:border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-100 dark:bg-slate-800 border-0"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.sender === 'You' ? 'order-2' : ''}`}>
                {message.sender !== 'You' && (
                  <p className="text-xs text-slate-500 dark:text-gray-400 mb-1 px-1">
                    {message.sender}
                  </p>
                )}
                <motion.div
                  className={`
                    px-4 py-2 rounded-2xl relative
                    ${message.sender === 'You'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
                    }
                    ${message.type === 'emoji' ? 'text-2xl py-1 px-2' : ''}
                  `}
                  whileHover={{ scale: 1.02 }}
                  layout
                >
                  {message.content}
                  <div className={`
                    text-xs mt-1 opacity-70
                    ${message.sender === 'You' ? 'text-blue-100' : 'text-slate-500 dark:text-gray-400'}
                  `}>
                    {formatTime(message.timestamp)}
                  </div>
                </motion.div>
              </div>
              
              {message.sender === 'You' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium ml-2 order-1">
                  Y
                </div>
              )}
              
              {message.sender !== 'You' && (
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2">
                  {message.sender[0]}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            className="p-3 border-t border-slate-200/50 dark:border-white/10 bg-slate-50 dark:bg-slate-900"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="grid grid-cols-5 gap-2">
              {emojis.map(emoji => (
                <motion.button
                  key={emoji}
                  className="text-2xl p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  onClick={() => sendEmoji(emoji)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-slate-200/50 dark:border-white/10">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="bg-slate-100 dark:bg-slate-800 border-0 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-6 w-6 p-0"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send • Ctrl+Enter for new line
        </p>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
