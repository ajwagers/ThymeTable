import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Sparkles, RefreshCw, AlertCircle, X, Save, ExternalLink, Crown, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyCalendar from '../components/WeeklyCalendar';
import ChangeRecipeModal from '../components/ChangeRecipeModal';
import { AddRecipeModal } from '../components/AddRecipeModal';
import SearchRecipeModal from '../components/SearchRecipeModal';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { useMealPlanState } from '../hooks/useMealPlanState';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSubscription, useFeatureAccess } from '../contexts/SubscriptionContext';

function WeeklyPlannerPage() {
  const { 
    days, 
    handleDragEnd, 
    getListStyle,
    fetchRandomRecipe,
    addManualRecipe,
    addSearchRecipe,
    changeRecipe,
    changeRecipeToSearchResult,
    autofillCalendar,
    isAutofilling,
    resetWeek,
    apiError,
    isRecipeLoading
  } = useMealPlanState();

  const { saveMealPlan } = useFavorites();
  const { currentTier, upgradeToTier } = useSubscription();
  const { canImportRecipes } = useFeatureAccess();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState<string>('');

  // Change Recipe Modal State
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeModalData, setChangeModalData] = useState<{
    dayId: string;
    mealId: string;
    mealType: string;
    category: 'main' | 'side';
  } | null>(null);

  // Add Recipe Modal State
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [addRecipeData, setAddRecipeData] = useState<{
    dayId: string;
    mealType: string;
  } | null>(null);

  // Search Recipe Modal State
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchRecipeData, setSearchRecipeData] = useState<{
    dayId: string;
    mealType: string;
  } | null>(null);

  // Import Recipe Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRecipeData, setImportRecipeData] = useState<{
    dayId: string;
    mealType: string;
  } | null>(null);

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
    // Check if user can save meal plans
    if (currentTier === 'free') {
      setRestrictedFeature('Save Meal Plans');
      setShowUpgradeModal(true);
      return;
    }
    
    setSaveName(generatePlanName());
    setSaveDescription('');
    setShowSaveModal(true);
  };

  const handleAutofill = () => {
    // Check if user can use autofill (Premium feature)
    if (currentTier !== 'premium') {
      setRestrictedFeature('Autofill Calendar');
      setShowUpgradeModal(true);
      return;
    }
    
    autofillCalendar();
  };

  const handleUpgrade = async (tier: 'standard' | 'premium') => {
    try {
      await upgradeToTier(tier);
      setShowUpgradeModal(false);
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const handleChangeRecipeRequest = (dayId: string, mealId: string, mealType: string, category: 'main' | 'side') => {
    setChangeModalData({ dayId, mealId, mealType, category });
    setShowChangeModal(true);
  };

  const handleChangeRecipeRandom = () => {
    if (changeModalData) {
      changeRecipe(
        changeModalData.dayId, 
        changeModalData.mealId, 
        changeModalData.mealType, 
        changeModalData.category, 
        true
      );
    }
    setShowChangeModal(false);
    setChangeModalData(null);
  };

  const handleChangeRecipeFavorite = (favoriteRecipeId: number) => {
    if (changeModalData) {
      changeRecipe(
        changeModalData.dayId, 
        changeModalData.mealId, 
        changeModalData.mealType, 
        changeModalData.category, 
        false, 
        favoriteRecipeId
      );
    }
    setShowChangeModal(false);
    setChangeModalData(null);
  };

  const handleChangeRecipeSearch = async (recipe: any) => {
    if (changeModalData) {
      // Use the proper method for replacing a meal with a search result
      await changeRecipeToSearchResult(
        changeModalData.dayId, 
        changeModalData.mealId, 
        changeModalData.mealType, 
        changeModalData.category, 
        recipe
      );
    }
    setShowChangeModal(false);
    setChangeModalData(null);
  };

  const handleAddManualRecipeRequest = (dayId: string, mealType: string) => {
    setAddRecipeData({ dayId, mealType });
    setShowAddRecipeModal(true);
  };

  const handleSearchRecipeRequest = (dayId: string, mealType: string) => {
    setSearchRecipeData({ dayId, mealType });
    setShowSearchModal(true);
  };

  const handleImportRecipeRequest = (dayId: string, mealType: string) => {
    // Check if user can import recipes
    if (!canImportRecipes) {
      setRestrictedFeature('Import Recipes');
      setShowUpgradeModal(true);
      return;
    }
    
    setImportRecipeData({ dayId, mealType });
    setShowImportModal(true);
  };

  const handleRestrictedFeature = (feature: string) => {
    setRestrictedFeature(feature);
    setShowUpgradeModal(true);
  };

  const handleSaveManualRecipe = async (recipe: any) => {
    if (addRecipeData) {
      await addManualRecipe(addRecipeData.dayId, addRecipeData.mealType, recipe);
      setShowAddRecipeModal(false);
      setAddRecipeData(null);
    }
  };

  const handleSelectSearchRecipe = async (recipe: any) => {
    if (searchRecipeData) {
      await addSearchRecipe(searchRecipeData.dayId, searchRecipeData.mealType, recipe);
      setShowSearchModal(false);
      setSearchRecipeData(null);
    }
  };

  const handleSaveImportedRecipe = async (recipe: any) => {
    if (importRecipeData) {
      await addManualRecipe(importRecipeData.dayId, importRecipeData.mealType, recipe);
      setShowImportModal(false);
      setImportRecipeData(null);
    }
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
          {/* Save Plan Button - Standard+ feature */}
          {currentTier === 'free' ? (
            <button
              onClick={openSaveModal}
              className="btn-secondary opacity-60 relative"
              title="Upgrade to Standard to save meal plans"
            >
              <Save className="w-4 w-4 mr-2" />
              Save Plan
              <Lock className="w-3 h-3 ml-1" />
            </button>
          ) : (
            <button
              onClick={openSaveModal}
              className="btn-secondary"
              disabled={days.every(day => day.meals.length === 0)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Plan
            </button>
          )}
          
          <button
            onClick={resetWeek}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Week
          </button>
          
          {/* Autofill Calendar Button - Premium feature */}
          {currentTier !== 'premium' ? (
            <button
              onClick={handleAutofill}
              className="btn-primary opacity-75 relative"
              title="Upgrade to Premium for AI-powered autofill"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Autofill Calendar
              <Crown className="w-3 h-3 ml-1" />
            </button>
          ) : (
            <button
              onClick={autofillCalendar}
              disabled={isAutofilling}
              className={`btn-primary ${isAutofilling ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isAutofilling ? 'Generating Meals...' : 'Autofill Calendar'}
            </button>
          )}
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <WeeklyCalendar 
          days={days} 
          getListStyle={getListStyle} 
          onAddMeal={fetchRandomRecipe}
          onAddManualRecipe={handleAddManualRecipeRequest}
          onSearchRecipe={handleSearchRecipeRequest}
          onImportRecipe={handleImportRecipeRequest}
          onChangeRecipe={handleChangeRecipeRequest}
          isRecipeLoading={isRecipeLoading}
          onRestrictedFeature={handleRestrictedFeature}
        />
      </DragDropContext>

      {/* Change Recipe Modal */}
      <ChangeRecipeModal
        isOpen={showChangeModal}
        onClose={() => {
          setShowChangeModal(false);
          setChangeModalData(null);
        }}
        mealType={changeModalData?.mealType || ''}
        category={changeModalData?.category || 'main'}
        onSelectRandom={handleChangeRecipeRandom}
        onSelectFavorite={handleChangeRecipeFavorite}
        onSelectSearchResult={handleChangeRecipeSearch}
        isLoading={changeModalData ? isRecipeLoading(`change-${changeModalData.mealId}`) : false}
        onRestrictedFeature={handleRestrictedFeature}
      />

      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={showAddRecipeModal}
        onClose={() => {
          setShowAddRecipeModal(false);
          setAddRecipeData(null);
        }}
        onSave={handleSaveManualRecipe}
        mealType={addRecipeData?.mealType}
        category="main"
      />

      {/* Search Recipe Modal */}
      <SearchRecipeModal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setSearchRecipeData(null);
        }}
        onSelectRecipe={handleSelectSearchRecipe}
        mealType={searchRecipeData?.mealType || 'dinner'}
        category="main"
      />

      {/* Import Recipe Modal */}
      <ImportRecipeModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportRecipeData(null);
        }}
        onSave={handleSaveImportedRecipe}
        mealType={importRecipeData?.mealType}
        category="main"
      />

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

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
            />
            
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Unlock {restrictedFeature}
                </h3>
                <p className="text-gray-600">
                  {restrictedFeature === 'Autofill Calendar' 
                    ? 'Get AI-powered meal planning with our Premium plan'
                    : restrictedFeature === 'Save Meal Plans'
                    ? 'Save and reuse your meal plans with Standard or Premium'
                    : 'Access advanced features with a paid plan'
                  }
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {(currentTier === 'free' && restrictedFeature !== 'Autofill Calendar') && (
                  <button
                    onClick={() => handleUpgrade('standard')}
                    className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-lg transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Standard Plan</h4>
                        <p className="text-sm text-gray-600">15 saved plans, advanced filters, recipe import</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">$4.99</div>
                        <div className="text-xs text-gray-500">/month</div>
                      </div>
                    </div>
                  </button>
                )}
                
                <button
                  onClick={() => handleUpgrade('premium')}
                  className="w-full p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-yellow-200 rounded-lg transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center">
                        Premium Plan
                        <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                      </h4>
                      <p className="text-sm text-gray-600">
                        {restrictedFeature === 'Autofill Calendar' 
                          ? 'AI-powered autofill + unlimited everything'
                          : 'Unlimited everything + AI recommendations'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">$9.99</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Maybe Later
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