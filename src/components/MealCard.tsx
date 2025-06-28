import React from 'react';
import { Eye, Shuffle, MoreVertical, Clock, Users, Utensils, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Utensils, MoreVertical, Eye, Shuffle } from 'lucide-react';
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
  const [showActions, setShowActions] = React.useState(false);

  const handleViewRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meal.recipeId) {
      navigate(`/recipe/${meal.recipeId}`);
    }
  };

  const handleChangeRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChangeRecipe) {
      onChangeRecipe(meal.id, meal.type, meal.category);
    }
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
            snapshot.isDragging ? 'shadow-lg scale-105 rotate-2' : ''
          } transition-all duration-200`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {snapshot.isDragging && (
            <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              Moving...
            </div>
          )}

          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">
                {meal.name}
              </h4>
              {meal.category && (
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryBadgeColor()}`}>
                  {meal.category}
                </span>
              )}
            </div>
            
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className={`p-1 rounded-full transition-all duration-200 ${
                  showActions || isHovered ? 'bg-white shadow-sm opacity-100' : 'opacity-0'
                }`}
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                  {meal.recipeId && (
                    <button
                      onClick={handleViewRecipe}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Recipe
                    </button>
                  )}
                  <button
                    onClick={handleChangeRecipe}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Change Recipe
                  </button>
                </div>
              )}
            </div>
          </div>

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

          {meal.image && (
            <div className="mt-2 rounded overflow-hidden">
              <img 
                src={meal.image} 
                alt={meal.name}
                className="w-full h-16 object-cover"
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default MealCard;