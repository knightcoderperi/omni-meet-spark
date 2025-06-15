import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles, Zap, Palette, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { 
    theme, 
    toggleTheme, 
    isTransitioning, 
    createRippleEffect, 
    isLightMode,
    systemPreference,
    setAutoTheme
  } = useTheme();

  const handleToggle = (e: React.MouseEvent) => {
    createRippleEffect(e);
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    toggleTheme();
  };

  const handleAutoTheme = () => {
    setAutoTheme();
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Auto Theme Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="relative w-10 h-10 rounded-full p-0 overflow-hidden group border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
          onClick={handleAutoTheme}
          title="Auto theme based on time"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="w-4 h-4 text-blue-500" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 bg-blue-500/10 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </Button>
      </motion.div>

      {/* Main Theme Toggle */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        {/* Premium Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`relative w-20 h-12 rounded-full p-0 overflow-hidden group transition-all duration-500 border-2 ${
            isLightMode 
              ? 'bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 border-white/30 shadow-2xl shadow-pink-500/30' 
              : 'bg-gradient-to-r from-gray-800 via-slate-700 to-gray-900 border-blue-500/30 shadow-2xl shadow-blue-500/20'
          } ${isTransitioning ? 'animate-pulse' : ''}`}
          onClick={handleToggle}
          disabled={isTransitioning}
        >
          {/* Dynamic background gradient that shifts */}
          <motion.div 
            className={`absolute inset-0 transition-all duration-500 ${
              isLightMode 
                ? 'bg-gradient-to-r from-yellow-400/40 via-orange-400/40 to-red-400/40' 
                : 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20'
            }`}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          {/* Floating energy particles for light mode */}
          <AnimatePresence>
            {isLightMode && (
              <>
                <motion.div
                  className="absolute top-2 left-2 w-1 h-1 rounded-full bg-yellow-300"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.5, 1]
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="absolute top-3 right-3 w-0.5 h-0.5 rounded-full bg-pink-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.8, 1]
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-2 left-4 w-0.5 h-0.5 rounded-full bg-blue-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.3, 1]
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Main sliding indicator */}
          <motion.div
            className={`absolute left-1 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-500 ${
              isLightMode
                ? 'bg-gradient-to-br from-white via-yellow-100 to-orange-200 border-white/70 shadow-yellow-500/50'
                : 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 border-white/30 shadow-blue-500/40'
            }`}
            animate={{ 
              x: isLightMode ? 28 : 0,
              rotate: isLightMode ? 360 : 0,
              scale: isTransitioning ? [1, 1.2, 1] : 1,
              boxShadow: [
                isLightMode 
                  ? '0 0 20px rgba(255, 193, 7, 0.6)'
                  : '0 0 20px rgba(59, 130, 246, 0.5)',
                isLightMode
                  ? '0 0 40px rgba(255, 152, 0, 0.8)'
                  : '0 0 30px rgba(99, 102, 241, 0.6)',
                isLightMode
                  ? '0 0 20px rgba(255, 193, 7, 0.6)'
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
              animate={{ rotate: isLightMode ? -360 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative"
            >
              <AnimatePresence mode="wait">
                {isLightMode ? (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Sun className="w-5 h-5 text-orange-600 drop-shadow-lg" />
                    
                    {/* Sparkle effect for light mode */}
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-2 h-2 text-yellow-400" />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-5 h-5 text-blue-300 drop-shadow-lg" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Mode labels with premium styling */}
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
                !isLightMode ? 'opacity-100' : 'opacity-0'
              }`}
              animate={{ x: !isLightMode ? 0 : -10 }}
            >
              <span className="text-xs font-bold text-blue-300 tracking-wide">
                PRO
              </span>
            </motion.div>

            {/* Light mode label */}
            <motion.div
              className={`absolute right-12 flex items-center space-x-1 transition-all duration-300 ${
                isLightMode ? 'opacity-100' : 'opacity-0'
              }`}
              animate={{ x: isLightMode ? 0 : 10 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-3 h-3 text-orange-500" />
              </motion.div>
              <span className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent tracking-wide">
                VIB
              </span>
            </motion.div>
          </motion.div>

          {/* Enhanced shimmer effect */}
          <motion.div
            className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
              isLightMode
                ? 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
                : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'
            }`}
            style={{ width: '200%' }}
          />

          {/* Status indicator dots */}
          <motion.div
            className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
              isLightMode 
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
          <AnimatePresence>
            {isLightMode && (
              <motion.div
                className="absolute inset-0 border-2 border-transparent rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  borderColor: [
                    'rgba(255, 193, 7, 0.3)',
                    'rgba(255, 152, 0, 0.3)', 
                    'rgba(255, 87, 34, 0.3)',
                    'rgba(233, 30, 99, 0.3)',
                    'rgba(255, 193, 7, 0.3)'
                  ],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  borderColor: { duration: 4, repeat: Infinity },
                  scale: { duration: 2, repeat: Infinity, delay: 0.5 }
                }}
              />
            )}
          </AnimatePresence>
        </Button>

        {/* System preference indicator */}
        <motion.div
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
            systemPreference === 'light' ? 'bg-yellow-400' : 'bg-blue-500'
          }`}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          title={`System prefers ${systemPreference} mode`}
        />
      </motion.div>

      {/* Theme status text */}
      <motion.div
        className="hidden sm:block"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className={`text-xs font-medium transition-colors duration-300 ${
          isLightMode 
            ? 'text-orange-600 dark:text-orange-400' 
            : 'text-blue-500'
        }`}>
          {isLightMode ? 'Vibrant Mode' : 'Pro Mode'}
        </span>
      </motion.div>
    </div>
  );
};

export default ThemeToggle;
