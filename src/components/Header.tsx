import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Utensils, Clock, Filter, LogOut, ShoppingCart, Heart, BookOpen, ExternalLink, Crown, Lock, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDietary } from '../contexts/DietaryContext';
import { useSubscription, useFeatureAccess } from '../contexts/SubscriptionContext';
import ServingsControl from './ServingsControl';
import MeasurementToggle from './MeasurementToggle';
import DietaryFiltersModal from './DietaryFiltersModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { activeDiets } = useDietary();
  const { currentTier, subscriptionData } = useSubscription();
  const { canUseAdvancedFilters } = useFeatureAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRestrictedFeature = (featureName: string) => {
    setShowUpgradeModal(true);
  };

  const isActive = (path: string) => location.pathname === path;

  // Get subscription display name
  const getSubscriptionDisplayName = () => {
    if (subscriptionData?.subscription_status === 'active') {
      switch (currentTier) {
        case 'standard': return 'Standard';
        case 'premium': return 'Premium';
        default: return 'Free';
      }
    }
    return 'Free';
  };

  return (
    <>
      <header className="bg-primary-500 border-b border-primary-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="mr-2 p-2 bg-white/10 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Weekly Diet <span className="text-lemon">Planner</span>
              </h1>
              
              {/* Subscription Status Badge */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                  {currentTier === 'premium' && <Crown className="w-4 h-4 text-yellow-400" />}
                  <span className="text-xs font-medium text-white/90">
                    {getSubscriptionDisplayName()} Plan
                  </span>
                </div>
              )}
              
              {/* Bolt Logo */}
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
                title="Powered by Bolt.new"
              >
                <img
                  src="/black_circle_360x360.png"
                  alt="Powered by Bolt"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-white/80 group-hover:text-white hidden sm:inline">
                  Powered by Bolt.new
                </span>
                <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white/80" />
              </a>
            </div>
            
            {user && (
              <div className="flex items-center space-x-3">
                <ServingsControl variant="header" />
                
                <MeasurementToggle />
                
                <button 
                  onClick={() => navigate('/grocery-list')}
                  className={`btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white ${
                    isActive('/grocery-list') ? 'bg-white/20' : ''
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  <span>Grocery List</span>
                </button>

                <button 
                  onClick={() => navigate('/favorites')}
                  className={`btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white ${
                    isActive('/favorites') ? 'bg-white/20' : ''
                  }`}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  <span>Favorites</span>
                </button>

                <button 
                  onClick={() => navigate('/blog')}
                  className={`btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white ${
                    isActive('/blog') ? 'bg-white/20' : ''
                  }`}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Blog</span>
                </button>

                {/* New "Back to Planner" button */}
                {location.pathname.startsWith('/blog') && (
                  <button
                    onClick={() => navigate('/')}
                    className="btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Back to Planner</span>
                  </button>
                )}
                
                {/* Saved Plans - Standard+ feature */}
                {currentTier === 'free' ? (
                  <button 
                    onClick={() => handleRestrictedFeature('Saved Plans')}
                    className="btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white opacity-60 relative"
                    title="Upgrade to Standard to access Saved Plans"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>Saved Plans</span>
                    <Lock className="h-3 w-3 ml-1" />
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/saved-plans')}
                    className={`btn-secondary bg-white/10 hover:bg-white/20 border-white/20 text-white ${
                      isActive('/saved-plans') ? 'bg-white/20' : ''
                    }`}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>Saved Plans</span>
                  </button>
                )}
                
                {/* Dietary Filters - Standard+ for advanced features */}
                {!canUseAdvancedFilters ? (
                  <button 
                    onClick={() => handleRestrictedFeature('Advanced Dietary Filters')}
                    className={`btn-primary bg-terra-500 hover:bg-terra-600 relative opacity-75 ${
                      activeDiets.length > 0 ? 'ring-2 ring-lemon ring-offset-2 ring-offset-primary-500' : ''
                    }`}
                    title="Upgrade to Standard for advanced dietary filters"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Dietary Filters</span>
                    <Lock className="h-3 w-3 ml-1" />
                    {activeDiets.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-lemon text-charcoal text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {activeDiets.length}
                      </span>
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowDietaryModal(true)}
                    className={`btn-primary bg-terra-500 hover:bg-terra-600 relative ${
                      activeDiets.length > 0 ? 'ring-2 ring-lemon ring-offset-2 ring-offset-primary-500' : ''
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Dietary Filters</span>
                    {activeDiets.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-lemon text-charcoal text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {activeDiets.length}
                      </span>
                    )}
                  </button>
                )}

                {/* Upgrade Button for Free and Standard users */}
                {currentTier !== 'premium' && (
                  <button
                    onClick={() => navigate('/subscription')}
                    className="btn-primary bg-gradient-to-r from-lemon to-terra-500 hover:from-lemon hover:to-terra-400 text-white font-medium"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    <span>Upgrade</span>
                  </button>
                )}

                {/* Enhanced Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="btn-secondary bg-white/10 hover:bg-red-500/20 border-white/20 text-white hover:border-red-300 transition-all duration-200"
                  title="Sign out of your account"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Sign Out</span>
                </button>
                
              </div>
            )}
          </div>
        </div>
      </header>

      <DietaryFiltersModal 
        isOpen={showDietaryModal} 
        onClose={() => setShowDietaryModal(false)} 
      />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          />
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upgrade Your Plan</h3>
              <p className="text-gray-600">
                Unlock premium features and get the most out of Weekly Diet Planner App
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {currentTier === 'free' && (
                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-lg transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Standard Plan</h4>
                      <p className="text-sm text-gray-600">15 saved plans, advanced filters, recipe import</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">$4.99</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </div>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => navigate('/subscription')}
                className="w-full p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-gradient-to-r from-yellow-200 to-orange-200 rounded-lg transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      Premium Plan
                      <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                    </h4>
                    <p className="text-sm text-gray-600">Unlimited everything + AI recommendations</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">$99.99</div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 btn-secondary"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;