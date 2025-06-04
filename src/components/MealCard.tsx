import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, Utensils, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';

interface MealCardProps {
  meal: Meal;
  index: number;
  isExpanded?: boolean;
  isHovered?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ meal, index, isExpanded, isHovered }) => {
  const { adjustQuantity, mealServings, globalServings } = useServings();
  const recipeId = `recipe-${meal.id.split('-').pop()}`;
  const currentServings = mealServings[recipeId] || globalServings;

  const adjustedCalories = adjustQuantity(meal.calories, meal.servings, recipeId);

  return (
    <Draggable draggableId={meal.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            meal-card meal-card-${meal.type} relative overflow-hidden
            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''}
            ${isExpanded ? 'shadow-xl' : isHovered ? 'shadow-md' : 'shadow-sm'}
            transition-all duration-300
          `}
          style={{
            transformOrigin: 'top center',
            filter: isHovered ? 'none' : 'grayscale(60%)',
          }}
        >
          {meal.image && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity"
              style={{ backgroundImage: `url(${meal.image})` }}
            />
          )}
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