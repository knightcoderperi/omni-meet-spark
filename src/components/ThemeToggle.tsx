
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full p-0 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
    >
      <motion.div
        className="absolute w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-400 dark:to-purple-600 rounded-full shadow-lg flex items-center justify-center"
        animate={{
          x: isDark ? 2 : 30,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-white" />
        )}
      </motion.div>
    </Button>
  );
};

export default ThemeToggle;
