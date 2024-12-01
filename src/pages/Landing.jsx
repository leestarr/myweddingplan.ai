import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import {
  SparklesIcon,
  HeartIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function Landing() {
  const [showLogin, setShowLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/app');
    return null;
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                MyWeddingPlan.ai
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogin(true)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
              >
                Sign in
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogin(false)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
              >
                Sign up free
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <motion.div 
              className="lg:col-span-6 text-center lg:text-left"
              {...fadeIn}
            >
              <h1 className="text-6xl font-bold mb-6">
                <span className="block text-gray-900">Plan Your Dream</span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Wedding with AI
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Let AI help you organize, budget, and create the wedding of your dreams - all in one place.
              </p>
            </motion.div>
            <motion.div 
              className="lg:col-span-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {showLogin ? (
                <LoginForm onToggleForm={() => setShowLogin(false)} />
              ) : (
                <SignupForm onToggleForm={() => setShowLogin(true)} />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Plan Your Perfect Day
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform makes wedding planning effortless and enjoyable
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: SparklesIcon,
                title: 'AI Planning Assistant',
                description: 'Get personalized recommendations and assistance with every decision'
              },
              {
                icon: HeartIcon,
                title: 'Guest Management',
                description: 'Effortlessly manage your guest list, RSVPs, and seating arrangements'
              },
              {
                icon: DocumentTextIcon,
                title: 'Budget Tracking',
                description: 'Stay on top of your expenses with smart budget tracking and analytics'
              },
              {
                icon: ChatBubbleBottomCenterTextIcon,
                title: 'Vendor Management',
                description: 'Keep all your vendor communications and quotes in one place'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the perfect plan for your wedding journey</p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '0',
                description: 'Perfect for getting started',
                features: [
                  'Basic wedding planning tools',
                  'Guest list management',
                  'Basic budget tracking',
                  'Limited document storage',
                  'Basic AI assistance'
                ]
              },
              {
                name: 'Premium',
                price: '20',
                description: 'For the complete planning experience',
                features: [
                  'Everything in Free, plus:',
                  'Advanced AI planning assistant',
                  'Unlimited document storage',
                  'Vendor quote comparison',
                  'Priority support',
                  'Custom wedding website',
                  'Advanced budget analytics'
                ],
                highlighted: true
              }
            ].map((plan) => (
              <motion.div
                key={plan.name}
                className={`p-8 rounded-xl ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-xl'
                    : 'bg-white border border-gray-200 shadow-md'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogin(false)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg'
                      : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MyWeddingPlan.ai</h3>
              <p className="text-gray-400">Making wedding planning smarter and easier.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Planning Assistant</li>
                <li>Guest Management</li>
                <li>Budget Tracking</li>
                <li>Vendor Management</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>Instagram</li>
                <li>Facebook</li>
                <li>LinkedIn</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 MyWeddingPlan.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
