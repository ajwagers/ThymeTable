import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Trash2, Download, Edit3, Plus, Save, X, ExternalLink } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { motion, AnimatePresence } from 'framer-motion';

function SavedMealPlansPage() {
  const navigate = useNavigate();
  const { savedMealPlans, deleteMealPlan, loadMealPlan, loading } = useFavorites();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteMealPlan(planId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const handleLoadPlan = async (planId: string) => {
    try {
      const mealPlanData = await loadMealPlan(planId);
      if (mealPlanData) {
        // Store the loaded meal plan in localStorage to replace current plan
        localStorage.setItem('mealPlan', JSON.stringify(mealPlanData));
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const startEditing = (plan: any) => {
    setEditingPlan(plan.id);
    setEditName(plan.name);
    setEditDescription(plan.description || '');
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setEditName('');
    setEditDescription('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMealCount = (mealPlanData: any[]) => {
    return mealPlanData.reduce((total, day) => total + day.meals.length, 0);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
      {/* Bolt Logo - Top Right */}
      <div className="absolute top-4 right-4">
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
          title="Powered by Bolt.new"
        >
          <img
            src="/black_circle_360x360.png"
            alt="Powered by Bolt"
            className="w-4 h-4 rounded-full"
          />
          <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-gray-700" />
        </a>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Planner
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-primary-500" />
          Saved Meal Plans
        </h1>
        <div></div>
      </div>

      {savedMealPlans.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">No Saved Meal Plans Yet</h2>
          <p className="text-gray-500 mb-6">
            Save your weekly meal plans to easily access them later or share with others.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Create Meal Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedMealPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingPlan === plan.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Plan name"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Description (optional)"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Here you would call updateMealPlan
                            // updateMealPlan(plan.id, editName, editDescription, plan.meal_plan_data);
                            cancelEditing();
                          }}
                          className="btn-primary text-sm"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="btn-secondary text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-gray-600 mb-3">{plan.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Created {formatDate(plan.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <Plus className="w-4 h-4 mr-1" />
                          <span>{getMealCount(plan.meal_plan_data)} meals</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {editingPlan !== plan.id && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleLoadPlan(plan.id)}
                      className="btn-primary text-sm"
                      title="Load this meal plan"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Load Plan
                    </button>
                    <button
                      onClick={() => startEditing(plan)}
                      className="btn-secondary text-sm"
                      title="Edit plan details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(plan.id)}
                      className="btn-secondary text-sm text-red-600 hover:bg-red-50 border-red-200"
                      title="Delete meal plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Meal Plan Preview */}
              {editingPlan !== plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-7 gap-2">
                    {plan.meal_plan_data.map((day: any) => (
                      <div key={day.id} className="text-center">
                        <h4 className="text-xs font-medium text-gray-600 mb-1">
                          {day.name.slice(0, 3)}
                        </h4>
                        <div className="space-y-1">
                          {day.meals.slice(0, 3).map((meal: any, mealIndex: number) => (
                            <div
                              key={mealIndex}
                              className="w-full h-2 bg-primary-200 rounded-sm"
                              title={meal.name}
                            />
                          ))}
                          {day.meals.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{day.meals.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
            />
            
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Meal Plan</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this meal plan? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeletePlan(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
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

export default SavedMealPlansPage;