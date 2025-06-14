
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Video, Users, Star, Check, Menu, X, Play, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';
import Hero3D from '@/components/Hero3D';
import FeatureShowcase from '@/components/FeatureShowcase';
import Testimonials from '@/components/Testimonials';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleStartFreeMeeting = () => {
    navigate('/auth');
  };

  const handleWatchDemo = () => {
    window.open('https://youtu.be/HAxm8n9QY50?si=IVo-bt-DsPKKLGTJ', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white overflow-hidden relative">
      {/* Enhanced Premium Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,102,255,0.15),transparent_50%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.12),transparent_50%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(0,255,136,0.08),transparent_50%)] opacity-40" />
        
        {/* Enhanced Floating Orbs with 3D effects */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, 80, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-600/15 to-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [0, -60, 0],
            y: [0, 30, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-800/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.4, 0.1],
            x: [0, 40, 0],
            y: [0, -40, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />

        {/* Premium Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:120px_120px] opacity-30" />
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <Navbar />
      
      <main className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 lg:px-8 pt-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Premium Logo with Enhanced Effects */}
              <motion.div 
                className="flex justify-center mb-16"
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
              >
                <div className="relative group">
                  <motion.img 
                    src="/lovable-uploads/bdc68451-c6ff-49ce-aee8-eca10eb02bb4.png" 
                    alt="OmniMeet" 
                    className="h-32 w-auto object-contain drop-shadow-2xl relative z-10"
                    whileHover={{ scale: 1.1, rotateY: 5 }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Enhanced glow effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl rounded-full scale-150 animate-pulse-glow group-hover:scale-200 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-2xl rounded-full scale-125 animate-gradient" />
                  
                  {/* Orbiting elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -bottom-4 -left-4 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>

              {/* Premium Badge with Enhanced Animation */}
              <motion.div
                className="inline-flex items-center space-x-3 glass-premium rounded-full px-8 py-4 mb-12 group cursor-pointer"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <span className="text-base font-semibold text-gradient-electric">
                  Next-Generation Video Conferencing Platform
                </span>
                <motion.div
                  className="w-2 h-2 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Enhanced Main Headlines */}
              <motion.h1 
                className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
              >
                <motion.span 
                  className="block text-gradient-primary text-shadow-premium"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  The Future of
                </motion.span>
                <motion.span 
                  className="block text-gradient-electric mt-4"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 1 }}
                >
                  Collaboration
                </motion.span>
              </motion.h1>
              
              {/* Enhanced Description */}
              <motion.p 
                className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-5xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 1 }}
              >
                Experience{" "}
                <span className="text-gradient-accent font-medium">seamless meetings</span>{" "}
                with AI-powered features, real-time collaboration tools, 
                and enterprise-grade security that{" "}
                <span className="text-gradient-electric font-medium">transforms</span>{" "}
                how teams connect and create together.
              </motion.p>

              {/* Premium Feature Pills */}
              <motion.div 
                className="flex flex-wrap justify-center gap-6 mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 1 }}
              >
                {[
                  { icon: Zap, text: "AI-Powered", gradient: "from-yellow-400 to-orange-500" },
                  { icon: Shield, text: "Enterprise Security", gradient: "from-green-400 to-blue-500" },
                  { icon: Users, text: "Global Scale", gradient: "from-purple-400 to-pink-500" }
                ].map((feature, index) => (
                  <motion.div 
                    key={feature.text}
                    className="glass-card px-6 py-4 group cursor-pointer hover:glow-electric"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="text-lg font-semibold text-white group-hover:text-gradient-electric transition-all duration-300">
                        {feature.text}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Enhanced CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Button 
                    onClick={handleStartFreeMeeting}
                    className="btn-primary-premium px-12 py-6 text-xl font-bold shadow-rainbow border-0 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative z-10 flex items-center">
                      <Video className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-200" />
                      Start Free Meeting
                      <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform duration-200" />
                    </div>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Button 
                    variant="outline"
                    onClick={handleWatchDemo}
                    className="glass-button px-12 py-6 text-xl font-semibold border-2 border-white/30 hover:border-cyan-500/50 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />
                    <div className="relative z-10 flex items-center">
                      <Play className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-200" />
                      Watch Demo
                    </div>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Enhanced Trust Indicators */}
              <motion.div 
                className="flex flex-wrap justify-center gap-12 mt-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 1 }}
              >
                {[
                  { label: "100K+ Active Users", color: "green" },
                  { label: "50+ Countries", color: "blue" },
                  { label: "99.9% Uptime", color: "purple" }
                ].map((item, index) => (
                  <motion.div 
                    key={item.label}
                    className="flex items-center space-x-3 group"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.4 + index * 0.1, duration: 0.6 }}
                  >
                    <motion.div 
                      className={`w-3 h-3 bg-gradient-to-r ${
                        item.color === 'green' ? 'from-green-400 to-cyan-500' :
                        item.color === 'blue' ? 'from-blue-400 to-purple-500' :
                        'from-purple-500 to-pink-500'
                      } rounded-full shadow-lg`}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ 
                        duration: 2 + index * 0.5, 
                        repeat: Infinity 
                      }}
                    />
                    <span className="text-lg text-gray-400 font-medium group-hover:text-white transition-colors duration-300">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <FeatureShowcase />
        <Testimonials />
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
