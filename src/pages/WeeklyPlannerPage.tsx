import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Sparkles, RefreshCw, AlertCircle, X, Save, ExternalLink, Crown, Lock, TrendingUp, Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyCalendar from '../components/WeeklyCalendar';
import ChangeRecipeModal from '../components/ChangeRecipeModal';
import { AddRecipeModal } from '../components/AddRecipeModal';
import SearchRecipeModal from '../components/SearchRecipeModal';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { useMealPlanState } from '../hooks/useMealPlanState';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSubscription, useFeatureAccess } from '../contexts/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';

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
    isRecipeLoading,
    dailyRandomRecipeCount,
    dailyRandomRecipeLimit,
    canUseRandomRecipes,
    canUseAutofill
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Usage tracking state
  const [showUsageWarning, setShowUsageWarning] = useState(false);

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
  const [showImportRecipeModal, setShowImportRecipeModal] = useState(false);
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
    if (!canUseAutofill) {
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

  const handleImportMealPlan = async () => {
    if (!importData.trim()) {
      setImportError('Please paste meal plan data');
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      // Try to parse the imported data
      const parsedData = JSON.parse(importData);
      
      // Validate the structure
      if (!parsedData.meal_plan_data || !Array.isArray(parsedData.meal_plan_data)) {
        throw new Error('Invalid meal plan format');
      }

      // Load the meal plan data directly into the current week
      localStorage.setItem('mealPlan', JSON.stringify(parsedData.meal_plan_data));
      
      // Refresh the page to load the new data
      window.location.reload();
      
    } catch (error) {
      console.error('Error importing meal plan:', error);
      setImportError('Invalid meal plan data. Please check the format and try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleExportCurrentPlan = () => {
    const exportData = {
      name: `Week of ${new Date().toLocaleDateString()}`,
      description: 'Exported meal plan',
      meal_plan_data: days,
      exported_at: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal_plan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    setShowImportRecipeModal(true);
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
      setShowImportRecipeModal(false);
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

      {/* Free Tier Usage Warning */}
      {currentTier === 'free' && dailyRandomRecipeCount >= dailyRandomRecipeLimit - 2 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-800 font-medium">
              {dailyRandomRecipeCount >= dailyRandomRecipeLimit 
                ? 'Daily Random Recipe Limit Reached' 
                : `${dailyRandomRecipeLimit - dailyRandomRecipeCount} random recipes remaining today`
              }
            </p>
            <p className="text-amber-700 text-sm mt-1">
              {dailyRandomRecipeCount >= dailyRandomRecipeLimit
                ? 'Upgrade to Standard or Premium for unlimited random recipes.'
                : 'Upgrade for unlimited random recipes and advanced features.'
              }
            </p>
          </div>
          <button
            onClick={() => {
              setRestrictedFeature('Unlimited Random Recipes');
              setShowUpgradeModal(true);
            }}
            className="btn-primary text-sm"
          >
            Upgrade
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-800 px-1">Weekly Meal Plan</h2>
        <div className="flex gap-2">
          {/* Import/Export Actions */}
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary"
            title="Import a meal plan"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          
          <button
            onClick={handleExportCurrentPlan}
            className="btn-secondary"
            disabled={days.every(day => day.meals.length === 0)}
            title="Export current meal plan"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export
          </button>
          
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
          {!canUseAutofill ? (
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
        isOpen={showImportRecipeModal}
        onClose={() => {
          setShowImportRecipeModal(false);
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

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
            />
            
            <motion.div
              className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-primary-500" />
                  Import Meal Plan
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="import-data" className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Plan Data (JSON)
                  </label>
                  <textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="Paste your exported meal plan JSON data here..."
                  />
                </div>

                {importError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">⚠️ Warning:</h4>
                  <p className="text-sm text-amber-700">
                    Importing a meal plan will replace your current weekly plan. Make sure to export your current plan first if you want to keep it.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">How to import:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Export a meal plan from ThymeTable or another source</li>
                    <li>2. Copy the JSON data from the exported file</li>
                    <li>3. Paste it in the text area above</li>
                    <li>4. Click "Import Plan" to load it into your current week</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportMealPlan}
                  disabled={!importData.trim() || importing}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Importing...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Plan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <UpgradePrompt
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={restrictedFeature}
        requiredTier={restrictedFeature === 'Autofill Calendar' ? 'premium' : 'standard'}
      />
    </div>
  );
}

export default WeeklyPlannerPage;