
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme] = useState<'dark'>('dark');

  useEffect(() => {
    // Always apply dark theme
    const root = document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('omnimeet-theme', 'dark');
  }, []);

  return { theme };
};
