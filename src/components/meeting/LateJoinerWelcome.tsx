
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Clock, Users, MessageSquare, Sparkles, 
  Play, FileText, X, ArrowRight, Volume2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface LateJoinerWelcomeProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenSmartCapsule: () => void;
  missedDuration: number;
  participantCount: number;
  meetingTitle: string;
}

const LateJoinerWelcome: React.FC<LateJoinerWelcomeProps> = ({
  isVisible,
  onClose,
  onOpenSmartCapsule,
  missedDuration,
  participantCount,
  meetingTitle
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
    }
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} minute${mins > 1 ? 's' : ''} and ${secs} second${secs > 1 ? 's' : ''}`;
    }
    return `${secs} second${secs > 1 ? 's' : ''}`;
  };

  const getSummaryOptions = () => {
    const baseOptions = [
      {
        duration: "10s",
        title: "Quick Snapshot",
        description: "Single key takeaway",
        icon: Sparkles,
        color: "from-green-500 to-emerald-500"
      },
      {
        duration: "30s", 
        title: "Essential Points",
        description: "Main decisions & actions",
        icon: MessageSquare,
        color: "from-blue-500 to-cyan-500"
      }
    ];

    if (missedDuration > 300) { // More than 5 minutes
      baseOptions.push({
        duration: "1min",
        title: "Complete Overview", 
        description: "Full context & details",
        icon: FileText,
        color: "from-purple-500 to-pink-500"
      });
    }

    return baseOptions;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                  animate={{ rotate: showAnimation ? 360 : 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome Back! 🎯
                  </h2>
                  <p className="text-purple-100">
                    You're joining "{meetingTitle}"
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Meeting Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div
                className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {formatTime(missedDuration)}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-500">
                  Time Missed
                </div>
              </motion.div>

              <motion.div
                className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {participantCount}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                  Active Participants
                </div>
              </motion.div>

              <motion.div
                className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Brain className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-bold text-green-700 dark:text-green-400">
                  AI Ready
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">
                  Smart Summary
                </div>
              </motion.div>
            </div>

            <Separator className="my-6" />

            {/* Call to Action */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">
                🚀 Get Caught Up Instantly
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our AI has been listening and can summarize what you missed in seconds
              </p>
            </div>

            {/* Summary Options */}
            <div className="grid gap-3 mb-6">
              {getSummaryOptions().map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.duration}
                    className={`
                      p-4 rounded-xl border-2 border-transparent hover:border-purple-300 
                      bg-gradient-to-r ${option.color} text-white
                      transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                      flex items-center justify-between group
                    `}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={onOpenSmartCapsule}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-semibold">
                          {option.title} ({option.duration})
                        </div>
                        <div className="text-sm opacity-90">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                );
              })}
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Volume2 className="w-4 h-4" />
                <span>Audio + Text summaries available</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LateJoinerWelcome;
