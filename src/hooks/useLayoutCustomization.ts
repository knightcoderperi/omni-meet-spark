
import { useState, useCallback } from 'react';

export type LayoutType = 'grid' | 'speaker' | 'sidebar' | 'gallery' | 'focus';
export type GridSize = 'small' | 'medium' | 'large';

interface LayoutSettings {
  type: LayoutType;
  gridSize: GridSize;
  showParticipantNames: boolean;
  showConnectionQuality: boolean;
  enableAnimations: boolean;
  compactMode: boolean;
}

const defaultSettings: LayoutSettings = {
  type: 'grid',
  gridSize: 'medium',
  showParticipantNames: true,
  showConnectionQuality: true,
  enableAnimations: true,
  compactMode: false
};

export const useLayoutCustomization = () => {
  const [settings, setSettings] = useState<LayoutSettings>(defaultSettings);

  const updateLayout = useCallback((newType: LayoutType) => {
    setSettings(prev => ({ ...prev, type: newType }));
  }, []);

  const updateGridSize = useCallback((newSize: GridSize) => {
    setSettings(prev => ({ ...prev, gridSize: newSize }));
  }, []);

  const toggleSetting = useCallback((key: keyof Omit<LayoutSettings, 'type' | 'gridSize'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const getGridClasses = useCallback(() => {
    const { type, gridSize, compactMode } = settings;
    
    if (type === 'speaker') return 'grid-cols-1 lg:grid-cols-4 lg:grid-rows-4';
    if (type === 'sidebar') return 'grid-cols-1 lg:grid-cols-5';
    if (type === 'focus') return 'grid-cols-1';
    
    // Grid layout
    const sizeMap = {
      small: compactMode ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
      medium: compactMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      large: compactMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
    };
    
    return sizeMap[gridSize];
  }, [settings]);

  return {
    settings,
    updateLayout,
    updateGridSize,
    toggleSetting,
    resetToDefaults,
    getGridClasses
  };
};
