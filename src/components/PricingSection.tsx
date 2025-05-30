
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 0, annual: 0 },
      icon: Star,
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 participants',
        'Basic video conferencing',
        'Screen sharing',
        'Chat messaging',
        '40-minute time limit',
        'Mobile & desktop apps'
      ],
      cta: 'Get Started Free',
      popular: false,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-500/20 to-gray-600/20'
    },
    {
      name: 'Professional',
      price: { monthly: 12, annual: 10 },
      icon: Zap,
      description: 'Everything you need for growing teams',
      features: [
        'Up to 100 participants',
        'AI-powered whiteboard',
        'Real-time translation',
        'Meeting recordings',
        'Advanced analytics',
        'Custom backgrounds',
        'Priority support',
        'Unlimited meeting time'
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-500/20 to-purple-600/20'
    },
    {
      name: 'Enterprise',
      price: { monthly: 25, annual: 20 },
      icon: Shield,
      description: 'Advanced features for large organizations',
      features: [
        'Unlimited participants',
        'Smart task generator',
        'Advanced security & compliance',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Advanced admin controls',
        'White-label options'
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/20 to-pink-600/20'
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
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
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">
              Simple, Transparent Pricing
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <motion.div
            className="inline-flex items-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-full p-1"
            whileHover={{ scale: 1.02 }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                !isAnnual 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full transition-all duration-300 relative ${
                isAnnual 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              {isAnnual && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Save 20%
                </span>
              )}
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative group ${plan.popular ? 'md:-mt-8' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg z-10"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Most Popular
                </motion.div>
              )}

              <Card className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 h-full hover:border-white/40 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/25' : ''
              }`}>
                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.bgGradient} backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <plan.icon className={`w-8 h-8 bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`} />
                </motion.div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {plan.price.monthly === 0 ? 'Free' : '/user/month'}
                    </span>
                  </div>
                  {isAnnual && plan.price.monthly > 0 && (
                    <p className="text-sm text-green-400 mt-2">
                      Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      className="flex items-start space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                    >
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Need a custom solution?
            </h3>
            <p className="text-gray-300 mb-6">
              Contact our enterprise team for custom pricing and features tailored to your organization.
            </p>
            <Button
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold backdrop-blur-sm"
            >
              Contact Enterprise Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
