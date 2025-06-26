import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles, Zap, Star, Shield, Filter, Check } from 'lucide-react';

const STRIPE_SCRIPT_ID = 'stripe-pricing-table-js';

export default function PremiumMembership() {
  const navigate = useNavigate();

  useEffect(() => {
    // Only add the script if it hasn't been added yet
    if (!document.getElementById(STRIPE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = STRIPE_SCRIPT_ID;
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const features = [
    { icon: <Sparkles className="w-5 h-5" />, text: 'AI-powered autofill calendar', highlight: true },
    { icon: <Zap className="w-5 h-5" />, text: 'AI recipe recommendations', highlight: true },
    { icon: <Star className="w-5 h-5" />, text: 'Unlimited everything', highlight: true },
    { icon: <Shield className="w-5 h-5" />, text: 'Priority customer support' },
    { icon: <Filter className="w-5 h-5" />, text: 'Unlimited custom filters' },
    { icon: <Check className="w-5 h-5" />, text: 'Early access to new features' },
    { icon: <Check className="w-5 h-5" />, text: 'Advanced analytics' },
    { icon: <Check className="w-5 h-5" />, text: 'Premium recipe collection' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-white">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/subscription')}
            className="mb-6 btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900 flex items-center justify-center gap-3">
            Premium Membership
            <Crown className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Experience the ultimate meal planning with AI-powered features, unlimited access, and premium support.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className={`flex items-center p-4 bg-white rounded-lg shadow-sm border ${
              feature.highlight 
                ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' 
                : 'border-orange-100'
            }`}>
              <div className={`mr-4 ${
                feature.highlight ? 'text-orange-600' : 'text-yellow-600'
              }`}>
                {feature.icon}
              </div>
              <span className={`font-medium ${
                feature.highlight ? 'text-gray-900 font-semibold' : 'text-gray-700'
              }`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Table */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Choose Your Billing Cycle
          </h2>
          <div className="flex justify-center">
            <stripe-pricing-table
              pricing-table-id="prctbl_1Rdyw303xOQRAfiHGTk7OtIh"
              publishable-key="pk_test_51RcdD303xOQRAfiHtkGiWw6o18yC0SBiG7dXgauWfVaTNMbFMF7u6kYOTNfWY5nanx42wjXovYoXIrVjDEkVDCGK006D8bAKBF"
              success-url="${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&price_id={PRICE_ID}"
              cancel-url="${window.location.origin}/subscription"
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Why Choose Premium?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Planning</h4>
              <p className="text-gray-600 text-sm">
                Let our AI automatically fill your weekly calendar with perfectly balanced meals.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h4>
              <p className="text-gray-600 text-sm">
                Get personalized recipe suggestions based on your preferences and dietary needs.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Unlimited Everything</h4>
              <p className="text-gray-600 text-sm">
                No limits on favorites, meal plans, searches, or any other features.
              </p>
            </div>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-medium">
            <Crown className="w-5 h-5" />
            <span>Most Popular Choice</span>
            <Crown className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}