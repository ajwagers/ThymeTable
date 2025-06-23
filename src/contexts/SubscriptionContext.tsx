import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'free' | 'standard' | 'premium';

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  isFree: boolean;
  isStandard: boolean;
  isPremium: boolean;
  loading: boolean;
  
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

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);

  // Initialize subscription status
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!user) {
        setCurrentTier('free');
        setLoading(false);
        return;
      }

      try {
        // TODO: Replace with actual RevenueCat integration
        // For now, check localStorage for demo purposes
        const savedTier = localStorage.getItem(`subscription_tier_${user.id}`) as SubscriptionTier;
        if (savedTier && ['free', 'standard', 'premium'].includes(savedTier)) {
          setCurrentTier(savedTier);
        } else {
          setCurrentTier('free');
        }
      } catch (error) {
        console.error('Error initializing subscription:', error);
        setCurrentTier('free');
      } finally {
        setLoading(false);
      }
    };

    initializeSubscription();
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
      // TODO: Replace with actual RevenueCat integration
      // For now, just update localStorage for demo purposes
      localStorage.setItem(`subscription_tier_${user.id}`, tier);
      setCurrentTier(tier);
      
      if (tier === 'free') {
        console.log(`Downgraded to ${tier} tier`);
      } else {
        console.log(`Upgraded to ${tier} tier`);
      }
      
      // In a real implementation, this would:
      // 1. Call RevenueCat to initiate purchase
      // 2. Handle payment flow
      // 3. Update user's subscription status in database
      // 4. Sync with backend
      
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
    limits,
    upgradeToTier,
    checkFeatureAccess,
    getRemainingUsage,
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