
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsDark(!isDark)}
      className="relative w-12 h-6 rounded-full p-0 bg-gray-600/20 backdrop-blur-sm"
    >
      <motion.div
        className="absolute w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
        animate={{
          x: isDark ? 2 : 26,
          backgroundColor: isDark ? '#3b82f6' : '#f59e0b'
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <span className="text-xs">🌙</span>
        <span className="text-xs">☀️</span>
      </div>
    </Button>
  );
};

export default ThemeToggle;
