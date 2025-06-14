import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme, isTransitioning } = useTheme();

  const handleToggle = () => {
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    toggleTheme();
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {/* Ultimate Toggle Button - 70px width pill design */}
      <Button
        variant="ghost"
        size="sm"
        className={`relative w-[70px] h-12 rounded-full p-0 overflow-hidden group transition-all duration-500 border-2 ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 border-white/30 shadow-2xl shadow-pink-500/30' 
            : 'bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 border-blue-500/30 shadow-2xl shadow-blue-500/20'
        } ${isTransitioning ? 'animate-pulse' : ''}`}
        onClick={handleToggle}
        disabled={isTransitioning}
      >
        {/* Dynamic background gradient that shifts */}
        <motion.div 
          className={`absolute inset-0 transition-all duration-500 ${
            theme === 'light' 
              ? 'bg-gradient-to-r from-orange-400/40 via-pink-400/40 to-purple-400/40' 
              : 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20'
          }`}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        />
        
        {/* Floating energy particles for light mode */}
        {theme === 'light' && (
          <>
            <motion.div
              className="absolute top-2 left-2 w-1 h-1 rounded-full bg-yellow-300"
              animate={{
                y: [0, -8, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.5, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="absolute top-3 right-3 w-0.5 h-0.5 rounded-full bg-pink-400"
              animate={{
                y: [0, -6, 0],
                opacity: [0.8, 1, 0.8],
                scale: [1, 1.8, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-2 left-4 w-0.5 h-0.5 rounded-full bg-blue-400"
              animate={{
                y: [0, -4, 0],
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* Main sliding indicator with personality-based design */}
        <motion.div
          className={`absolute left-1 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-500 ${
            theme === 'light'
              ? 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 border-white/50 shadow-pink-500/50'
              : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 border-white/30 shadow-blue-500/40'
          }`}
          animate={{ 
            x: theme === 'dark' ? 0 : 26,
            rotate: theme === 'dark' ? 0 : 360,
            scale: isTransitioning ? [1, 1.2, 1] : 1,
            boxShadow: [
              theme === 'light' 
                ? '0 0 20px rgba(236, 72, 153, 0.6)'
                : '0 0 20px rgba(59, 130, 246, 0.5)',
              theme === 'light'
                ? '0 0 40px rgba(168, 85, 247, 0.8)'
                : '0 0 30px rgba(99, 102, 241, 0.6)',
              theme === 'light'
                ? '0 0 20px rgba(236, 72, 153, 0.6)'
                : '0 0 20px rgba(59, 130, 246, 0.5)'
            ]
          }}
          transition={{ 
            x: { type: "spring", stiffness: 500, damping: 30 },
            rotate: { type: "spring", stiffness: 500, damping: 30 },
            scale: { duration: 0.3 },
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          {/* Icon with counter-rotation to keep upright */}
          <motion.div
            animate={{ rotate: theme === 'dark' ? 0 : -360 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="relative"
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-white drop-shadow-lg" />
            ) : (
              <Sun className="w-5 h-5 text-white drop-shadow-lg" />
            )}
            
            {/* Sparkle effect for light mode */}
            {theme === 'light' && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-2 h-2 text-yellow-300" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Mode labels with personality */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            opacity: { duration: 2.5, repeat: Infinity }
          }}
        >
          {/* Dark mode label */}
          <motion.div
            className={`absolute left-12 flex items-center space-x-1 transition-all duration-300 ${
              theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`}
            animate={{ x: theme === 'dark' ? 0 : -10 }}
          >
            <span className="text-xs font-bold text-blue-300 tracking-wide">
              PRO
            </span>
          </motion.div>

          {/* Light mode label */}
          <motion.div
            className={`absolute right-12 flex items-center space-x-1 transition-all duration-300 ${
              theme === 'light' ? 'opacity-100' : 'opacity-0'
            }`}
            animate={{ x: theme === 'light' ? 0 : 10 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-3 h-3 text-yellow-300" />
            </motion.div>
            <span className="text-xs font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent tracking-wide">
              VIB
            </span>
          </motion.div>
        </motion.div>

        {/* Enhanced shimmer effect with personality */}
        <motion.div
          className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
              : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
          }`}
          style={{ width: '200%' }}
        />

        {/* Personality indicator dots */}
        <motion.div
          className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
            theme === 'light' 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
              : 'bg-gradient-to-br from-blue-400 to-indigo-500'
          }`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />

        {/* Energy rings for light mode */}
        {theme === 'light' && (
          <motion.div
            className="absolute inset-0 border-2 border-transparent rounded-full"
            animate={{
              borderColor: [
                'rgba(255, 107, 107, 0.3)',
                'rgba(254, 202, 87, 0.3)', 
                'rgba(72, 219, 251, 0.3)',
                'rgba(255, 159, 243, 0.3)',
                'rgba(255, 107, 107, 0.3)'
              ],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              borderColor: { duration: 4, repeat: Infinity },
              scale: { duration: 2, repeat: Infinity, delay: 0.5 }
            }}
          />
        )}
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
