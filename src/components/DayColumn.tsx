import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import MealList from './MealList';
import { Day } from '../types';

interface DayColumnProps {
  day: Day;
  getListStyle: (isDraggingOver: boolean) => string;
  onAddMeal: (dayId: string, mealType: string) => void;
  onAddManualRecipe?: (dayId: string, mealType: string) => void;
  onSearchRecipe?: (dayId: string, mealType: string) => void;
  onChangeRecipe?: (dayId: string, mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({ 
  day, 
  getListStyle, 
  onAddMeal,
  onAddManualRecipe,
  onSearchRecipe,
  onChangeRecipe 
}) => {
  const handleChangeRecipe = (mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => {
    if (onChangeRecipe) {
      onChangeRecipe(day.id, mealId, mealType, category, useRandom, favoriteRecipeId);
    }
  };

  const handleAddManualRecipe = (mealType: string) => {
    if (onAddManualRecipe) {
      onAddManualRecipe(day.id, mealType);
    }
  };

  const handleSearchRecipe = (mealType: string) => {
    if (onSearchRecipe) {
      onSearchRecipe(day.id, mealType);
    }
  };

  return (
    <div className="day-column">
      <div className="mb-2">
        <h3 className="font-medium text-charcoal text-center">{day.name}</h3>
        <p className="text-sm text-primary-600 text-center">{day.date}</p>
      </div>
      
      {['breakfast', 'lunch', 'dinner'].map((mealType) => (
        <div key={mealType} className="mb-2">
          <h4 className="text-sm font-medium text-primary-700 mb-1 px-1 capitalize">
            {mealType}
          </h4>
          
          <Droppable 
            droppableId={`${day.id}-${mealType}`} 
            type={mealType}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={getListStyle(snapshot.isDraggingOver)}
              >
                <MealList 
                  meals={day.meals.filter(meal => meal.type === mealType)}
                  mealType={mealType}
                  onAddMeal={() => onAddMeal(day.id, mealType)}
                  onAddManualRecipe={() => handleAddManualRecipe(mealType)}
                  onSearchRecipe={() => handleSearchRecipe(mealType)}
                  onChangeRecipe={handleChangeRecipe}
                  dayId={day.id}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      ))}
    </div>
  );
};

export default DayColumn;