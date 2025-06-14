
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
        className={`relative w-20 h-10 rounded-2xl p-0 glass-premium cursor-pointer overflow-hidden group ${
          theme === 'light' ? 'light' : ''
        }`}
        onClick={toggleTheme}
      >
        {/* Animated background gradient */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-r animate-gradient ${
            theme === 'light' 
              ? 'from-blue-400/20 via-purple-400/20 to-blue-600/20' 
              : 'from-blue-600/20 via-purple-600/20 to-blue-800/20'
          }`}
          style={{ backgroundSize: '200% 200%' }}
        />
        
        {/* Floating particles */}
        <motion.div
          className={`absolute top-1 left-2 w-1 h-1 rounded-full opacity-60 ${
            theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
          }`}
          animate={{
            y: [0, -4, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className={`absolute top-2 right-3 w-0.5 h-0.5 rounded-full opacity-80 ${
            theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'
          }`}
          animate={{
            y: [0, -3, 0],
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className={`absolute bottom-2 left-4 w-0.5 h-0.5 rounded-full opacity-70 ${
            theme === 'light' ? 'bg-cyan-500' : 'bg-cyan-400'
          }`}
          animate={{
            y: [0, -2, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        {/* Main toggle indicator */}
        <motion.div
          className={`absolute left-1 w-8 h-8 rounded-xl shadow-lg flex items-center justify-center backdrop-blur-sm border ${
            theme === 'light'
              ? 'bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 border-white/30'
              : 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 border-white/20'
          }`}
          animate={{ 
            x: theme === 'dark' ? 0 : 44,
            boxShadow: [
              theme === 'light' 
                ? '0 0 10px rgba(59, 130, 246, 0.4)'
                : '0 0 10px rgba(59, 130, 246, 0.3)',
              theme === 'light'
                ? '0 0 20px rgba(147, 51, 234, 0.5)'
                : '0 0 20px rgba(139, 92, 246, 0.4)',
              theme === 'light'
                ? '0 0 10px rgba(59, 130, 246, 0.4)'
                : '0 0 10px rgba(59, 130, 246, 0.3)'
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
          <Sparkles className={`w-3 h-3 ${
            theme === 'light' ? 'text-cyan-500' : 'text-cyan-400'
          }`} />
          <span className={`text-xs font-medium bg-gradient-to-r bg-clip-text text-transparent ${
            theme === 'light' 
              ? 'from-cyan-600 to-purple-600' 
              : 'from-cyan-400 to-purple-400'
          }`}>
            {theme.toUpperCase()}
          </span>
        </motion.div>

        {/* Shimmer effect on hover */}
        <motion.div
          className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
              : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
          }`}
          style={{ width: '200%' }}
        />
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
