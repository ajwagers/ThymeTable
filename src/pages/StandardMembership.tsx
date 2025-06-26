import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Search, Globe, Heart, BookOpen, TrendingUp, Check } from 'lucide-react';

const STRIPE_SCRIPT_ID = 'stripe-pricing-table-js';

export default function StandardMembership() {
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
    { icon: <Shield className="w-5 h-5" />, text: 'Advanced dietary filters' },
    { icon: <Globe className="w-5 h-5" />, text: 'Enhanced recipe import' },
    { icon: <Search className="w-5 h-5" />, text: 'Unlimited recipe searches' },
    { icon: <Heart className="w-5 h-5" />, text: '50 favorite recipes' },
    { icon: <BookOpen className="w-5 h-5" />, text: '15 saved meal plans' },
    { icon: <TrendingUp className="w-5 h-5" />, text: 'Unlimited random recipes' },
    { icon: <Check className="w-5 h-5" />, text: 'Export grocery lists' },
    { icon: <Check className="w-5 h-5" />, text: 'Share meal plans' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Standard Membership</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Unlock powerful features to enhance your meal planning experience with advanced tools and unlimited access.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
              <div className="text-blue-600 mr-4">
                {feature.icon}
              </div>
              <span className="text-gray-700 font-medium">{feature.text}</span>
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
              pricing-table-id="prctbl_1RdylU03xOQRAfiHmqDCxpAP"
              publishable-key="pk_test_51RcdD303xOQRAfiHtkGiWw6o18yC0SBiG7dXgauWfVaTNMbFMF7u6kYOTNfWY5nanx42wjXovYoXIrVjDEkVDCGK006D8bAKBF"
              success-url="${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&price_id={PRICE_ID}"
              cancel-url="${window.location.origin}/subscription"
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Why Choose Standard?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Advanced Filtering</h4>
              <p className="text-gray-600 text-sm">
                Create custom dietary filters and manage complex food restrictions with ease.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Recipe Import</h4>
              <p className="text-gray-600 text-sm">
                Import recipes from any website using our enhanced Python-powered parser.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Unlimited Search</h4>
              <p className="text-gray-600 text-sm">
                Search through thousands of recipes with no daily limits or restrictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}