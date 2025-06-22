import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Shield, 
  Star, 
  Sparkles, 
  Heart, 
  BookOpen, 
  Search, 
  Globe, 
  Filter,
  TrendingUp,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

interface PlanFeature {
  icon: React.ReactNode;
  text: string;
  highlight?: boolean;
}

function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier, upgradeToTier } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (tier: 'standard' | 'premium') => {
    setIsUpgrading(tier);
    try {
      await upgradeToTier(tier);
      // Show success message or redirect
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(null);
    }
  };

  const freeFeatures: PlanFeature[] = [
    { icon: <Heart className="w-4 h-4" />, text: '10 favorite recipes' },
    { icon: <TrendingUp className="w-4 h-4" />, text: '10 random recipes per day' },
    { icon: <BookOpen className="w-4 h-4" />, text: '3 saved meal plans' },
    { icon: <Users className="w-4 h-4" />, text: 'Basic meal planning' },
    { icon: <Check className="w-4 h-4" />, text: 'Manual recipe creation' },
  ];

  const standardFeatures: PlanFeature[] = [
    { icon: <Shield className="w-4 h-4" />, text: 'Advanced dietary filters', highlight: true },
    { icon: <Globe className="w-4 h-4" />, text: 'Enhanced recipe import', highlight: true },
    { icon: <Search className="w-4 h-4" />, text: 'Unlimited recipe searches', highlight: true },
    { icon: <Heart className="w-4 h-4" />, text: '50 favorite recipes' },
    { icon: <BookOpen className="w-4 h-4" />, text: '15 saved meal plans' },
    { icon: <TrendingUp className="w-4 h-4" />, text: 'Unlimited random recipes' },
    { icon: <Check className="w-4 h-4" />, text: 'Export grocery lists' },
    { icon: <Check className="w-4 h-4" />, text: 'Share meal plans' },
  ];

  const premiumFeatures: PlanFeature[] = [
    { icon: <Sparkles className="w-4 h-4" />, text: 'AI-powered autofill calendar', highlight: true },
    { icon: <Zap className="w-4 h-4" />, text: 'AI recipe recommendations', highlight: true },
    { icon: <Star className="w-4 h-4" />, text: 'Unlimited everything', highlight: true },
    { icon: <Shield className="w-4 h-4" />, text: 'Priority customer support' },
    { icon: <Filter className="w-4 h-4" />, text: 'Unlimited custom filters' },
    { icon: <Check className="w-4 h-4" />, text: 'Early access to new features' },
    { icon: <Check className="w-4 h-4" />, text: 'Advanced analytics' },
    { icon: <Check className="w-4 h-4" />, text: 'Premium recipe collection' },
  ];

  const PlanCard = ({ 
    title, 
    price, 
    period, 
    features, 
    annualPriceInfo,
    tier, 
    popular = false,
    current = false 
  }: {
    title: string;
    price: string;
    period: string;
    features: PlanFeature[];
    annualPriceInfo?: string;
    tier: 'free' | 'standard' | 'premium';
    popular?: boolean;
    current?: boolean;
  }) => (
    <motion.div
      className={`relative p-6 rounded-xl border-2 transition-all ${
        popular 
          ? 'border-terra-500 bg-gradient-to-br from-lemon-50 to-terra-50 shadow-lg scale-105' 
          : current
            ? 'border-green-500 bg-green-50'
            : 'border-lemon-200 bg-lemon-70 hover:border-lemon-300'
      }`}
      whileHover={{ scale: popular ? 1.05 : 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </div>
        </div>
      )}

      {current && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {tier === 'premium' && <Crown className="w-5 h-5 text-yellow-500" />}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{price}</div>
        <div className="text-sm text-gray-500">{period}</div>
        {annualPriceInfo && (
          <div className="text-sm text-green-600 font-medium mt-1">
            {annualPriceInfo}
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className={`flex items-center text-sm ${
            feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'
          }`}>
            <div className={`mr-3 ${
              tier === 'premium' ? 'text-orange-500' : 
              tier === 'standard' ? 'text-blue-500' : 
              'text-green-500'
            }`}>
              {feature.icon}
            </div>
            {feature.text}
          </li>
        ))}
      </ul>

      {current ? (
        <button
          disabled
          className="w-full py-3 px-4 bg-green-100 text-green-700 rounded-lg font-medium cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : tier === 'free' ? (
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {user ? 'Downgrade' : 'Get Started Free'}
        </button>
      ) : (
        <button
          onClick={() => handleUpgrade(tier as 'standard' | 'premium')}
          disabled={isUpgrading === tier}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            tier === 'premium'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpgrading === tier ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Upgrading...
            </div>
          ) : (
            `Upgrade to ${title}`
          )}
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {user && (
            <button 
              onClick={() => navigate('/')}
              className="mb-6 btn-secondary inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Planner
            </button>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock the full potential of ThymeTable with advanced features designed to make meal planning effortless and enjoyable.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <PlanCard
            title="Free"
            price="$0"
            period="/month"
            features={freeFeatures}
            tier="free"
            current={currentTier === 'free'}
          />
          
          <PlanCard
            title="Standard"
            price="$4.99"
            period="/month"
            annualPriceInfo="$49.99/year (saving $9.89)"
            features={standardFeatures}
            tier="standard"
            current={currentTier === 'standard'}
          />
          
          <PlanCard
            title="Premium"
            price="$9.99"
            period="/month"
            annualPriceInfo="$99.99/year (saving $19.89)"
            features={premiumFeatures}
            tier="premium"
            popular={true}
            current={currentTier === 'premium'}
          />
        </div>

        {/* Feature Comparison */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-900">Features</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Standard</th>
                  <th className="text-center py-4 px-4 font-medium text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-4 text-gray-700">Favorite Recipes</td>
                  <td className="py-4 px-4 text-center text-gray-600">10</td>
                  <td className="py-4 px-4 text-center text-gray-600">50</td>
                  <td className="py-4 px-4 text-center text-green-600 font-medium">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Saved Meal Plans</td>
                  <td className="py-4 px-4 text-center text-gray-600">3</td>
                  <td className="py-4 px-4 text-center text-gray-600">15</td>
                  <td className="py-4 px-4 text-center text-green-600 font-medium">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Daily Random Recipes</td>
                  <td className="py-4 px-4 text-center text-gray-600">10</td>
                  <td className="py-4 px-4 text-center text-green-600 font-medium">Unlimited</td>
                  <td className="py-4 px-4 text-center text-green-600 font-medium">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Recipe Search</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Recipe Import</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Advanced Dietary Filters</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">AI Autofill Calendar</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">AI Recommendations</td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a money-back guarantee?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens to my data if I downgrade?</h3>
              <p className="text-gray-600 text-sm">
                Your data is always safe. If you exceed limits after downgrading, you'll have read-only access until you upgrade again.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer student discounts?</h3>
              <p className="text-gray-600 text-sm">
                Yes! Students get 50% off all paid plans. Contact support with your student ID for verification.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Meal Planning?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their meal planning with ThymeTable. 
            Start your journey to stress-free cooking today.
          </p>
          
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started Free
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default SubscriptionPage;