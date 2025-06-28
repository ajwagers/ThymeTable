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

  // Sort meals so main dishes are always on top
  const sortedMeals = [...meals].sort((a, b) => 
    a.category === 'main' ? -1 : b.category === 'main' ? 1 : 0
  );

  return (
    <div 
      className="relative min-h-[160px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsExpanded(false);
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        zIndex: isHovered ? 100 : 1 // Increase base z-index when hovered
      }}
    >
      {sortedMeals.length > 0 ? (
        <div className="relative">
          <AnimatePresence>
            {sortedMeals.map((meal, index) => {
              const isMainDish = meal.category === 'main';
              const basePosition = index * 4;
              
              let yOffset;
              if (isExpanded) {
                yOffset = index * 180; // Full expansion
              } else if (isHovered) {
                yOffset = isMainDish ? basePosition : basePosition + 120; // Slide side dishes down when hovered
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
                    zIndex: isHovered ? (isMainDish ? 200 : 150) : sortedMeals.length - index, // Higher z-index when hovered
                    rotate: isHovered ? 0 : index * -2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  whileHover={{
                    scale: isMainDish ? 1.12 : 1.06,
                    zIndex: 300, // Even higher z-index when individual card is hovered
                    transition: { duration: 0.2 }
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