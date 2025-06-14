
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('omnimeet-theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.remove('light');
      body.classList.add('dark-mode-enhanced');
      body.classList.remove('light-mode-enhanced');
      
      // Premium dark theme CSS variables
      root.style.setProperty('--background-primary', '#0a0a0a');
      root.style.setProperty('--background-secondary', '#111111');
      root.style.setProperty('--background-tertiary', '#1a1a1a');
      root.style.setProperty('--surface-primary', '#1f1f1f');
      root.style.setProperty('--surface-secondary', '#2a2a2a');
      root.style.setProperty('--surface-tertiary', '#333333');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.add('light');
      body.classList.remove('dark-mode-enhanced');
      body.classList.add('light-mode-enhanced');
      
      // Premium light theme CSS variables
      root.style.setProperty('--background-primary', '#ffffff');
      root.style.setProperty('--background-secondary', '#f8fafc');
      root.style.setProperty('--background-tertiary', '#f1f5f9');
      root.style.setProperty('--surface-primary', '#ffffff');
      root.style.setProperty('--surface-secondary', '#f8fafc');
      root.style.setProperty('--surface-tertiary', '#e2e8f0');
    }
    
    // Common theme variables
    root.style.setProperty('--accent-blue', newTheme === 'light' ? '#3b82f6' : '#0066ff');
    root.style.setProperty('--accent-green', newTheme === 'light' ? '#22c55e' : '#00ff88');
    root.style.setProperty('--accent-purple', newTheme === 'light' ? '#9333ea' : '#8b5cf6');
    root.style.setProperty('--text-primary', newTheme === 'dark' ? '#ffffff' : '#1e293b');
    root.style.setProperty('--text-secondary', newTheme === 'dark' ? '#e5e5e5' : '#475569');
    root.style.setProperty('--text-muted', newTheme === 'dark' ? '#9ca3af' : '#64748b');
    
    localStorage.setItem('omnimeet-theme', newTheme);
    
    // Add premium font loading
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = 'https://fonts.googleapis.com';
      document.head.appendChild(link);
      
      const link2 = document.createElement('link');
      link2.rel = 'preconnect';
      link2.href = 'https://fonts.gstatic.com';
      link2.crossOrigin = 'anonymous';
      document.head.appendChild(link2);
      
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap';
      document.head.appendChild(fontLink);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
};
