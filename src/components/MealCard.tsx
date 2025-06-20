import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, Utensils, Users, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';

interface MealCardProps {
  meal: Meal;
  index: number;
  isExpanded?: boolean;
  isHovered?: boolean;
  onChangeRecipe?: (mealId: string, mealType: string, category: 'main' | 'side') => void;
  dayId?: string;
}

const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  index, 
  isExpanded, 
  isHovered,
  onChangeRecipe,
  dayId
}) => {
  const { adjustQuantity, mealServings, globalServings } = useServings();
  const navigate = useNavigate();
  const [showHoverOptions, setShowHoverOptions] = useState(false);
  
  // Use recipeId if available, otherwise fall back to extracting from meal ID
  const recipeKey = meal.recipeId ? `recipe-${meal.recipeId}` : `recipe-${meal.id.split('-').pop()}`;
  const currentServings = mealServings[recipeKey] || globalServings;

  const adjustedCalories = adjustQuantity(meal.calories, meal.servings, recipeKey);

  const handleOpenRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (meal.recipeId && !isNaN(parseInt(meal.recipeId.toString()))) {
      navigate(`/recipe/${meal.recipeId}`);
    } else {
      console.error('Invalid recipe ID:', meal.recipeId, 'for meal:', meal.name);
    }
  };

  const handleChangeRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onChangeRecipe && dayId) {
      onChangeRecipe(meal.id, meal.type, meal.category);
    }
  };

  return (
    <Draggable draggableId={meal.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            meal-card meal-card-${meal.type} relative overflow-hidden group
            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''}
            ${isExpanded ? 'shadow-xl' : isHovered ? 'shadow-md' : 'shadow-sm'}
            transition-all duration-300
          `}
          style={{
            transformOrigin: 'top center',
            filter: isHovered ? 'none' : 'grayscale(60%)',
          }}
          onMouseEnter={() => setShowHoverOptions(true)}
          onMouseLeave={() => setShowHoverOptions(false)}
        >
          {meal.image && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity"
              style={{ backgroundImage: `url(${meal.image})` }}
            />
          )}
          
          {/* Hover Options Overlay */}
          <AnimatePresence>
            {showHoverOptions && !snapshot.isDragging && (
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={handleOpenRecipe}
                  className="bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Recipe
                </motion.button>
                
                <motion.button
                  onClick={handleChangeRecipe}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Change Recipe
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative z-10">
            <h3 className="font-medium text-gray-800 text-base line-clamp-2 mb-auto">
              {meal.name}
            </h3>
            
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <div className="flex flex-col items-center">
                <Clock className="w-4 h-4 mb-1" />
                <span>{meal.prepTime}</span>
                <span className="text-[10px]">min</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Users className="w-4 h-4 mb-1" />
                <span>{currentServings}</span>
                <span className="text-[10px]">serv</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Utensils className="w-4 h-4 mb-1" />
                <span>{adjustedCalories}</span>
                <span className="text-[10px]">cal</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};

export default MealCard;