import React, { useState } from 'react';
import { PlusCircle, Shuffle, Search, Edit3, Globe, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureAccess } from '../contexts/SubscriptionContext';

interface MealPlaceholderProps {
  mealType: string;
  onAddMeal: () => void;
  onAddManualRecipe?: () => void;
  onSearchRecipe?: () => void;
  onImportRecipe?: () => void;
  isLoading?: boolean;
  onRestrictedFeature?: (feature: string) => void;
}

const MealPlaceholder: React.FC<MealPlaceholderProps> = ({ 
  mealType, 
  onAddMeal, 
  onAddManualRecipe,
  onSearchRecipe,
  onImportRecipe,
  isLoading = false,
  onRestrictedFeature
}) => {
  const { canImportRecipes, currentTier } = useFeatureAccess();
  
  const [showOptions, setShowOptions] = useState(false);

  const handleRandomRecipe = () => {
    // Check if user can use random recipes (free tier daily limit)
    if (currentTier === 'free' && !canUseRandomRecipes) {
      if (onRestrictedFeature) {
        onRestrictedFeature('Random Recipes');
      }
      setShowOptions(false);
      return;
    }
    
    onAddMeal();
    setShowOptions(false);
  };

  const handleManualRecipe = () => {
    if (onAddManualRecipe) {
      onAddManualRecipe();
    }
    setShowOptions(false);
  };

  const handleSearchRecipe = () => {
    if (currentTier === 'free') {
      if (onRestrictedFeature) {
        onRestrictedFeature('Search Recipes');
      }
      setShowOptions(false);
      return;
    }
    
    if (onSearchRecipe) {
      onSearchRecipe();
    }
    setShowOptions(false);
  };

  const handleImportRecipe = () => {
    if (!canImportRecipes) {
      if (onRestrictedFeature) {
        onRestrictedFeature('Import Recipes');
      }
      setShowOptions(false);
      return;
    }
    
    if (onImportRecipe) {
      onImportRecipe();
    }
    setShowOptions(false);
  };

  const getMealTypeColor = () => {
    switch (mealType) {
      case 'breakfast': return 'border-lemon bg-lemon/5';
      case 'lunch': return 'border-terra-400 bg-terra-50';
      case 'dinner': return 'border-primary-500 bg-primary-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getButtonColor = () => {
    switch (mealType) {
      case 'breakfast': return 'hover:bg-lemon/10 text-gray-700';
      case 'lunch': return 'hover:bg-terra-100 text-terra-700';
      case 'dinner': return 'hover:bg-primary-100 text-primary-700';
      default: return 'hover:bg-gray-100 text-gray-600';
    }
  };

  const getLoadingColor = () => {
    switch (mealType) {
      case 'breakfast': return 'text-lemon';
      case 'lunch': return 'text-terra-500';
      case 'dinner': return 'text-primary-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className={`meal-placeholder ${getMealTypeColor()}`}>
        <motion.div
          className="flex flex-col items-center w-full h-full justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-3"
          >
            <Loader2 className={`w-8 h-8 ${getLoadingColor()}`} />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">Finding recipe...</span>
          <span className="text-xs text-gray-500 mt-1">Please wait</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`meal-placeholder ${getMealTypeColor()}`}>
      <AnimatePresence>
        {!showOptions ? (
          <motion.button
            onClick={() => setShowOptions(true)}
            className="flex flex-col items-center w-full h-full justify-center transition-all duration-200 hover:scale-105"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle className="w-8 h-8 mb-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Add {mealType}</span>
          </motion.button>
        ) : (
          <motion.div
            className="flex flex-col gap-2 w-full h-full justify-center p-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={handleRandomRecipe}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 ${getButtonColor()}`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentTier === 'free' && !canUseRandomRecipes ? (
                <>
                  <Shuffle className="w-4 h-4" />
                  <span className="text-xs font-medium">Random</span>
                  <Lock className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Shuffle className="w-4 h-4" />
                  <span className="text-xs font-medium">Random</span>
                </>
              )}
            </motion.button>

            {/* Search Recipe - Free users see locked version */}
            {currentTier === 'free' ? (
              <motion.button
                onClick={handleSearchRecipe}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 ${getButtonColor()} opacity-60 relative`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                title="Upgrade to Standard to search recipes"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-medium">Search</span>
                <Lock className="w-3 h-3" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSearchRecipe}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 ${getButtonColor()}`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-medium">Search</span>
              </motion.button>
            )}

            {/* Import Recipe - Standard+ users only */}
            {!canImportRecipes ? (
              <motion.button
                onClick={handleImportRecipe}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 ${getButtonColor()} opacity-60 relative`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                title="Upgrade to Standard to import recipes"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">Import</span>
                <Lock className="w-3 h-3" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleImportRecipe}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 ${getButtonColor()}`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">Import</span>
              </motion.button>
            )}

            <motion.button
              onClick={handleManualRecipe}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 ${getButtonColor()}`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-xs font-medium">Manual</span>
            </motion.button>

            <motion.button
              onClick={() => setShowOptions(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealPlaceholder;