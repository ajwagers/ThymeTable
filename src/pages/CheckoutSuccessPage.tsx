import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getProductByPriceId } from '../stripe-config';

function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription, currentTier, updateTierFromStripe } = useSubscription();

  useEffect(() => {
    // Get price_id from URL params if available (from Stripe pricing table)
    const priceId = searchParams.get('price_id');
    
    if (priceId & sucess=true) {
      // Update tier immediately based on price ID
      updateTierFromStripe(priceId);
    } else {
      // Fallback: refresh subscription data from server
      refreshSubscription();
    }
  }, [refreshSubscription]);

  const sessionId = searchParams.get('session_id');
  const priceId = searchParams.get('price_id');
  
  // Get product info if we have a price ID
  const purchasedProduct = priceId ? getProductByPriceId(priceId) : null;

  const getTierInfo = () => {
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

        {/* Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate('/')}
            className="w-full btn-primary flex items-center justify-center"
          >
            Start Planning Meals
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
          transition={{ delay: 0.7 }}
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