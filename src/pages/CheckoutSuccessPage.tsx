import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Crown, Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getProductByPriceId } from '../stripe-config';

function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription, currentTier } = useSubscription();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Refresh subscription data when the page loads
    refreshSubscription();

    // Start countdown timer for automatic redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          // Redirect to main app after countdown
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshSubscription, navigate]);

  const sessionId = searchParams.get('session_id');
  const priceId = searchParams.get('price_id');
  
  // Get product info if we have a price ID
  const purchasedProduct = priceId ? getProductByPriceId(priceId) : null;

  const getTierInfo = () => {
    // Use purchased product info if available, otherwise fall back to current tier
    if (purchasedProduct) {
      return {
        name: purchasedProduct.tier === 'standard' ? 'Standard' : 'Premium',
        icon: purchasedProduct.tier === 'standard' 
          ? <Crown className="w-8 h-8 text-blue-500" />
          : <Sparkles className="w-8 h-8 text-yellow-500" />,
        color: purchasedProduct.tier === 'standard' ? 'blue' : 'yellow',
        features: purchasedProduct.tier === 'standard' ? [
          'Advanced dietary filters',
          'Enhanced recipe import',
          'Unlimited recipe searches',
          '50 favorite recipes',
          '15 saved meal plans'
        ] : [
          'AI-powered autofill calendar',
          'AI recipe recommendations',
          'Unlimited everything',
          'Priority customer support',
          'Early access to new features'
        ]
      };
    }

    // Fallback to current tier
    switch (currentTier) {
      case 'standard':
        return {
          name: 'Standard',
          icon: <Crown className="w-8 h-8 text-blue-500" />,
          color: 'blue',
          features: [
            'Advanced dietary filters',
            'Enhanced recipe import',
            'Unlimited recipe searches',
            '50 favorite recipes',
            '15 saved meal plans'
          ]
        };
      case 'premium':
        return {
          name: 'Premium',
          icon: <Sparkles className="w-8 h-8 text-yellow-500" />,
          color: 'yellow',
          features: [
            'AI-powered autofill calendar',
            'AI recipe recommendations',
            'Unlimited everything',
            'Priority customer support',
            'Early access to new features'
          ]
        };
      default:
        return {
          name: 'Free',
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: 'green',
          features: []
        };
    }
  };

  const tierInfo = getTierInfo();

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Redirecting to App...
          </h2>
          <p className="text-gray-600">
            Taking you to your meal planner now.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-8 h-8 text-green-500" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome to your new {tierInfo.name} plan. You now have access to all the premium features.
          </p>
        </motion.div>

        {/* Plan Info */}
        {currentTier !== 'free' && (
          <motion.div
            className={`p-4 bg-${tierInfo.color}-50 border border-${tierInfo.color}-200 rounded-lg mb-6`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              {tierInfo.icon}
              <h3 className="font-semibold text-gray-900">{tierInfo.name} Plan Active</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              {tierInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Session Info */}
        {sessionId && (
          <motion.div
            className="p-3 bg-gray-50 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-gray-500">
              Session ID: {sessionId}
            </p>
          </motion.div>
        )}

        {/* Countdown and Auto-redirect Notice */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Automatically redirecting to your meal planner...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{countdown}</span>
              </div>
              <span className="text-blue-600 text-sm">seconds remaining</span>
            </div>
          </div>
        </motion.div>

        {/* Manual Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full btn-primary flex items-center justify-center"
          >
            Start Planning Meals Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/subscription')}
            className="w-full btn-secondary"
          >
            View Subscription Details
          </button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-6 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-gray-500">
            You'll receive a confirmation email shortly. If you have any questions, 
            please contact our support team.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default CheckoutSuccessPage;