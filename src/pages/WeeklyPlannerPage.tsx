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
    removeRecipe,
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
  const { savedMealPlans, loadMealPlan } = useFavorites();
  const { canImportRecipes } = useFeatureAccess();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importType, setImportType] = useState<'csv' | 'saved'>('csv');
  const [selectedSavedPlan, setSelectedSavedPlan] = useState<string>('');
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
    setImporting(true);
    setImportError('');

    try {
      if (importData.trim()) {
        // Handle CSV import
        const lines = importData.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }
        
        const header = lines[0].toLowerCase();
        if (!header.includes('day') || !header.includes('meal') || !header.includes('recipe')) {
          throw new Error('CSV must contain Day, Meal Type, and Recipe Name columns');
        }
        
        // Parse CSV data
        const importedDays = new Map();
        
        // Initialize days
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayNames.forEach(dayName => {
          importedDays.set(dayName.toLowerCase(), {
            id: dayName.toLowerCase(),
            name: dayName,
            date: '', // Will be set later
            meals: []
          });
        });
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Simple CSV parsing (handles quoted fields)
          const fields = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              if (inQuotes && line[j + 1] === '"') {
                current += '"';
                j++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              fields.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          fields.push(current); // Add last field
          
          if (fields.length >= 3) {
            const dayName = fields[0].trim();
            const mealType = fields[1].trim().toLowerCase();
            const recipeName = fields[2].trim();
            
            const day = importedDays.get(dayName.toLowerCase());
            if (day && recipeName) {
              const meal = {
                id: `${day.id}-${mealType}-${Date.now()}-${Math.random()}`,
                name: recipeName,
                type: mealType,
                category: 'main' as const,
                readyInMinutes: fields[3] ? parseInt(fields[3]) || 30 : 30,
                servings: fields[4] ? parseInt(fields[4]) || 4 : 4,
                calories: fields[5] ? parseInt(fields[5]) || 300 : 300,
                ingredients: fields[6] ? parseIngredientsFromCSV(fields[6]) : [],
                instructions: fields[7] ? fields[7].split('|').map(s => s.trim()).filter(s => s) : [],
                cuisines: [],
                dishTypes: [],
                image: '/No Image.png',
                isUserCreated: true,
                recipeId: -Date.now() - Math.random()
              };
              
              day.meals.push(meal);
            }
          }
        }
        
        // Convert to array and set dates
        const finalDays = Array.from(importedDays.values()).map((day, index) => ({
          ...day,
          date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        
        // Load the meal plan data
        localStorage.setItem('mealPlan', JSON.stringify(finalDays));
        window.location.reload();
      }
    } catch (error) {
      console.error('Error importing meal plan:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to import meal plan');
    } finally {
      setImporting(false);
    }
  };
  
  const handleLoadSavedPlan = async () => {
    if (!selectedSavedPlan) {
      setImportError('Please select a saved meal plan');
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      const mealPlanData = await loadMealPlan(selectedSavedPlan);
      if (mealPlanData) {
        // Store the loaded meal plan in localStorage to replace current plan
        localStorage.setItem('mealPlan', JSON.stringify(mealPlanData));
        setShowImportModal(false);
        setImportData('');
        setSelectedSavedPlan('');
        window.location.reload();
      } else {
        throw new Error('Failed to load meal plan data');
      }
    } catch (error) {
      console.error('Error loading saved meal plan:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to load saved meal plan');
    } finally {
      setImporting(false);
    }
  };
  
  const parseIngredientsFromCSV = (ingredientsStr: string) => {
    if (!ingredientsStr) return [];
    
    return ingredientsStr.split(';').map(ing => {
      const trimmed = ing.trim();
      // Try to parse "amount unit name" format
      const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)\s*(.+)$/);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          unit: match[2] || '',
          name: match[3].trim()
        };
      } else {
        // Fallback: treat as ingredient name only
        return {
          amount: 1,
          unit: '',
          name: trimmed
        };
      }
    }).filter(ing => ing.name);
  };

  const handleExportCurrentPlan = () => {
    // Create CSV content
    const csvRows = [];
    
    // Add header
    csvRows.push('Day,Meal Type,Recipe Name,Prep Time (min),Servings,Calories,Ingredients,Instructions');
    
    // Add data rows
    days.forEach(day => {
      day.meals.forEach(meal => {
        const ingredients = meal.ingredients ? 
          meal.ingredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`.trim()).join('; ') : 
          '';
        const instructions = meal.instructions ? 
          meal.instructions.join(' | ') : 
          '';
        
        const row = [
          day.name,
          meal.type,
          `"${meal.name.replace(/"/g, '""')}"`, // Escape quotes in recipe names
          meal.readyInMinutes || '',
          meal.servings || '',
          meal.calories || '',
          `"${ingredients.replace(/"/g, '""')}"`, // Escape quotes in ingredients
          `"${instructions.replace(/"/g, '""')}"` // Escape quotes in instructions
        ];
        
        csvRows.push(row.join(','));
      });
    });
    
    const csvContent = csvRows.join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal_plan_${new Date().toISOString().split('T')[0]}.csv`;
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
            title="Import CSV or load saved meal plan"
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
          onRemoveRecipe={removeRecipe}
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
                  Import or Load Meal Plan
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Import Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="csv"
                        checked={importType === 'csv'}
                        onChange={(e) => setImportType(e.target.value as 'csv' | 'saved')}
                        className="mr-2"
                      />
                      Import CSV File
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="saved"
                        checked={importType === 'saved'}
                        onChange={(e) => setImportType(e.target.value as 'csv' | 'saved')}
                        className="mr-2"
                      />
                      Load Saved Plan
                    </label>
                  </div>
                </div>

                {importType === 'csv' ? (
                <div>
                  <label htmlFor="import-data" className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Data
                  </label>
                  <textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="Paste your CSV data here or copy from a spreadsheet..."
                  />
                </div>
                ) : (
                  <div>
                    <label htmlFor="saved-plan" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Saved Meal Plan
                    </label>
                    <select
                      id="saved-plan"
                      value={selectedSavedPlan}
                      onChange={(e) => setSelectedSavedPlan(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Choose a saved meal plan...</option>
                      {savedMealPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {new Date(plan.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    {savedMealPlans.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        No saved meal plans found. Save a meal plan first to load it here.
                      </p>
                    )}
                  </div>
                )}

                {importError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                )}

                {importType === 'csv' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">⚠️ Warning:</h4>
                  <p className="text-sm text-amber-700">
                      Importing will replace your current weekly plan. Export your current plan first if you want to keep it.
                  </p>
                </div>
                )}

                {importType === 'csv' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">How to import:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Export a meal plan as CSV from Weekly Diet Planner App</li>
                      <li>2. Open the CSV file in a spreadsheet app or text editor</li>
                    <li>3. Paste it in the text area above</li>
                      <li>4. Click "Import CSV" to load it into your current week</li>
                      <li>5. CSV format: Day,Meal Type,Recipe Name,Prep Time,Servings,Calories,Ingredients,Instructions</li>
                  </ol>
                </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Load Saved Plan:</h4>
                    <p className="text-sm text-green-700">
                      Select one of your previously saved meal plans to load it into your current week. 
                      This will replace your current meal plan.
                    </p>
                  </div>
                )}
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
                  onClick={importType === 'csv' ? handleImportMealPlan : handleLoadSavedPlan}
                  disabled={
                    importing || 
                    (importType === 'csv' && !importData.trim()) ||
                    (importType === 'saved' && !selectedSavedPlan)
                  }
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {importType === 'csv' ? 'Importing...' : 'Loading...'}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {importType === 'csv' ? 'Import CSV' : 'Load Plan'}
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