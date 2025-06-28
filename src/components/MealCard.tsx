import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Clock, Users, Utensils, MoreVertical, Eye, Shuffle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meal } from '../types';

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
  isExpanded = false, 
  isHovered = false,
  onChangeRecipe,
  dayId
}) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const handleViewRecipe = () => {
    if (meal.recipeId) {
      navigate(`/recipe/${meal.recipeId}`);
    }
  };

  const handleChangeRecipe = () => {
    if (onChangeRecipe) {
      onChangeRecipe(meal.id, meal.type, meal.category);
    }
    setShowActions(false);
  };

  const getMealTypeColor = () => {
    switch (meal.type) {
      case 'breakfast': return 'border-lemon bg-lemon/5';
      case 'lunch': return 'border-terra-400 bg-terra-50';
      case 'dinner': return 'border-primary-500 bg-primary-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryBadgeColor = () => {
    switch (meal.category) {
      case 'main': return 'bg-primary-100 text-primary-700';
      case 'side': return 'bg-terra-100 text-terra-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Draggable draggableId={meal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`meal-card ${getMealTypeColor()} ${
            snapshot.isDragging ? 'shadow-2xl rotate-3 scale-105' : 'shadow-sm'
          } transition-all duration-200`}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? `${provided.draggableProps.style?.transform} rotate(3deg)` 
              : provided.draggableProps.style?.transform,
          }}
        >
          <div className="relative">
            {/* Category Badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor()}`}>
                {meal.category}
              </span>
            </div>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2 z-10">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>

                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {meal.recipeId && (
                      <button
                        onClick={handleViewRecipe}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Recipe
                      </button>
                    )}
                    <button
                      onClick={handleChangeRecipe}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Shuffle className="w-4 h-4" />
                      Change Recipe
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Recipe Image */}
            <div className="relative h-24 bg-gray-100 rounded-t-lg overflow-hidden">
              {meal.image ? (
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Utensils className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div className="p-3">
              <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                {meal.name}
              </h4>

              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{meal.readyInMinutes}m</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{meal.servings}</span>
                </div>
                
                <div className="flex items-center">
                  <Utensils className="w-3 h-3 mr-1" />
                  <span>{meal.calories}</span>
                </div>
              </div>

              {/* Cuisines */}
              {meal.cuisines && meal.cuisines.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {meal.cuisines.slice(0, 2).map((cuisine, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-terra-100 text-terra-700 rounded-full text-xs"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Drag Indicator */}
            {snapshot.isDragging && (
              <div className="absolute inset-0 bg-primary-500/10 rounded-lg border-2 border-primary-500 border-dashed flex items-center justify-center">
                <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-primary-700">
                  Moving...
                </div>
              </div>
            )}
          </div>

          {/* Click overlay to close actions menu */}
          {showActions && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};

export default MealCard;