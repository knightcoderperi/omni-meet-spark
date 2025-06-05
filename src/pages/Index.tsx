
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 text-white overflow-hidden relative">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.15),transparent_50%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)] opacity-40" />
        
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
      </div>

      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 lg:px-8 pt-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Logo */}
              <motion.div 
                className="flex justify-center mb-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative">
                  <img 
                    src="/lovable-uploads/bdc68451-c6ff-49ce-aee8-eca10eb02bb4.png" 
                    alt="OmniMeet" 
                    className="h-24 w-auto object-contain drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-2xl rounded-full scale-150 -z-10" />
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-6 py-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Next-Generation Video Conferencing
                </span>
              </motion.div>

              <motion.h1 
                className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
                  The Future of
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Collaboration
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-300/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Experience seamless meetings with AI-powered features, real-time collaboration tools, 
                and enterprise-grade security that transforms how teams connect and create together.
              </motion.p>

              {/* Feature Pills */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                {[
                  { icon: Zap, text: "AI-Powered" },
                  { icon: Shield, text: "Enterprise Security" },
                  { icon: Users, text: "Global Scale" }
                ].map((feature, index) => (
                  <motion.div 
                    key={feature.text}
                    className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <feature.icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-gray-300">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleStartFreeMeeting}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-2xl shadow-cyan-500/25 border-0 transition-all duration-300 hover:shadow-3xl hover:shadow-cyan-500/40 group"
                  >
                    <Video className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    Start Free Meeting
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline"
                    onClick={handleWatchDemo}
                    className="border-2 border-white/20 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/30 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 group"
                  >
                    <Play className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap justify-center gap-8 mt-16 opacity-60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400 font-medium">100K+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400 font-medium">50+ Countries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400 font-medium">99.9% Uptime</span>
                </div>
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
