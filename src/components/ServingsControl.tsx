import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import { useServings } from '../contexts/ServingsContext';

interface ServingsControlProps {
  mealId?: string;
  className?: string;
  variant?: 'header' | 'card';
}

const ServingsControl: React.FC<ServingsControlProps> = ({ mealId, className = '', variant = 'header' }) => {
  const { globalServings, setGlobalServings, mealServings, setMealServings } = useServings();

  const servings = mealId ? (mealServings[mealId] || globalServings) : globalServings;
  const setServings = mealId ? 
    (value: number) => setMealServings(mealId, value) : 
    setGlobalServings;

  const isHeader = variant === 'header';
  const baseClasses = isHeader
    ? 'flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20'
    : 'flex items-center gap-2';

  const iconClasses = isHeader ? 'text-white' : 'text-gray-600';
  const buttonClasses = isHeader
    ? 'p-1 hover:bg-white/10 transition-colors'
    : 'p-1 hover:bg-gray-100 transition-colors rounded';
  const valueClasses = isHeader
    ? 'px-3 min-w-[30px] text-center text-white'
    : 'px-2 min-w-[24px] text-center text-gray-700 text-sm';

  return (
    <div className={`${baseClasses} ${className}`}>
      <Users className={`w-4 h-4 ${iconClasses}`} />
      <div className="flex items-center">
        <button
          onClick={() => setServings(Math.max(1, servings - 1))}
          className={buttonClasses}
          aria-label="Decrease servings"
        >
          <Minus className={`w-4 h-4 ${iconClasses}`} />
        </button>
        <div className={valueClasses}>
          {servings}
        </div>
        <button
          onClick={() => setServings(servings + 1)}
          className={buttonClasses}
          aria-label="Increase servings"
        >
          <Plus className={`w-4 h-4 ${iconClasses}`} />
        </button>
      </div>
    </div>
  );
}

export default ServingsControl;