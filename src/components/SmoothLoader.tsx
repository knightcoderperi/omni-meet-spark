
import React from 'react';
import { motion } from 'framer-motion';

interface SmoothLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
}

const SmoothLoader: React.FC<SmoothLoaderProps> = ({ 
  message = "Loading...", 
  size = 'md',
  showLogo = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 dark:bg-cyan-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div 
        className="text-center z-10"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {showLogo && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img 
              src="/lovable-uploads/2d81a553-9d58-4ba7-94bd-f014ebe9d554.png" 
              alt="OmniMeet" 
              className="h-12 w-auto mx-auto object-contain"
            />
          </motion.div>
        )}
        
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className={`${sizeClasses[size]} border-4 border-blue-200/30 dark:border-cyan-500/30 rounded-full mx-auto mb-4`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner spinning ring */}
          <motion.div
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${sizeClasses[size]} border-4 border-transparent border-t-blue-500 dark:border-t-cyan-400 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 dark:bg-cyan-400 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [1, 0.7, 1] 
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        
        <motion.p 
          className={`text-slate-700 dark:text-white ${textSizes[size]} font-medium`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        
        {/* Progress dots */}
        <motion.div 
          className="flex justify-center space-x-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-500 dark:bg-cyan-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.3 
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SmoothLoader;
