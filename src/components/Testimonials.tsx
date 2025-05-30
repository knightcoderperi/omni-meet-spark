
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO at TechFlow',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e80b97?w=150&h=150&fit=crop&crop=face',
      content: 'Omnimeet has revolutionized how our global team collaborates. The AI features are game-changing!',
      rating: 5,
      company: 'TechFlow'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Design Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'The real-time whiteboard collaboration has transformed our design reviews. Absolutely incredible!',
      rating: 5,
      company: 'Creative Studio'
    },
    {
      name: 'Emily Watson',
      role: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Best video conferencing platform we\'ve used. The AI task generation saves us hours every week.',
      rating: 5,
      company: 'InnovateLabs'
    },
    {
      name: 'David Park',
      role: 'Engineering Lead',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'The security features give us confidence for enterprise-level meetings. Highly recommended!',
      rating: 5,
      company: 'SecureTech'
    },
    {
      name: 'Lisa Thompson',
      role: 'Marketing Director',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      content: 'Our international team loves the real-time translation feature. No more language barriers!',
      rating: 5,
      company: 'GlobalReach'
    },
    {
      name: 'James Wilson',
      role: 'Startup Founder',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      content: 'Omnimeet helped us scale our remote team efficiently. The analytics insights are invaluable.',
      rating: 5,
      company: 'StartupCo'
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">
              Loved by 10M+ Users
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              What Teams Say
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover how Omnimeet is transforming the way teams collaborate and communicate across the globe.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 h-full hover:border-white/40 transition-all duration-300 relative overflow-hidden">
                {/* Quote Icon */}
                <motion.div
                  className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <Quote className="w-8 h-8 text-blue-400" />
                </motion.div>

                {/* Rating Stars */}
                <div className="flex items-center space-x-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-blue-400/50 transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                    <p className="text-blue-400 text-sm font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-gray-400 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap items-center justify-center space-x-8 opacity-50">
            {['TechFlow', 'Creative Studio', 'InnovateLabs', 'SecureTech', 'GlobalReach'].map((company, index) => (
              <motion.div
                key={company}
                className="text-2xl font-bold text-gray-500 hover:text-gray-300 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
