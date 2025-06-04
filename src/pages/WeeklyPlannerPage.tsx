import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Sparkles, RefreshCw } from 'lucide-react';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { useMealPlanState } from '../hooks/useMealPlanState';

function WeeklyPlannerPage() {
  const { 
    days, 
    handleDragEnd, 
    getListStyle,
    fetchRandomRecipe,
    autofillCalendar,
    isAutofilling,
    resetWeek
  } = useMealPlanState();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-800 px-1">Weekly Meal Plan</h2>
        <div className="flex gap-2">
          <button
            onClick={resetWeek}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Week
          </button>
          <button
            onClick={autofillCalendar}
            disabled={isAutofilling}
            className={`btn-primary ${isAutofilling ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAutofilling ? 'Generating Meals...' : 'Autofill Calendar'}
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <WeeklyCalendar 
          days={days} 
          getListStyle={getListStyle} 
          onAddMeal={fetchRandomRecipe}
        />
      </DragDropContext>
    </div>
  );
}

export default WeeklyPlannerPage;