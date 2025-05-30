
import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Star, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';

const FeatureShowcase = () => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Whiteboard',
      description: 'Collaborate in real-time with intelligent drawing tools and automatic shape recognition.',
      gradient: 'from-yellow-400 to-orange-500',
      bgGradient: 'from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: Globe,
      title: 'Real-time Translation',
      description: 'Break language barriers with instant AI translation for global team collaboration.',
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Users,
      title: 'Smart Task Generator',
      description: 'Automatically generate and assign tasks based on meeting discussions and team roles.',
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Video,
      title: 'HD Video Conferencing',
      description: 'Crystal clear video quality with adaptive bandwidth and noise cancellation.',
      gradient: 'from-green-400 to-teal-500',
      bgGradient: 'from-green-500/20 to-teal-500/20'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'End-to-end encryption and advanced security features for enterprise-grade protection.',
      gradient: 'from-red-400 to-pink-500',
      bgGradient: 'from-red-500/20 to-pink-500/20'
    },
    {
      icon: Star,
      title: 'Meeting Analytics',
      description: 'Gain insights with AI-powered meeting summaries and participation analytics.',
      gradient: 'from-indigo-400 to-purple-500',
      bgGradient: 'from-indigo-500/20 to-purple-500/20'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              Powered by Advanced AI
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Revolutionary Features
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of video conferencing with AI-powered tools 
            that enhance collaboration and productivity like never before.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 h-full hover:border-white/40 transition-all duration-300">
                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.bgGradient} backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`} />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Learn More Link */}
                <motion.div
                  className="flex items-center text-blue-400 font-medium group-hover:text-white transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Meetings?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join millions of teams already using Omnimeet to collaborate better and achieve more.
            </p>
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
