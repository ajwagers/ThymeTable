import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MealCard from './MealCard';
import MealPlaceholder from './MealPlaceholder';
import { Meal } from '../types';

interface MealListProps {
  meals: Meal[];
  mealType: string;
  onAddMeal: () => void;
  onAddManualRecipe?: () => void;
  onSearchRecipe?: () => void;
  onImportRecipe?: () => void;
  onChangeRecipe?: (mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => void;
  dayId?: string;
  isLoading?: boolean;
  onRestrictedFeature?: (feature: string) => void;
  onRemoveRecipe?: (mealId: string) => void;
}

const MealList: React.FC<MealListProps> = ({ 
  meals, 
  mealType, 
  onAddMeal,
  onAddManualRecipe,
  onSearchRecipe,
  onImportRecipe,
  onChangeRecipe,
  dayId,
  isLoading = false,
  onRestrictedFeature,
  onRemoveRecipe
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChangeRecipe = (mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => {
    if (onChangeRecipe) {
      onChangeRecipe(mealId, mealType, category, useRandom, favoriteRecipeId);
    }
  };

  // Group meals by category
  const mainMeals = meals.filter(meal => meal.category === 'main');
  const sideMeals = meals.filter(meal => meal.category === 'side');
  const allMeals = [...mainMeals, ...sideMeals];

  return (
    <div 
      className="relative min-h-[180px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsExpanded(false);
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {allMeals.length > 0 ? (
        <div className="relative">
          <AnimatePresence>
            {allMeals.map((meal, index) => {
              const isMainDish = meal.category === 'main';
              const basePosition = index * 6; // Increased spacing between cards
              
              let yOffset;
              if (isExpanded) {
                yOffset = index * 200; // Full expansion with more space
              } else if (isHovered) {
                yOffset = basePosition;
              } else {
                yOffset = basePosition;
              }

              return (
                <motion.div
                  key={meal.id}
                  className="absolute w-full"
                  initial={false}
                  animate={{
                    scale: isHovered ? (isMainDish ? 1.08 : 1.04) : 1,
                    y: yOffset,
                    zIndex: allMeals.length - index,
                    rotate: isHovered ? 0 : index * -2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MealCard 
                    meal={meal} 
                    index={index} 
                    isExpanded={isExpanded}
                    isHovered={isHovered}
                    onChangeRecipe={handleChangeRecipe}
                    dayId={dayId}
                    onRemoveRecipe={onRemoveRecipe}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <MealPlaceholder 
          mealType={mealType} 
          onAddMeal={onAddMeal}
          onAddManualRecipe={onAddManualRecipe}
          onSearchRecipe={onSearchRecipe}
          onImportRecipe={onImportRecipe}
          isLoading={isLoading}
          onRestrictedFeature={onRestrictedFeature}
        />
      )}
    </div>
  );
};

export default MealList;