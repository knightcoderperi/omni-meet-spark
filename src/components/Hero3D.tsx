
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Video, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero3D = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-3xl backdrop-blur-sm"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-full backdrop-blur-sm"
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 transform rotate-45 backdrop-blur-sm"
          animate={{
            y: [0, -25, 0],
            rotate: [45, 65, 45],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">
              #1 AI-Powered Meeting Platform
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Meet Smarter
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect Better
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience the future of video conferencing with AI-powered features, 
            real-time collaboration, and stunning visual experiences that transform 
            how teams connect and create together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
            >
              Start Free Meeting
              <motion.div
                className="ml-2"
                whileHover={{ x: 5 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm"
            >
              Watch Demo
              <Video className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { number: '10M+', label: 'Active Users' },
              { number: '99.9%', label: 'Uptime' },
              { number: '150+', label: 'Countries' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 3D Meeting Room Preview */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="relative">
            {/* Glassmorphism Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Mock Video Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="aspect-video bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <Users className="w-8 h-8 text-gray-400" />
                  </motion.div>
                ))}
              </div>

              {/* Mock Controls */}
              <div className="flex items-center justify-center space-x-4">
                {[
                  { icon: Video, active: true },
                  { icon: Users, active: false },
                  { icon: Star, active: true }
                ].map((control, index) => (
                  <motion.button
                    key={index}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      control.active 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <control.icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full shadow-lg"
              animate={{
                y: [0, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero3D;
