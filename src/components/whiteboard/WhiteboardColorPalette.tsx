
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Color {
  name: string;
  value: string;
  shadow: string;
}

const colorPalettes: { [key: string]: Color[] } = {
  blues: [
    { name: 'Sky Blue', value: '#87CEEB', shadow: 'shadow-blue-300/50' },
    { name: 'Dodger Blue', value: '#1E90FF', shadow: 'shadow-blue-500/50' },
    { name: 'Royal Blue', value: '#4169E1', shadow: 'shadow-blue-600/50' },
    { name: 'Navy Blue', value: '#000080', shadow: 'shadow-blue-800/50' },
    { name: 'Midnight Blue', value: '#191970', shadow: 'shadow-blue-900/50' },
    { name: 'Steel Blue', value: '#4682B4', shadow: 'shadow-blue-400/50' },
  ],
  reds: [
    { name: 'Light Coral', value: '#F08080', shadow: 'shadow-red-300/50' },
    { name: 'Salmon', value: '#FA8072', shadow: 'shadow-red-400/50' },
    { name: 'Crimson', value: '#DC143C', shadow: 'shadow-red-500/50' },
    { name: 'Fire Brick', value: '#B22222', shadow: 'shadow-red-600/50' },
    { name: 'Dark Red', value: '#8B0000', shadow: 'shadow-red-800/50' },
    { name: 'Indian Red', value: '#CD5C5C', shadow: 'shadow-red-400/50' },
  ],
  greens: [
    { name: 'Light Green', value: '#90EE90', shadow: 'shadow-green-300/50' },
    { name: 'Lime Green', value: '#32CD32', shadow: 'shadow-green-400/50' },
    { name: 'Forest Green', value: '#228B22', shadow: 'shadow-green-600/50' },
    { name: 'Dark Green', value: '#006400', shadow: 'shadow-green-800/50' },
    { name: 'Sea Green', value: '#2E8B57', shadow: 'shadow-green-500/50' },
    { name: 'Olive Green', value: '#6B8E23', shadow: 'shadow-green-600/50' },
  ],
  purples: [
    { name: 'Lavender', value: '#E6E6FA', shadow: 'shadow-purple-200/50' },
    { name: 'Medium Purple', value: '#9370DB', shadow: 'shadow-purple-400/50' },
    { name: 'Blue Violet', value: '#8A2BE2', shadow: 'shadow-purple-500/50' },
    { name: 'Dark Violet', value: '#9400D3', shadow: 'shadow-purple-600/50' },
    { name: 'Indigo', value: '#4B0082', shadow: 'shadow-purple-800/50' },
    { name: 'Rebecca Purple', value: '#663399', shadow: 'shadow-purple-500/50' },
  ],
  oranges: [
    { name: 'Peach Puff', value: '#FFDAB9', shadow: 'shadow-orange-200/50' },
    { name: 'Sandy Brown', value: '#F4A460', shadow: 'shadow-orange-300/50' },
    { name: 'Orange', value: '#FFA500', shadow: 'shadow-orange-400/50' },
    { name: 'Dark Orange', value: '#FF8C00', shadow: 'shadow-orange-500/50' },
    { name: 'Orange Red', value: '#FF4500', shadow: 'shadow-orange-600/50' },
    { name: 'Chocolate', value: '#D2691E', shadow: 'shadow-orange-700/50' },
  ],
  cyans: [
    { name: 'Aqua', value: '#00FFFF', shadow: 'shadow-cyan-300/50' },
    { name: 'Dark Turquoise', value: '#00CED1', shadow: 'shadow-cyan-400/50' },
    { name: 'Deep Sky Blue', value: '#00BFFF', shadow: 'shadow-cyan-500/50' },
    { name: 'Cadet Blue', value: '#5F9EA0', shadow: 'shadow-cyan-600/50' },
    { name: 'Teal', value: '#008080', shadow: 'shadow-cyan-700/50' },
    { name: 'Dark Cyan', value: '#008B8B', shadow: 'shadow-cyan-800/50' },
  ],
  pinks: [
    { name: 'Pink', value: '#FFC0CB', shadow: 'shadow-pink-200/50' },
    { name: 'Hot Pink', value: '#FF69B4', shadow: 'shadow-pink-400/50' },
    { name: 'Deep Pink', value: '#FF1493', shadow: 'shadow-pink-500/50' },
    { name: 'Medium Violet Red', value: '#C71585', shadow: 'shadow-pink-600/50' },
    { name: 'Pale Violet Red', value: '#DB7093', shadow: 'shadow-pink-400/50' },
    { name: 'Magenta', value: '#FF00FF', shadow: 'shadow-pink-500/50' },
  ],
  yellows: [
    { name: 'Light Yellow', value: '#FFFFE0', shadow: 'shadow-yellow-200/50' },
    { name: 'Yellow', value: '#FFFF00', shadow: 'shadow-yellow-300/50' },
    { name: 'Gold', value: '#FFD700', shadow: 'shadow-yellow-400/50' },
    { name: 'Orange', value: '#FFA500', shadow: 'shadow-yellow-500/50' },
    { name: 'Dark Goldenrod', value: '#B8860B', shadow: 'shadow-yellow-600/50' },
    { name: 'Olive', value: '#808000', shadow: 'shadow-yellow-700/50' },
  ],
  grays: [
    { name: 'White Smoke', value: '#F5F5F5', shadow: 'shadow-gray-200/50' },
    { name: 'Light Gray', value: '#D3D3D3', shadow: 'shadow-gray-300/50' },
    { name: 'Silver', value: '#C0C0C0', shadow: 'shadow-gray-400/50' },
    { name: 'Gray', value: '#808080', shadow: 'shadow-gray-500/50' },
    { name: 'Dim Gray', value: '#696969', shadow: 'shadow-gray-600/50' },
    { name: 'Black', value: '#000000', shadow: 'shadow-gray-800/50' },
  ],
};

interface WhiteboardColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const WhiteboardColorPalette: React.FC<WhiteboardColorPaletteProps> = ({ 
  selectedColor, 
  onColorSelect 
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
      <h3 className="text-white font-semibold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
        Pen Colors
      </h3>
      
      <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
        {Object.entries(colorPalettes).map(([category, colors]) => (
          <motion.div 
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="text-gray-300 text-sm font-medium capitalize">
              {category}
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color, index) => (
                <motion.button
                  key={color.name}
                  onClick={() => onColorSelect(color.value)}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    selectedColor === color.value 
                      ? 'border-white scale-110 shadow-lg' 
                      : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                  } ${color.shadow}`}
                  style={{ backgroundColor: color.value }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check className={`w-4 h-4 ${
                        color.value === '#FFFFE0' || color.value === '#F5F5F5' || color.value === '#D3D3D3' 
                          ? 'text-gray-800' 
                          : 'text-white'
                      }`} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhiteboardColorPalette;
