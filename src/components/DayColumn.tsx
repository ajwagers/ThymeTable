import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import MealList from './MealList';
import { Day } from '../types';

interface DayColumnProps {
  day: Day;
  getListStyle: (isDraggingOver: boolean) => string;
  onAddMeal: (dayId: string, mealType: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({ day, getListStyle, onAddMeal }) => {
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