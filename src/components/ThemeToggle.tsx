
import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="relative w-20 h-10 rounded-2xl p-0 glass-premium cursor-pointer overflow-hidden group"
        onClick={toggleTheme}
      >
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-800/20 animate-gradient"
          style={{ backgroundSize: '200% 200%' }}
        />
        
        {/* Floating particles */}
        <motion.div
          className="absolute top-1 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-60"
          animate={{
            y: [0, -4, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="absolute top-2 right-3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-80"
          animate={{
            y: [0, -3, 0],
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-cyan-400 rounded-full opacity-70"
          animate={{
            y: [0, -2, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        {/* Main toggle indicator */}
        <motion.div
          className="absolute left-1 w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-xl shadow-lg flex items-center justify-center backdrop-blur-sm border border-white/20"
          animate={{ 
            x: theme === 'dark' ? 0 : 44,
            boxShadow: [
              '0 0 10px rgba(59, 130, 246, 0.3)',
              '0 0 20px rgba(139, 92, 246, 0.4)',
              '0 0 10px rgba(59, 130, 246, 0.3)'
            ]
          }}
          transition={{ 
            x: { type: "spring", stiffness: 300, damping: 30 },
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-white drop-shadow-lg" />
          ) : (
            <Sun className="w-4 h-4 text-white drop-shadow-lg" />
          )}
        </motion.div>

        {/* Theme label */}
        <motion.div 
          className="absolute right-2 flex items-center space-x-1"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-xs font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {theme.toUpperCase()}
          </span>
        </motion.div>

        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          style={{ width: '200%' }}
        />
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
