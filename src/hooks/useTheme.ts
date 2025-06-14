
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('omnimeet-theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    initializeFloatingParticles();
  }, []);

  const initializeFloatingParticles = () => {
    // Create floating particles container for light mode
    let particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) {
      particlesContainer = document.createElement('div');
      particlesContainer.className = 'floating-particles';
      document.body.appendChild(particlesContainer);

      // Create 20 floating particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${8 + Math.random() * 4}s`;
        particlesContainer.appendChild(particle);
      }
    }
  };

  const createRippleEffect = (event: MouseEvent) => {
    const ripple = document.createElement('div');
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    (event.target as HTMLElement).style.position = 'relative';
    (event.target as HTMLElement).appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    // Add transition class for smooth theme switching
    body.classList.add('theme-transitioning');
    
    if (newTheme === 'dark') {
      // DARK MODE - Netflix Professional Personality
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.remove('light');
      body.classList.add('dark-mode-enhanced');
      body.classList.remove('light-mode-enhanced');
      
      // Dark theme CSS variables (Netflix/Professional)
      root.style.setProperty('--background-primary', '#0a0a0a');
      root.style.setProperty('--background-secondary', '#111111');
      root.style.setProperty('--background-tertiary', '#1a1a1a');
      root.style.setProperty('--surface-primary', '#1f1f1f');
      root.style.setProperty('--surface-secondary', '#2a2a2a');
      root.style.setProperty('--surface-tertiary', '#333333');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#e5e5e5');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#6366f1');
      
    } else {
      // LIGHT MODE - Instagram/TikTok Energy Personality
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.add('light');
      body.classList.remove('dark-mode-enhanced');
      body.classList.add('light-mode-enhanced');
      
      // Light theme CSS variables (Instagram Energy)
      root.style.setProperty('--background-primary', '#ffffff');
      root.style.setProperty('--background-secondary', '#f8fafc');
      root.style.setProperty('--background-tertiary', '#f1f5f9');
      root.style.setProperty('--surface-primary', 'rgba(255,255,255,0.95)');
      root.style.setProperty('--surface-secondary', 'rgba(255,255,255,0.9)');
      root.style.setProperty('--surface-tertiary', 'rgba(255,255,255,0.85)');
      root.style.setProperty('--text-primary', '#2d3436');
      root.style.setProperty('--text-secondary', '#636e72');
      root.style.setProperty('--text-muted', '#74b9ff');
      root.style.setProperty('--accent-primary', '#ff6b6b');
      root.style.setProperty('--accent-secondary', '#feca57');
      root.style.setProperty('--accent-tertiary', '#48dbfb');
      root.style.setProperty('--accent-quaternary', '#ff9ff3');
      
      // Add ripple effect to buttons in light mode
      setTimeout(() => {
        const buttons = document.querySelectorAll('button, .btn-light');
        buttons.forEach(button => {
          button.addEventListener('click', createRippleEffect as EventListener);
        });
      }, 100);
    }
    
    localStorage.setItem('omnimeet-theme', newTheme);
    
    // Enhanced font loading with personality-specific fonts
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
      fontLink.href = newTheme === 'light' 
        ? 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700;900&display=swap'
        : 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap';
      document.head.appendChild(fontLink);
    }
    
    // Add CSS animations for ripple effect
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes rippleEffect {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Sequenced animation delay for theme transition
    setTimeout(() => {
      body.classList.remove('theme-transitioning');
    }, 500);
  };

  const toggleTheme = () => {
    setIsTransitioning(true);
    
    // Add dramatic toggle animation
    const body = document.body;
    body.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      applyTheme(newTheme);
      
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

  // Add personality-based system sounds (optional)
  const playThemeSound = (newTheme: 'light' | 'dark') => {
    if ('AudioContext' in window) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different personalities
      oscillator.frequency.setValueAtTime(
        newTheme === 'light' ? 800 : 400, 
        audioContext.currentTime
      );
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  return { 
    theme, 
    toggleTheme, 
    isTransitioning, 
    setAutoTheme, 
    detectOptimalTheme,
    playThemeSound 
  };
};
