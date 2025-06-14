
import { useCallback, useRef } from 'react';

export const useMeetingSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const createZoomJoinSound = useCallback(() => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Resume context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create oscillators for a pleasant chord progression
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const oscillator3 = audioContext.createOscillator();
      
      // Create gain nodes for volume control
      const gainNode1 = audioContext.createGain();
      const gainNode2 = audioContext.createGain();
      const gainNode3 = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Set frequencies for a pleasant major chord (C-E-G)
      oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      oscillator3.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5

      // Use sine waves for a soft, pleasant sound
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      oscillator3.type = 'sine';

      // Connect oscillators to their gain nodes
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      oscillator3.connect(gainNode3);

      // Connect gain nodes to master gain
      gainNode1.connect(masterGain);
      gainNode2.connect(masterGain);
      gainNode3.connect(masterGain);

      // Connect master gain to destination
      masterGain.connect(audioContext.destination);

      // Set volume levels
      const now = audioContext.currentTime;
      const duration = 0.8;

      // Create a pleasant fade-in and fade-out envelope
      gainNode1.gain.setValueAtTime(0, now);
      gainNode1.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gainNode1.gain.linearRampToValueAtTime(0, now + duration);

      gainNode2.gain.setValueAtTime(0, now);
      gainNode2.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gainNode2.gain.linearRampToValueAtTime(0, now + duration);

      gainNode3.gain.setValueAtTime(0, now);
      gainNode3.gain.linearRampToValueAtTime(0.06, now + 0.2);
      gainNode3.gain.linearRampToValueAtTime(0, now + duration);

      masterGain.gain.setValueAtTime(0.3, now);

      // Start and stop oscillators
      oscillator1.start(now);
      oscillator2.start(now + 0.05);
      oscillator3.start(now + 0.1);

      oscillator1.stop(now + duration);
      oscillator2.stop(now + duration);
      oscillator3.stop(now + duration);

      console.log('🔊 Meeting join sound played');
    } catch (error) {
      console.warn('Unable to play meeting join sound:', error);
    }
  }, []);

  const playUserJoinedSound = useCallback(() => {
    createZoomJoinSound();
  }, [createZoomJoinSound]);

  const playUserLeftSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create a softer, descending tone for user leaving
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(392.00, audioContext.currentTime + 0.5); // G4
      
      oscillator.type = 'sine';
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

      oscillator.start(now);
      oscillator.stop(now + 0.5);

      console.log('🔇 Meeting leave sound played');
    } catch (error) {
      console.warn('Unable to play meeting leave sound:', error);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return {
    playUserJoinedSound,
    playUserLeftSound,
    cleanup
  };
};
