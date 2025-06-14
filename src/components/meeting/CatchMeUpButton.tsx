
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CatchMeUpButtonProps {
  meetingDuration: number;
  joinTime: number;
  onOpenSmartCapsule: () => void;
  isMobile?: boolean;
}

const CatchMeUpButton: React.FC<CatchMeUpButtonProps> = ({
  meetingDuration,
  joinTime,
  onOpenSmartCapsule,
  isMobile = false
}) => {
  const [missedDuration, setMissedDuration] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const missed = Math.max(0, meetingDuration - joinTime);
    setMissedDuration(missed);
    
    // Show pulse animation if user missed more than 1 minute
    if (missed > 60) {
      setShowPulse(true);
      
      // Show helpful toast for late joiners
      toast({
        title: "⏰ You joined late!",
        description: `Click "Catch Me Up" to get an AI summary of the ${formatTime(missed)} you missed`,
        duration: 8000,
      });
    }
  }, [meetingDuration, joinTime, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleCatchMeUp = () => {
    onOpenSmartCapsule();
    setShowPulse(false);
    
    toast({
      title: "🧠 AI Catch-Up Starting",
      description: "Generating intelligent summary of what you missed...",
    });
  };

  // Don't show if user hasn't missed much
  if (missedDuration < 30) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <Button
        onClick={handleCatchMeUp}
        size={isMobile ? "sm" : "default"}
        className={`
          relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
          text-white font-semibold shadow-lg border-0 transition-all duration-300
          ${showPulse ? 'animate-pulse' : ''}
          ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}
        `}
      >
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Brain className="w-4 h-4" />
          {!isMobile && <span>Catch Me Up</span>}
          {isMobile && <span>Catch Up</span>}
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white text-xs ml-1 animate-bounce"
          >
            {formatTime(missedDuration)}
          </Badge>
        </motion.div>
      </Button>

      {/* Attention-grabbing pulse ring */}
      {showPulse && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-purple-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Floating indicator for high missed time */}
      {missedDuration > 300 && ( // More than 5 minutes
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>High Priority</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CatchMeUpButton;
