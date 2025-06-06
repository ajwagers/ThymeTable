import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Sparkles, RefreshCw, AlertCircle, X } from 'lucide-react';
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
    resetWeek,
    apiError
  } = useMealPlanState();

  return (
    <div className="relative">
      {isAutofilling && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Generating your meal plan...</p>
          </div>
        </div>
      )}

      {apiError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">API Quota Exceeded</p>
            <p className="text-red-700 text-sm mt-1">{apiError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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