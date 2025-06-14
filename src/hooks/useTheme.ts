
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme] = useState<'dark'>('dark');

  useEffect(() => {
    // Force premium dark theme globally
    const root = document.documentElement;
    root.classList.add('dark');
    
    // Add premium dark theme CSS variables
    root.style.setProperty('--background-primary', '#0a0a0a');
    root.style.setProperty('--background-secondary', '#111111');
    root.style.setProperty('--background-tertiary', '#1a1a1a');
    root.style.setProperty('--surface-primary', '#1f1f1f');
    root.style.setProperty('--surface-secondary', '#2a2a2a');
    root.style.setProperty('--surface-tertiary', '#333333');
    root.style.setProperty('--accent-blue', '#0066ff');
    root.style.setProperty('--accent-green', '#00ff88');
    root.style.setProperty('--accent-purple', '#8b5cf6');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e5e5e5');
    root.style.setProperty('--text-muted', '#9ca3af');
    
    localStorage.setItem('omnimeet-theme', 'dark');
    
    // Add premium font loading
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
  }, []);

  return { theme };
};
