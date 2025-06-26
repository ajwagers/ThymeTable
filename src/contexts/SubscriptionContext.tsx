import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserSubscription, SubscriptionData } from '../services/stripe';
import { getProductByPriceId } from '../stripe-config';

export type SubscriptionTier = 'free' | 'standard' | 'premium';

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  isFree: boolean;
  isStandard: boolean;
  isPremium: boolean;
  loading: boolean;
  subscriptionData: SubscriptionData | null;
  
  // Feature limits based on tier
  limits: {
    maxSavedMealPlans: number;
    maxFavoriteRecipes: number;
    canExportGroceryList: boolean;
    canImportRecipes: boolean;
    canUseAdvancedFilters: boolean;
    canAccessPremiumRecipes: boolean;
    canUseAIRecommendations: boolean;
    canShareMealPlans: boolean;
  };
  
  // Actions
  upgradeToTier: (tier: SubscriptionTier) => Promise<void>;
  checkFeatureAccess: (feature: keyof SubscriptionContextType['limits']) => boolean;
  getRemainingUsage: (feature: 'savedMealPlans' | 'favoriteRecipes') => Promise<number>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Define tier limits
const TIER_LIMITS = {
  free: {
    maxSavedMealPlans: 3,
    maxFavoriteRecipes: 10,
    canExportGroceryList: false,
    canImportRecipes: false,
    canUseAdvancedFilters: false,
    canAccessPremiumRecipes: false,
    canUseAIRecommendations: false,
    canShareMealPlans: false,
  },
  standard: {
    maxSavedMealPlans: 15,
    maxFavoriteRecipes: 50,
    canExportGroceryList: true,
    canImportRecipes: true,
    canUseAdvancedFilters: true,
    canAccessPremiumRecipes: false,
    canUseAIRecommendations: false,
    canShareMealPlans: true,
  },
  premium: {
    maxSavedMealPlans: -1, // unlimited
    maxFavoriteRecipes: -1, // unlimited
    canExportGroceryList: true,
    canImportRecipes: true,
    canUseAdvancedFilters: true,
    canAccessPremiumRecipes: true,
    canUseAIRecommendations: true,
    canShareMealPlans: true,
  },
};

// Map price IDs to tiers
const PRICE_ID_TO_TIER: Record<string, SubscriptionTier> = {
  'price_1RdvYo03xOQRAfiHLrCApNpF': 'standard', // Standard Membership
  'price_1RcdLK03xOQRAfiHl0sTMwqP': 'premium',  // Premium Membership
};

function getTierFromSubscription(subscriptionData: SubscriptionData | null): SubscriptionTier {
  if (!subscriptionData || !subscriptionData.price_id) {
    return 'free';
  }

  // Check if subscription is active
  const activeStatuses = ['active', 'trialing'];
  if (!activeStatuses.includes(subscriptionData.subscription_status)) {
    return 'free';
  }

  return PRICE_ID_TO_TIER[subscriptionData.price_id] || 'free';
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);

  // Initialize subscription status
  const refreshSubscription = async () => {
    if (!user) {
      setSubscriptionData(null);
      setCurrentTier('free');
      setLoading(false);
      return;
    }

    try {
      const data = await getUserSubscription();
      setSubscriptionData(data);
      setCurrentTier(getTierFromSubscription(data));
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscriptionData(null);
      setCurrentTier('free');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  // Helper booleans
  const isFree = currentTier === 'free';
  const isStandard = currentTier === 'standard';
  const isPremium = currentTier === 'premium';

  // Get current tier limits
  const limits = TIER_LIMITS[currentTier];

  // Upgrade to a specific tier
  const upgradeToTier = async (tier: SubscriptionTier) => {
    if (!user) {
      throw new Error('User must be logged in to upgrade subscription');
    }

    try {
      // For demo purposes, we'll just navigate to the subscription page
      // In a real implementation, this would trigger the Stripe checkout flow
      window.location.href = '/subscription';
      
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  };

  // Check if user has access to a specific feature
  const checkFeatureAccess = (feature: keyof typeof limits): boolean => {
    return limits[feature] as boolean;
  };

  // Get remaining usage for countable features
  const getRemainingUsage = async (feature: 'savedMealPlans' | 'favoriteRecipes'): Promise<number> => {
    if (!user) return 0;

    try {
      // TODO: Replace with actual database queries
      // For now, return mock data
      const maxLimit = feature === 'savedMealPlans' ? limits.maxSavedMealPlans : limits.maxFavoriteRecipes;
      
      if (maxLimit === -1) return -1; // unlimited
      
      // Mock current usage - in real implementation, query the database
      const currentUsage = 0; // This would come from actual data
      
      return Math.max(0, maxLimit - currentUsage);
    } catch (error) {
      console.error('Error getting remaining usage:', error);
      return 0;
    }
  };

  const value: SubscriptionContextType = {
    currentTier,
    isFree,
    isStandard,
    isPremium,
    loading,
    subscriptionData,
    limits,
    upgradeToTier,
    checkFeatureAccess,
    getRemainingUsage,
    refreshSubscription,
    updateTierFromPriceId,
    updateTierFromStripe,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Helper hook for checking specific features
export function useFeatureAccess() {
  const { checkFeatureAccess, currentTier, limits } = useSubscription();
  
  return {
    canExportGroceryList: checkFeatureAccess('canExportGroceryList'),
    canImportRecipes: checkFeatureAccess('canImportRecipes'),
    canUseAdvancedFilters: checkFeatureAccess('canUseAdvancedFilters'),
    canAccessPremiumRecipes: checkFeatureAccess('canAccessPremiumRecipes'),
    canUseAIRecommendations: checkFeatureAccess('canUseAIRecommendations'),
    canShareMealPlans: checkFeatureAccess('canShareMealPlans'),
    currentTier,
    limits,
  };
}