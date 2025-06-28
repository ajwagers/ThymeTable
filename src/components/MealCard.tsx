import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Eye, Shuffle, MoreVertical, Clock, Users, Utensils, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Meal } from '../types';

interface MealCardProps {
  meal: Meal;
  index: number;
  isExpanded?: boolean;
  isHovered?: boolean;
  onChangeRecipe?: (mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => void;
  dayId?: string;
  onRemoveRecipe?: (mealId: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  index, 
  isExpanded = false, 
  isHovered = false, 
  onChangeRecipe,
  dayId,
  onRemoveRecipe
}) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleViewRecipe = () => {
    if (meal.recipeId) {
      navigate(`/recipe/${meal.recipeId}`);
    }
  };

  const handleChangeRecipe = () => {
    if (onChangeRecipe) {
      onChangeRecipe(meal.id, meal.type, meal.category);
    }
  };

  const handleRemoveRecipe = () => {
    if (onRemoveRecipe) {
      onRemoveRecipe(meal.id);
    }
    setShowDropdown(false);
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
    return meal.category === 'main' 
      ? 'bg-primary-100 text-primary-700' 
      : 'bg-terra-100 text-terra-700';
  };

  return (
    <Draggable draggableId={meal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`meal-card ${getMealTypeColor()} ${
            snapshot.isDragging ? 'shadow-lg rotate-3 scale-105' : ''
          } transition-all duration-200`}
        >
          <div className="relative">
            {/* Category Badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor()}`}>
              {meal.category}
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-1 hover:bg-white/50 rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewRecipe();
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Recipe
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeRecipe();
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    Change Recipe
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipe();
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Recipe
                  </button>
                </div>
              )}
            </div>

            {/* Recipe Image */}
            {meal.image && (
              <img 
                src={meal.image} 
                alt={meal.name}
                className="w-full h-24 object-cover rounded-t-lg"
              />
            )}

            {/* Recipe Content */}
            <div className="p-3">
              <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">
                {meal.name}
              </h4>
              
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{meal.readyInMinutes} min</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  <span>{meal.servings} serv</span>
                </div>
                
                <div className="flex items-center">
                  <Utensils className="w-3 h-3 mr-1" />
                  <span>{meal.calories} cal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default MealCard;