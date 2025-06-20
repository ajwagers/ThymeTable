import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, Utensils, Users, ExternalLink, RefreshCw, Heart, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface MealCardProps {
  meal: Meal;
  index: number;
  isExpanded?: boolean;
  isHovered?: boolean;
  onChangeRecipe?: (mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => void;
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
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [showHoverOptions, setShowHoverOptions] = useState(false);
  const [showChangeOptions, setShowChangeOptions] = useState(false);
  
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

  const handleChangeRecipeRandom = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onChangeRecipe && dayId) {
      onChangeRecipe(meal.id, meal.type, meal.category, true);
      setShowChangeOptions(false);
      setShowHoverOptions(false);
    }
  };

  const handleChangeRecipeFavorite = (e: React.MouseEvent, favoriteRecipeId: number) => {
    e.stopPropagation();
    
    if (onChangeRecipe && dayId) {
      onChangeRecipe(meal.id, meal.type, meal.category, false, favoriteRecipeId);
      setShowChangeOptions(false);
      setShowHoverOptions(false);
    }
  };

  const handleShowChangeOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowChangeOptions(true);
  };

  const handleBackToHover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowChangeOptions(false);
  };

  // Filter favorites that match the current meal type
  const relevantFavorites = favorites.filter(fav => {
    const dishTypes = fav.recipe_data.dishTypes || [];
    const title = fav.recipe_data.title.toLowerCase();
    
    // Simple matching logic - can be enhanced
    if (meal.type === 'breakfast') {
      return dishTypes.some(type => type.toLowerCase().includes('breakfast')) || 
             title.includes('breakfast') || title.includes('pancake') || title.includes('omelette');
    } else if (meal.type === 'lunch') {
      return dishTypes.some(type => type.toLowerCase().includes('lunch')) || 
             title.includes('lunch') || title.includes('sandwich') || title.includes('salad');
    } else if (meal.type === 'dinner') {
      return dishTypes.some(type => type.toLowerCase().includes('dinner')) || 
             dishTypes.some(type => type.toLowerCase().includes('main course')) ||
             title.includes('dinner');
    }
    return true; // Include all if no specific match
  });

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
            zIndex: showHoverOptions ? 1000 : 'auto', // Ensure the entire card is elevated when showing options
          }}
          onMouseEnter={() => setShowHoverOptions(true)}
          onMouseLeave={() => {
            setShowHoverOptions(false);
            setShowChangeOptions(false);
          }}
        >
          {meal.image && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity z-0"
              style={{ backgroundImage: `url(${meal.image})` }}
            />
          )}
          
          {/* Hover Options Overlay - HIGHEST Z-INDEX */}
          <AnimatePresence>
            {showHoverOptions && !snapshot.isDragging && (
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                style={{ zIndex: 9999 }} // Highest possible z-index
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {!showChangeOptions ? (
                  <div className="flex flex-col gap-2">
                    <motion.button
                      onClick={handleOpenRecipe}
                      className="bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                      style={{ zIndex: 10000 }}
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
                      onClick={handleShowChangeOptions}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                      style={{ zIndex: 10000 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Change Recipe
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    <motion.button
                      onClick={handleChangeRecipeRandom}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                      style={{ zIndex: 10000 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Shuffle className="w-4 h-4" />
                      Random Recipe
                    </motion.button>
                    
                    {relevantFavorites.length > 0 && (
                      <>
                        <div className="text-white text-xs text-center opacity-75">
                          Choose from favorites:
                        </div>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {relevantFavorites.slice(0, 3).map((favorite) => (
                            <motion.button
                              key={favorite.id}
                              onClick={(e) => handleChangeRecipeFavorite(e, favorite.recipe_id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-1 w-full"
                              style={{ zIndex: 10000 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.15 }}
                            >
                              <Heart className="w-3 h-3 fill-current" />
                              <span className="truncate">{favorite.recipe_title}</span>
                            </motion.button>
                          ))}
                        </div>
                      </>
                    )}
                    
                    <motion.button
                      onClick={handleBackToHover}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium transition-all duration-200"
                      style={{ zIndex: 10000 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Back
                    </motion.button>
                  </div>
                )}
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