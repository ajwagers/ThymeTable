import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MealCard from './MealCard';
import MealPlaceholder from './MealPlaceholder';
import { Meal } from '../types';

interface MealListProps {
  meals: Meal[];
  mealType: string;
  onAddMeal: () => void;
}

const MealList: React.FC<MealListProps> = ({ meals, mealType, onAddMeal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (meal: Meal) => {
    // Use the recipeId field if available, otherwise try to extract from the meal ID
    let recipeId = meal.recipeId;
    
    if (!recipeId) {
      // Try to extract from meal ID (format: dayId-mealType-timestamp or dayId-mealType-side-timestamp)
      const parts = meal.id.split('-');
      // Get the last part which should be the timestamp, but we need the actual recipe ID
      // This is a fallback - ideally recipeId should always be set
      console.warn('No recipeId found for meal:', meal.name, 'ID:', meal.id);
      return; // Don't navigate if we don't have a proper recipe ID
    }
    
    console.log('Navigating to recipe:', recipeId, 'for meal:', meal.name);
    
    if (recipeId && !isNaN(parseInt(recipeId.toString()))) {
      navigate(`/recipe/${recipeId}`);
    } else {
      console.error('Invalid recipe ID:', recipeId, 'for meal:', meal);
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
        zIndex: isHovered ? 50 : 1
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
                yOffset = isMainDish ? basePosition : basePosition - 120;
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
                    zIndex: isHovered ? (isMainDish ? 3 : 2) : sortedMeals.length - index,
                    rotate: isHovered ? 0 : index * -2,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  whileHover={{
                    scale: isMainDish ? 1.12 : 1.06,
                    transition: { duration: 0.2 }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(meal);
                  }}
                >
                  <MealCard 
                    meal={meal} 
                    index={index} 
                    isExpanded={isExpanded}
                    isHovered={isHovered}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <MealPlaceholder mealType={mealType} onAddMeal={onAddMeal} />
      )}
    </div>
  );
};

export default MealList;