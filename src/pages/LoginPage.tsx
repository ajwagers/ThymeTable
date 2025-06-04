import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Calendar, Clock, Utensils, Filter, Heart, ChevronRight, Mail } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-primary-500" />,
      title: "Weekly Planning",
      description: "Organize your meals for the entire week in minutes"
    },
    {
      icon: <Clock className="w-6 h-6 text-terra-500" />,
      title: "Save Time",
      description: "Quick and easy meal scheduling with drag-and-drop"
    },
    {
      icon: <Filter className="w-6 h-6 text-lemon" />,
      title: "Dietary Filters",
      description: "Find recipes that match your dietary preferences"
    },
    {
      icon: <Heart className="w-6 h-6 text-terra-500" />,
      title: "Healthy Living",
      description: "Balance your nutrition with varied meal options"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailConfirmationRequired(false);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setEmailConfirmationRequired(true);
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('email_not_confirmed')) {
        setEmailConfirmationRequired(true);
      } else {
        setError(errorMessage);
      }
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-primary-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                Meal Planning Made{' '}
                <motion.span
                  className="text-primary-600 inline-block"
                  whileHover={{ scale: 1.05 }}
                >
                  Simple
                </motion.span>
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                Take control of your weekly meals with ThymeTable. Plan, organize, and enjoy stress-free cooking.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`p-4 bg-white rounded-lg shadow-sm border transition-all duration-300 ${
                    activeFeature === index ? 'border-primary-500 scale-105' : 'border-primary-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {feature.icon}
                  <h3 className="font-medium text-gray-900 mt-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="bg-primary-50 p-6 rounded-lg border border-primary-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Why Choose ThymeTable?</h2>
              <ul className="space-y-2">
                <motion.li
                  className="flex items-center text-gray-700 cursor-pointer"
                  whileHover={{ x: 10 }}
                >
                  <Utensils className="w-4 h-4 text-primary-500 mr-2" />
                  Access to thousands of curated recipes
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100" />
                </motion.li>
                <motion.li
                  className="flex items-center text-gray-700 cursor-pointer"
                  whileHover={{ x: 10 }}
                >
                  <Clock className="w-4 h-4 text-primary-500 mr-2" />
                  Save hours on meal planning each week
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100" />
                </motion.li>
                <motion.li
                  className="flex items-center text-gray-700 cursor-pointer"
                  whileHover={{ x: 10 }}
                >
                  <Filter className="w-4 h-4 text-primary-500 mr-2" />
                  Customizable dietary preferences and restrictions
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100" />
                </motion.li>
              </ul>
            </motion.div>
          </div>

          {/* Right side - Auth form */}
          <motion.div
            className="bg-white p-8 rounded-lg shadow-lg border border-primary-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {emailConfirmationRequired ? (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Check Your Email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation link to <strong>{email}</strong>. Please check your email (including spam folder) and click the link to verify your account.
                </p>
                <button
                  onClick={() => {
                    setEmailConfirmationRequired(false);
                    setIsSignUp(false);
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Return to Sign In
                </button>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <LogIn className="w-8 h-8 text-primary-600" />
                  </motion.div>
                  <motion.h2
                    className="text-2xl font-semibold text-gray-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {isSignUp ? 'Start Your Journey' : 'Welcome Back'}
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {isSignUp ? 'Create your account to begin planning delicious meals' : 'Sign in to access your meal planner'}
                  </motion.p>
                </div>

                {error && (
                  <motion.div
                    className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-300"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-300"
                      required
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full btn-primary py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </motion.button>
                </form>

                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;