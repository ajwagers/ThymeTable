import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Sparkles, RefreshCw, AlertCircle, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { useMealPlanState } from '../hooks/useMealPlanState';
import { useFavorites } from '../contexts/FavoritesContext';

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

  const { saveMealPlan } = useFavorites();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveMealPlan = async () => {
    if (!saveName.trim()) return;

    setSaving(true);
    try {
      await saveMealPlan(saveName, saveDescription, days);
      setShowSaveModal(false);
      setSaveName('');
      setSaveDescription('');
    } catch (error) {
      console.error('Error saving meal plan:', error);
    } finally {
      setSaving(false);
    }
  };

  const generatePlanName = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Get Sunday
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Get Saturday
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `Week of ${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  const openSaveModal = () => {
    setSaveName(generatePlanName());
    setSaveDescription('');
    setShowSaveModal(true);
  };

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
            onClick={openSaveModal}
            className="btn-secondary"
            disabled={days.every(day => day.meals.length === 0)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Plan
          </button>
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

      {/* Save Meal Plan Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
            />
            
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Meal Plan</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <input
                    id="plan-name"
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Week of Jan 15-21"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="plan-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="plan-description"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add notes about this meal plan..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveMealPlan}
                  disabled={!saveName.trim() || saving}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WeeklyPlannerPage;