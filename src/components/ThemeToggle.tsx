
import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme, isTransitioning } = useTheme();

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <Button
        variant="ghost"
        size="sm"
        className={`relative w-24 h-12 rounded-3xl p-0 glass-premium cursor-pointer overflow-hidden group transition-all duration-500 ${
          theme === 'light' ? 'light theme-toggle-light' : 'theme-toggle-dark'
        } ${isTransitioning ? 'animate-pulse' : ''}`}
        onClick={toggleTheme}
        disabled={isTransitioning}
      >
        {/* Enhanced animated background gradient */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-r animate-gradient transition-all duration-500 ${
            theme === 'light' 
              ? 'from-orange-400/30 via-blue-400/30 to-green-400/30' 
              : 'from-blue-600/20 via-purple-600/20 to-blue-800/20'
          }`}
          style={{ backgroundSize: '200% 200%' }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Enhanced floating particles */}
        <motion.div
          className={`absolute top-2 left-3 w-1.5 h-1.5 rounded-full ${
            theme === 'light' ? 'bg-orange-500' : 'bg-blue-400'
          }`}
          animate={{
            y: [0, -6, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className={`absolute top-3 right-4 w-1 h-1 rounded-full ${
            theme === 'light' ? 'bg-blue-500' : 'bg-purple-400'
          }`}
          animate={{
            y: [0, -4, 0],
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
        />
        <motion.div
          className={`absolute bottom-2 left-5 w-0.5 h-0.5 rounded-full ${
            theme === 'light' ? 'bg-green-500' : 'bg-cyan-400'
          }`}
          animate={{
            y: [0, -3, 0],
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.4, 1]
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1.2 }}
        />

        {/* Enhanced main toggle indicator */}
        <motion.div
          className={`absolute left-1 w-10 h-10 rounded-2xl shadow-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-500 ${
            theme === 'light'
              ? 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 border-white/40 shadow-orange-500/30'
              : 'bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 border-white/20 shadow-blue-500/30'
          }`}
          animate={{ 
            x: theme === 'dark' ? 0 : 54,
            rotate: theme === 'dark' ? 0 : 180,
            scale: isTransitioning ? [1, 1.1, 1] : 1,
            boxShadow: [
              theme === 'light' 
                ? '0 0 15px rgba(251, 146, 60, 0.5)'
                : '0 0 15px rgba(59, 130, 246, 0.4)',
              theme === 'light'
                ? '0 0 30px rgba(239, 68, 68, 0.6)'
                : '0 0 25px rgba(139, 92, 246, 0.5)',
              theme === 'light'
                ? '0 0 15px rgba(251, 146, 60, 0.5)'
                : '0 0 15px rgba(59, 130, 246, 0.4)'
            ]
          }}
          transition={{ 
            x: { type: "spring", stiffness: 400, damping: 25 },
            rotate: { type: "spring", stiffness: 400, damping: 25 },
            scale: { duration: 0.3 },
            boxShadow: { duration: 2.5, repeat: Infinity }
          }}
        >
          <motion.div
            animate={{ rotate: theme === 'dark' ? 0 : -180 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-white drop-shadow-lg" />
            ) : (
              <Sun className="w-5 h-5 text-white drop-shadow-lg" />
            )}
          </motion.div>
        </motion.div>

        {/* Enhanced theme label with color palette indicator */}
        <motion.div 
          className="absolute right-2 flex items-center space-x-1.5"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            x: theme === 'light' ? -54 : 0 
          }}
          transition={{ 
            opacity: { duration: 2.5, repeat: Infinity },
            x: { type: "spring", stiffness: 400, damping: 25 }
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Palette className={`w-3.5 h-3.5 ${
              theme === 'light' ? 'text-orange-600' : 'text-cyan-400'
            }`} />
          </motion.div>
          <span className={`text-xs font-semibold bg-gradient-to-r bg-clip-text text-transparent tracking-wide ${
            theme === 'light' 
              ? 'from-orange-600 to-red-600' 
              : 'from-cyan-400 to-blue-400'
          }`}>
            {theme.toUpperCase()}
          </span>
        </motion.div>

        {/* Enhanced shimmer effect on hover with color adaptation */}
        <motion.div
          className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-transparent via-orange-300/30 to-transparent'
              : 'bg-gradient-to-r from-transparent via-white/15 to-transparent'
          }`}
          style={{ width: '200%' }}
        />

        {/* Theme-specific corner accent */}
        <motion.div
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            theme === 'light' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-purple-500'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
