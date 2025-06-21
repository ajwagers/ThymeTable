import React from 'react';
import DayColumn from './DayColumn';
import { Day } from '../types';

interface WeeklyCalendarProps {
  days: Day[];
  getListStyle: (isDraggingOver: boolean) => string;
  onAddMeal: (dayId: string, mealType: string) => void;
  onAddManualRecipe?: (dayId: string, mealType: string) => void;
  onSearchRecipe?: (dayId: string, mealType: string) => void;
  onImportRecipe?: (dayId: string, mealType: string) => void;
  onChangeRecipe?: (dayId: string, mealId: string, mealType: string, category: 'main' | 'side', useRandom?: boolean, favoriteRecipeId?: number) => void;
  isRecipeLoading?: (recipeKey: string) => boolean;
  onRestrictedFeature?: (feature: string) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  days, 
  getListStyle, 
  onAddMeal,
  onAddManualRecipe,
  onSearchRecipe,
  onImportRecipe,
  onChangeRecipe,
  isRecipeLoading,
  onRestrictedFeature
}) => {
  // Sort days to ensure Sunday is first
  const orderedDays = [...days].sort((a, b) => {
    const dayOrder = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    return dayOrder[a.id as keyof typeof dayOrder] - dayOrder[b.id as keyof typeof dayOrder];
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
      {orderedDays.map((day) => (
        <DayColumn 
          key={day.id} 
          day={day} 
          getListStyle={getListStyle}
          onAddMeal={onAddMeal}
          onAddManualRecipe={onAddManualRecipe}
          onSearchRecipe={onSearchRecipe}
          onImportRecipe={onImportRecipe}
          onChangeRecipe={onChangeRecipe}
          isRecipeLoading={isRecipeLoading}
          onRestrictedFeature={onRestrictedFeature}
        />
      ))}
    </div>
  );
}

export default WeeklyCalendar;