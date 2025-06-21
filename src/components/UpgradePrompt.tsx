import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Zap, Shield, Star, Sparkles } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
  requiredTier?: 'standard' | 'premium';
  customContent?: React.ReactNode;
}

interface PlanFeature {
  icon: React.ReactNode;
  text: string;
  highlight?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  feature,
  description,
  requiredTier,
  customContent
}) => {
  const { currentTier, upgradeToTier } = useSubscription();

  const handleUpgrade = async (tier: 'standard' | 'premium') => {
    try {
      await upgradeToTier(tier);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const getFeatureDescription = () => {
    if (description) return description;
    
    const descriptions: Record<string, string> = {
      'Autofill Calendar': 'Get AI-powered meal planning that automatically creates balanced weekly meal plans based on your preferences.',
      'Save Meal Plans': 'Save and reuse your weekly meal plans for easy meal planning.',
      'Import Recipes': 'Import recipes from any website using our enhanced Python-powered parser.',
      'Search Recipes': 'Search through thousands of recipes with advanced filtering options.',
      'Advanced Dietary Filters': 'Create custom dietary filters and access advanced filtering options.',
      'Favorites': 'Save unlimited favorite recipes for quick access.',
      'Export Grocery List': 'Export your grocery lists to PDF or share them with others.',
      'AI Recommendations': 'Get personalized recipe recommendations based on your preferences.',
      'Share Meal Plans': 'Share your meal plans with family and friends.',
    };
    
    return descriptions[feature] || 'Unlock premium features to enhance your meal planning experience.';
  };

  const getRequiredTierForFeature = (): 'standard' | 'premium' => {
    if (requiredTier) return requiredTier;
    
    const premiumFeatures = ['Autofill Calendar', 'AI Recommendations'];
    return premiumFeatures.includes(feature) ? 'premium' : 'standard';
  };

  const standardFeatures: PlanFeature[] = [
    { icon: <Shield className="w-4 h-4" />, text: 'Advanced dietary filters' },
    { icon: <Zap className="w-4 h-4" />, text: 'Enhanced recipe import' },
    { icon: <Star className="w-4 h-4" />, text: '50 favorite recipes' },
    { icon: <Check className="w-4 h-4" />, text: '15 saved meal plans' },
    { icon: <Check className="w-4 h-4" />, text: 'Unlimited recipe searches' },
    { icon: <Check className="w-4 h-4" />, text: 'Export grocery lists' },
  ];

  const premiumFeatures: PlanFeature[] = [
    { icon: <Sparkles className="w-4 h-4" />, text: 'AI-powered autofill', highlight: true },
    { icon: <Star className="w-4 h-4" />, text: 'Unlimited everything', highlight: true },
    { icon: <Zap className="w-4 h-4" />, text: 'AI recipe recommendations' },
    { icon: <Shield className="w-4 h-4" />, text: 'Priority customer support' },
    { icon: <Check className="w-4 h-4" />, text: 'Share meal plans' },
    { icon: <Check className="w-4 h-4" />, text: 'Early access to new features' },
  ];

  const minRequiredTier = getRequiredTierForFeature();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Unlock {feature}</h2>
                <p className="text-white/90 max-w-md mx-auto">
                  {getFeatureDescription()}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {customContent || (
                <div className="space-y-6">
                  {/* Current Plan Notice */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      You're currently on the <span className="font-medium capitalize">{currentTier}</span> plan
                    </p>
                  </div>

                  {/* Plan Options */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Standard Plan */}
                    {(currentTier === 'free' && minRequiredTier === 'standard') || minRequiredTier === 'premium' ? (
                      <motion.div
                        className={`p-6 border-2 rounded-lg transition-all ${
                          minRequiredTier === 'standard' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Standard Plan</h3>
                          <div className="text-2xl font-bold text-blue-600 mt-1">$4.99</div>
                          <div className="text-sm text-gray-500">/month</div>
                        </div>
                        
                        <ul className="space-y-2 mb-6">
                          {standardFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-700">
                              <div className="text-blue-500 mr-2">{feature.icon}</div>
                              {feature.text}
                            </li>
                          ))}
                        </ul>
                        
                        {minRequiredTier === 'standard' && (
                          <button
                            onClick={() => handleUpgrade('standard')}
                            className="w-full btn-primary bg-blue-600 hover:bg-blue-700"
                          >
                            Upgrade to Standard
                          </button>
                        )}
                      </motion.div>
                    ) : null}

                    {/* Premium Plan */}
                    <motion.div
                      className={`p-6 border-2 rounded-lg transition-all ${
                        minRequiredTier === 'premium' 
                          ? 'border-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50' 
                          : 'border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Premium Plan</h3>
                          <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600">$9.99</div>
                        <div className="text-sm text-gray-500">/month</div>
                        {minRequiredTier === 'premium' && (
                          <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full mt-2">
                            Required for {feature}
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                        {premiumFeatures.map((feature, index) => (
                          <li key={index} className={`flex items-center text-sm ${
                            feature.highlight ? 'text-orange-700 font-medium' : 'text-gray-700'
                          }`}>
                            <div className={`mr-2 ${
                              feature.highlight ? 'text-orange-500' : 'text-orange-500'
                            }`}>
                              {feature.icon}
                            </div>
                            {feature.text}
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => handleUpgrade('premium')}
                        className="w-full btn-primary bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        Upgrade to Premium
                      </button>
                    </motion.div>
                  </div>

                  {/* Benefits Summary */}
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Why Upgrade?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-primary-500" />
                        <span>Advanced Features</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 text-primary-500" />
                        <span>Enhanced Performance</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-primary-500" />
                        <span>Priority Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>30-day money-back guarantee</span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradePrompt;