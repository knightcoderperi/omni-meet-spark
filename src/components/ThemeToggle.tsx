
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="relative w-16 h-8 rounded-full p-0 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-all duration-300 border border-slate-300/50 dark:border-slate-600/50 shadow-lg dark:shadow-cyan-500/10"
      >
        <motion.div
          className="absolute w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-400 dark:to-purple-600 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm"
          animate={{
            x: isDark ? 2 : 34,
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 700, 
            damping: 30,
            duration: 0.3
          }}
        >
          <motion.div
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-white drop-shadow-sm" />
            ) : (
              <Sun className="w-4 h-4 text-white drop-shadow-sm" />
            )}
          </motion.div>
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
