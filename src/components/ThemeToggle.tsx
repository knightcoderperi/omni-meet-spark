
import React from 'react';
import { motion } from 'framer-motion';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="relative w-16 h-8 rounded-full p-0 bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600/50 shadow-lg shadow-cyan-500/10 cursor-default"
        disabled
      >
        <motion.div
          className="absolute w-7 h-7 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm"
          style={{ x: 2 }}
        >
          <Moon className="w-4 h-4 text-white drop-shadow-sm" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
