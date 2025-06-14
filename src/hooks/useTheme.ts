
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('omnimeet-theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    // Add transition class for smooth theme switching
    body.classList.add('theme-transitioning');
    
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
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e5e5e5');
      root.style.setProperty('--text-muted', '#9ca3af');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.add('light');
      body.classList.remove('dark-mode-enhanced');
      body.classList.add('light-mode-enhanced');
      
      // Premium light theme CSS variables - Swiggy/Zomato inspired
      root.style.setProperty('--background-primary', '#ffffff');
      root.style.setProperty('--background-secondary', '#f8fafc');
      root.style.setProperty('--background-tertiary', '#f1f5f9');
      root.style.setProperty('--surface-primary', '#ffffff');
      root.style.setProperty('--surface-secondary', '#fefefe');
      root.style.setProperty('--surface-tertiary', '#f9fafb');
      root.style.setProperty('--text-primary', '#1a1a1a');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--text-muted', '#718096');
      
      // Light mode specific colors
      root.style.setProperty('--light-accent-orange', '#ff6b35');
      root.style.setProperty('--light-accent-red', '#e53e3e');
      root.style.setProperty('--light-accent-green', '#38a169');
      root.style.setProperty('--light-accent-blue', '#3182ce');
      root.style.setProperty('--light-shadow-primary', '0 4px 20px rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--light-shadow-secondary', '0 2px 10px rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--light-border', '#e2e8f0');
    }
    
    // Common theme variables with enhanced colors
    root.style.setProperty('--accent-blue', newTheme === 'light' ? '#3182ce' : '#0066ff');
    root.style.setProperty('--accent-green', newTheme === 'light' ? '#38a169' : '#00ff88');
    root.style.setProperty('--accent-purple', newTheme === 'light' ? '#805ad5' : '#8b5cf6');
    root.style.setProperty('--accent-orange', newTheme === 'light' ? '#ff6b35' : '#ff8c42');
    root.style.setProperty('--accent-red', newTheme === 'light' ? '#e53e3e' : '#ff6b7a');
    
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
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
      document.head.appendChild(fontLink);
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
      body.classList.remove('theme-transitioning');
    }, 500);
  };

  const toggleTheme = () => {
    setIsTransitioning(true);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Reset transitioning state
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Smart theme detection based on time of day
  const detectOptimalTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 6 && hour <= 18) ? 'light' : 'dark';
  };

  const setAutoTheme = () => {
    const optimalTheme = detectOptimalTheme();
    if (optimalTheme !== theme) {
      setTheme(optimalTheme);
      applyTheme(optimalTheme);
    }
  };

  return { 
    theme, 
    toggleTheme, 
    isTransitioning, 
    setAutoTheme, 
    detectOptimalTheme 
  };
};
