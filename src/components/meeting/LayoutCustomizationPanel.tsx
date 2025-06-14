
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, Users, Sidebar, Focus, Eye, 
  Maximize, Settings, Palette, X, 
  LayoutGrid, Monitor, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLayoutCustomization, LayoutType, GridSize } from '@/hooks/useLayoutCustomization';
import { Switch } from '@/components/ui/switch';

interface LayoutCustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LayoutCustomizationPanel: React.FC<LayoutCustomizationPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateLayout, updateGridSize, toggleSetting, resetToDefaults } = useLayoutCustomization();

  const layoutOptions: Array<{ type: LayoutType; icon: React.ElementType; label: string; description: string }> = [
    { type: 'grid', icon: Grid3X3, label: 'Grid View', description: 'Equal size video tiles' },
    { type: 'speaker', icon: Monitor, label: 'Speaker View', description: 'Focus on active speaker' },
    { type: 'sidebar', icon: Sidebar, label: 'Sidebar View', description: 'Main video with sidebar' },
    { type: 'gallery', icon: LayoutGrid, label: 'Gallery View', description: 'Optimal for many participants' },
    { type: 'focus', icon: Focus, label: 'Focus Mode', description: 'Minimal distractions' }
  ];

  const gridSizes: Array<{ size: GridSize; label: string }> = [
    { size: 'small', label: 'Small' },
    { size: 'medium', label: 'Medium' },
    { size: 'large', label: 'Large' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-white/20 dark:border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Layout Customization
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Personalize your meeting experience
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Layout Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <LayoutGrid className="w-5 h-5 mr-2 text-cyan-500" />
                  Layout Style
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {layoutOptions.map((option) => (
                    <motion.div
                      key={option.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`p-4 cursor-pointer transition-all duration-300 ${
                          settings.type === option.type
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700'
                        }`}
                        onClick={() => updateLayout(option.type)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            settings.type === option.type
                              ? 'bg-cyan-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            <option.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {option.label}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Grid Size Options */}
              {settings.type === 'grid' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Maximize className="w-5 h-5 mr-2 text-cyan-500" />
                    Tile Size
                  </h3>
                  <div className="flex space-x-3">
                    {gridSizes.map((size) => (
                      <Button
                        key={size.size}
                        variant={settings.gridSize === size.size ? "default" : "outline"}
                        onClick={() => updateGridSize(size.size)}
                        className={settings.gridSize === size.size 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                          : ""
                        }
                      >
                        {size.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-cyan-500" />
                  Display Options
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Show Participant Names</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Display names on video tiles</p>
                    </div>
                    <Switch
                      checked={settings.showParticipantNames}
                      onCheckedChange={() => toggleSetting('showParticipantNames')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Connection Quality</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Show network indicators</p>
                    </div>
                    <Switch
                      checked={settings.showConnectionQuality}
                      onCheckedChange={() => toggleSetting('showConnectionQuality')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Smooth Animations</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Enable premium transitions</p>
                    </div>
                    <Switch
                      checked={settings.enableAnimations}
                      onCheckedChange={() => toggleSetting('enableAnimations')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Compact Mode</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Fit more participants on screen</p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={() => toggleSetting('compactMode')}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  className="flex-1"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LayoutCustomizationPanel;
