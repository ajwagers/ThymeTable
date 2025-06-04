import React from 'react';
import { PlusCircle } from 'lucide-react';

interface MealPlaceholderProps {
  mealType: string;
  onAddMeal: () => void;
}

const MealPlaceholder: React.FC<MealPlaceholderProps> = ({ mealType, onAddMeal }) => {
  return (
    <div className="meal-placeholder\" onClick={onAddMeal}>
      <div className="flex flex-col items-center">
        <PlusCircle className="w-5 h-5 mb-1" />
        <span className="text-xs">Add {mealType}</span>
      </div>
    </div>
  );
};

export default MealPlaceholder;