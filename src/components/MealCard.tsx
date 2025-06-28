import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Eye, Shuffle, MoreVertical, Clock, Users, Utensils, Trash2, ChevronDown } from 'lucide-react';
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
  const [isCardHovered, setIsCardHovered] = useState(false);

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
          className={`meal-card group relative transition-all duration-200 ${getMealTypeColor()} ${
            snapshot.isDragging ? 'shadow-lg rotate-3 scale-105' : ''
          }`}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => {
            setIsCardHovered(false);
            setShowDropdown(false);
          }}
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
                className={`p-2 rounded-full shadow-lg transition-all duration-200 transform ${
                  isCardHovered || showDropdown
                    ? 'bg-white scale-110 opacity-100 shadow-xl' 
                    : 'bg-white/70 scale-100 opacity-60'
                } hover:bg-white hover:scale-125 hover:shadow-2xl`}
                title="Recipe options"
              >
                <MoreVertical className={`w-4 h-4 transition-colors duration-200 ${
                  isCardHovered || showDropdown ? 'text-gray-800' : 'text-gray-600'
                }`} />
              </button>

              {showDropdown && (
                <div className="absolute top-14 right-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Small arrow pointing up */}
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewRecipe();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors duration-150"
                  >
                    <Eye className="w-4 h-4 mr-3 text-blue-500" />
                    View Recipe
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeRecipe();
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center transition-colors duration-150"
                  >
                    <Shuffle className="w-4 h-4 mr-3 text-green-500" />
                    Change Recipe
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipe();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors duration-150 border-t border-gray-100 mt-1 pt-3"
                  >
                    <Trash2 className="w-4 h-4 mr-3 text-red-500" />
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