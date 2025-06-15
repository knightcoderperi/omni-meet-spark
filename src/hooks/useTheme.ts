
import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default to light mode for premium experience
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Smart theme detection based on time and user preference
  const detectOptimalTheme = useCallback(() => {
    const hour = new Date().getHours();
    const isWorkingHours = hour >= 8 && hour <= 18;
    return isWorkingHours ? 'light' : 'dark';
  }, []);

  // Initialize theme with smart detection
  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    // Check saved preference or use smart detection
    const savedTheme = localStorage.getItem('omnimeet-theme') as 'light' | 'dark';
    let initialTheme: 'light' | 'dark';

    if (savedTheme) {
      initialTheme = savedTheme;
    } else {
      // Smart time-based detection with preference for light mode
      initialTheme = detectOptimalTheme();
    }

    setTheme(initialTheme);
    applyTheme(initialTheme);
    
    // Listen for system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
      if (!localStorage.getItem('omnimeet-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [detectOptimalTheme]);

  // Premium theme application with smooth transitions
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    // Add transition class for smooth switching
    root.classList.add('theme-transitioning');
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', newTheme);
    
    if (newTheme === 'light') {
      // LIGHT MODE - Premium Netflix/Spotify Experience
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark-mode-enhanced');
      body.classList.add('light-mode-enhanced');
      
      // Premium light theme CSS variables
      root.style.setProperty('--background-primary', '#FFFFFF');
      root.style.setProperty('--background-secondary', '#F8FAFC');
      root.style.setProperty('--background-tertiary', '#F1F5F9');
      root.style.setProperty('--surface-primary', '#FFFFFF');
      root.style.setProperty('--surface-secondary', 'rgba(255,255,255,0.95)');
      root.style.setProperty('--text-primary', '#0F172A');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--accent-primary', '#3B82F6');
      root.style.setProperty('--accent-secondary', '#10B981');
      root.style.setProperty('--accent-tertiary', '#F59E0B');
      root.style.setProperty('--border-primary', '#E2E8F0');
      root.style.setProperty('--shadow-primary', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
      
      // Set body background with premium styling
      body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)';
      body.style.backgroundSize = '400% 400%';
      body.style.animation = 'gradientShift 8s ease infinite';
      body.style.backgroundAttachment = 'fixed';
      
    } else {
      // DARK MODE - Professional Netflix Experience
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark-mode-enhanced');
      body.classList.remove('light-mode-enhanced');
      
      // Dark theme CSS variables
      root.style.setProperty('--background-primary', '#0a0a0a');
      root.style.setProperty('--background-secondary', '#111111');
      root.style.setProperty('--background-tertiary', '#1a1a1a');
      root.style.setProperty('--surface-primary', '#1f1f1f');
      root.style.setProperty('--surface-secondary', '#2a2a2a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e5e7eb');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#6366f1');
      root.style.setProperty('--border-primary', '#333333');
      root.style.setProperty('--shadow-primary', 'rgba(0, 0, 0, 0.5)');
      
      // Set body background
      body.style.background = 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)';
      body.style.backgroundAttachment = 'fixed';
      body.style.animation = 'none';
    }
    
    // Load premium fonts
    loadPremiumFonts();
    
    // Add CSS animations
    addPremiumAnimations();
    
    // Store preference
    localStorage.setItem('omnimeet-theme', newTheme);
    
    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);
  }, []);

  // Load premium typography system
  const loadPremiumFonts = useCallback(() => {
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);
      
      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);
      
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap';
      document.head.appendChild(fontLink);
    }
  }, []);

  // Add premium CSS animations
  const addPremiumAnimations = useCallback(() => {
    if (!document.querySelector('#premium-animations')) {
      const style = document.createElement('style');
      style.id = 'premium-animations';
      style.textContent = `
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
        }
        
        @keyframes rippleEffect {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        @keyframes floatUp {
          0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(16, 185, 129, 0.3); }
        }
        
        .theme-transitioning * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Enhanced theme toggle with animations
  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Create dramatic toggle animation
    const body = document.body;
    body.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      applyTheme(newTheme);
      
      // Play theme sound (optional)
      playThemeSound(newTheme);
      
      // Bounce back animation
      body.style.transform = 'scale(1.02)';
      setTimeout(() => {
        body.style.transform = 'scale(1)';
      }, 200);
    }, 150);
    
    // Reset transitioning state
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [theme, applyTheme]);

  // Optional system sound feedback
  const playThemeSound = useCallback((newTheme: 'light' | 'dark') => {
    try {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different themes
        oscillator.frequency.setValueAtTime(
          newTheme === 'light' ? 800 : 400, 
          audioContext.currentTime
        );
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (error) {
      // Silent fail - audio is optional
      console.debug('Audio feedback not available');
    }
  }, []);

  // Auto-theme based on time of day
  const setAutoTheme = useCallback(() => {
    const optimalTheme = detectOptimalTheme();
    if (optimalTheme !== theme) {
      setTheme(optimalTheme);
      applyTheme(optimalTheme);
    }
  }, [theme, detectOptimalTheme, applyTheme]);

  // Create ripple effect for buttons
  const createRippleEffect = useCallback((event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }, []);

  return { 
    theme, 
    toggleTheme, 
    isTransitioning, 
    setAutoTheme, 
    detectOptimalTheme,
    playThemeSound,
    systemPreference,
    createRippleEffect,
    isLightMode: theme === 'light',
    isDarkMode: theme === 'dark'
  };
};
