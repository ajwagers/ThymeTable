import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Globe, Loader2, AlertCircle, Edit3, Check, RefreshCw, Zap, Crown, Lock } from 'lucide-react';
import { SpoonacularRecipe, Ingredient } from '../types';
import { useFeatureAccess } from '../contexts/SubscriptionContext';
import { parseRecipeFromUrl, parseRecipeFromUrlFallback, validateImportedRecipe } from '../services/recipeParser';

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: SpoonacularRecipe) => Promise<void>;
  mealType?: string;
  category?: 'main' | 'side';
}

export function ImportRecipeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  mealType = 'dinner', 
  category = 'main' 
}: ImportRecipeModalProps) {
  const { currentTier } = useFeatureAccess();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<SpoonacularRecipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [parsingMethod, setParsingMethod] = useState<string>('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Editable recipe fields
  const [editedRecipe, setEditedRecipe] = useState<SpoonacularRecipe | null>(null);

  const resetModal = () => {
    setUrl('');
    setImportError('');
    setImportedRecipe(null);
    setEditedRecipe(null);
    setIsEditing(false);
    setUsedFallback(false);
    setParsingMethod('');
  };

  const handleImport = async (useFallback = false, forceBasic = false) => {
    if (!url.trim()) {
      setImportError('Please enter a valid URL');
      return;
    }

    // Check if user is trying to use enhanced parser but doesn't have access
    if (!useFallback && !forceBasic && currentTier === 'free') {
      setShowUpgradePrompt(true);
      return;
    }

    setIsImporting(true);
    setImportError('');
    setUsedFallback(false);
    setParsingMethod('');

    try {
      let recipe: SpoonacularRecipe;
      
      if (useFallback || forceBasic || currentTier === 'free') {
        console.log('🔄 Using fallback parser...');
        recipe = await parseRecipeFromUrlFallback(url.trim());
        setUsedFallback(true);
        setParsingMethod('client-side-fallback');
      } else {
        try {
          recipe = await parseRecipeFromUrl(url.trim());
          // The parsing method is logged in the service, we can extract it from console or response
          setParsingMethod('server-side-enhanced');
        } catch (error) {
          console.warn('Primary parser failed, trying fallback:', error);
          recipe = await parseRecipeFromUrlFallback(url.trim());
          setUsedFallback(true);
          setParsingMethod('client-side-fallback');
        }
      }
      
      setImportedRecipe(recipe);
      setEditedRecipe({ ...recipe });
      setIsEditing(false);
    } catch (error) {
      console.error('Import error:', error);
      setImportError(error instanceof Error ? error.message : 'Failed to import recipe');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async () => {
    if (!editedRecipe) return;

    const validation = validateImportedRecipe(editedRecipe);
    if (!validation.isValid) {
      setImportError(`Please fix the following errors:\n${validation.errors.join('\n')}`);
      return;
    }

    // Ensure we have a placeholder image if none exists
    const recipeWithImage = {
      ...editedRecipe,
      image: editedRecipe.image || '/No Image.png'
    };
    setSaving(true);
    try {
      await onSave(recipeWithImage);
      resetModal();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setImportError('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!isImporting && !saving) {
      resetModal();
      onClose();
    }
  };

  const handleEditRecipe = () => {
    setIsEditing(true);
    setImportError('');
  };

  const updateEditedRecipe = (updates: Partial<SpoonacularRecipe>) => {
    if (editedRecipe) {
      setEditedRecipe({ ...editedRecipe, ...updates });
    }
  };

  const addIngredient = () => {
    if (editedRecipe) {
      const newIngredient: Ingredient = { name: '', amount: 1, unit: '' };
      updateEditedRecipe({
        ingredients: [...editedRecipe.ingredients, newIngredient]
      });
    }
  };

  const updateIngredient = (index: number, ingredient: Ingredient) => {
    if (editedRecipe) {
      const newIngredients = [...editedRecipe.ingredients];
      newIngredients[index] = ingredient;
      updateEditedRecipe({ ingredients: newIngredients });
    }
  };

  const removeIngredient = (index: number) => {
    if (editedRecipe) {
      const newIngredients = editedRecipe.ingredients.filter((_, i) => i !== index);
      updateEditedRecipe({ ingredients: newIngredients });
    }
  };

  const addInstruction = () => {
    if (editedRecipe) {
      updateEditedRecipe({
        instructions: [...editedRecipe.instructions, '']
      });
    }
  };

  const updateInstruction = (index: number, instruction: string) => {
    if (editedRecipe) {
      const newInstructions = [...editedRecipe.instructions];
      newInstructions[index] = instruction;
      updateEditedRecipe({ instructions: newInstructions });
    }
  };

  const removeInstruction = (index: number) => {
    if (editedRecipe && editedRecipe.instructions.length > 1) {
      const newInstructions = editedRecipe.instructions.filter((_, i) => i !== index);
      updateEditedRecipe({ instructions: newInstructions });
    }
  };

  const getMealTypeColor = () => {
    switch (mealType) {
      case 'breakfast': return 'bg-lemon text-gray-800';
      case 'lunch': return 'bg-terra-400 text-white';
      case 'dinner': return 'bg-primary-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLoadingColor = () => {
    switch (mealType) {
      case 'breakfast': return 'text-lemon';
      case 'lunch': return 'text-terra-500';
      case 'dinner': return 'text-primary-500';
      default: return 'text-gray-500';
    }
  };

  const getMethodBadge = () => {
    if (parsingMethod === 'server-side-enhanced') {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Zap className="w-3 h-3" />
          Enhanced Python Parser
        </div>
      );
    } else if (parsingMethod === 'client-side-fallback') {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
          <RefreshCw className="w-3 h-3" />
          Fallback Parser
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMealTypeColor()}`}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)} {category}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Import Recipe from URL</h2>
                {getMethodBadge()}
              </div>
              <button 
                onClick={handleClose}
                disabled={isImporting || saving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              {!importedRecipe ? (
                /* URL Input Section */
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                      <Globe className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Import Recipe from Website</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-4">
                      Enter the URL of a recipe from any cooking website. We'll automatically extract the recipe information using our enhanced Python-powered parser.
                    </p>
                    
                    {/* Enhanced Features Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">
                        {currentTier === 'free' ? 'Basic Parser Available' : 'Enhanced with Python recipe_scrapers'}
                      </span>
                      <span className="text-green-600">
                        {currentTier === 'free' ? '• Limited compatibility' : '• 500+ supported sites'}
                      </span>
                      {currentTier === 'free' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  <div className="max-w-md mx-auto space-y-4">
                    <div>
                      <label htmlFor="recipe-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Recipe URL
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id="recipe-url"
                            type="url"
                            placeholder="https://example.com/recipe"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isImporting && handleImport()}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            disabled={isImporting}
                          />
                        </div>
                        
                        {/* Import Button - Different behavior based on tier */}
                        {currentTier === 'free' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleImport(false, true)}
                              disabled={!url.trim() || isImporting}
                              className="btn-secondary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isImporting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                'Basic Import'
                              )}
                            </button>
                            <button
                              onClick={() => handleImport()}
                              disabled={!url.trim() || isImporting}
                              className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed relative"
                              title="Upgrade to Standard for enhanced parsing"
                            >
                              <Crown className="w-4 h-4 mr-1" />
                              Enhanced
                              <Lock className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleImport()}
                            disabled={!url.trim() || isImporting}
                            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isImporting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              'Import'
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isImporting && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-4"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block mb-3"
                        >
                          <Loader2 className={`w-8 h-8 ${getLoadingColor()}`} />
                        </motion.div>
                        <p className="text-gray-600 font-medium">Importing recipe...</p>
                        <p className="text-sm text-gray-500 mt-1">Using enhanced Python parser for best results</p>
                      </motion.div>
                    )}

                    {importError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800">Import Failed</h4>
                            <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{importError}</p>
                            {!usedFallback && (
                              <button
                                onClick={() => handleImport(true, true)}
                                disabled={isImporting}
                                className="mt-3 btn-secondary text-sm"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Basic Parser
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">
                        <strong>Supported sites include:</strong> 
                        {currentTier === 'free' 
                          ? ' Basic parsing for most recipe sites with structured data'
                          : ' AllRecipes, Food Network, Bon Appétit, Serious Eats, NYT Cooking, BBC Good Food, and 500+ more recipe sites'
                        }
                      </p>
                      <p className="text-xs text-gray-400">
                        {currentTier === 'free'
                          ? 'Upgrade to Standard or Premium for enhanced parsing with Python recipe_scrapers library'
                          : 'Our enhanced parser uses the Python recipe_scrapers library for maximum compatibility and accuracy'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Recipe Preview/Edit Section */
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isEditing ? 'Edit Recipe' : 'Review Imported Recipe'}
                      </h3>
                      {usedFallback && (
                        <p className="text-sm text-amber-600 mt-1">
                          ⚠️ Used basic parser - please review and edit as needed
                        </p>
                      )}
                      {parsingMethod === 'server-side-enhanced' && (
                        <p className="text-sm text-green-600 mt-1">
                          ✅ Imported using enhanced Python parser for maximum accuracy
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <button
                          onClick={handleEditRecipe}
                          className="btn-secondary"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Recipe
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn-secondary"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Done Editing
                        </button>
                      )}
                    </div>
                  </div>

                  {editedRecipe && (
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Recipe Title
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedRecipe.title}
                                onChange={(e) => updateEditedRecipe({ title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              />
                            ) : (
                              <p className="text-gray-900 font-medium">{editedRecipe.title}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prep Time (min)
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editedRecipe.readyInMinutes}
                                  onChange={(e) => updateEditedRecipe({ readyInMinutes: parseInt(e.target.value) || 30 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                  min="1"
                                />
                              ) : (
                                <p className="text-gray-900">{editedRecipe.readyInMinutes} min</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Servings
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editedRecipe.servings}
                                  onChange={(e) => updateEditedRecipe({ servings: parseInt(e.target.value) || 4 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                  min="1"
                                />
                              ) : (
                                <p className="text-gray-900">{editedRecipe.servings}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Calories
                              </label>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editedRecipe.calories}
                                  onChange={(e) => updateEditedRecipe({ calories: parseInt(e.target.value) || 300 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                  min="0"
                                />
                              ) : (
                                <p className="text-gray-900">{editedRecipe.calories} cal</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {editedRecipe.image && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Recipe Image
                            </label>
                            <img
                              src={editedRecipe.image}
                              alt={editedRecipe.title}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Ingredients */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            Ingredients ({editedRecipe.ingredients.length})
                          </h4>
                          {isEditing && (
                            <button
                              onClick={addIngredient}
                              className="btn-secondary text-sm"
                            >
                              Add Ingredient
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {editedRecipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {isEditing ? (
                                <>
                                  <input
                                    type="number"
                                    value={ingredient.amount}
                                    onChange={(e) => updateIngredient(index, { ...ingredient, amount: parseFloat(e.target.value) || 1 })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    step="0.1"
                                    min="0"
                                  />
                                  <input
                                    type="text"
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(index, { ...ingredient, unit: e.target.value })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="unit"
                                  />
                                  <input
                                    type="text"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(index, { ...ingredient, name: e.target.value })}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="ingredient name"
                                  />
                                  <button
                                    onClick={() => removeIngredient(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      {editedRecipe.instructions.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              Instructions ({editedRecipe.instructions.length})
                            </h4>
                            {isEditing && (
                              <button
                                onClick={addInstruction}
                                className="btn-secondary text-sm"
                              >
                                Add Step
                              </button>
                            )}
                          </div>
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {editedRecipe.instructions.map((instruction, index) => (
                              <div key={index} className="flex gap-3">
                                <span className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex-shrink-0">
                                  {index + 1}
                                </span>
                                {isEditing ? (
                                  <div className="flex-1 flex gap-2">
                                    <textarea
                                      value={instruction}
                                      onChange={(e) => updateInstruction(index, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                                      rows={2}
                                    />
                                    {editedRecipe.instructions.length > 1 && (
                                      <button
                                        onClick={() => removeInstruction(index)}
                                        className="text-red-500 hover:text-red-700 p-2 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700 flex-1">{instruction}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {importError && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-red-800">Validation Error</h4>
                              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{importError}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between">
              <button
                onClick={() => {
                  if (importedRecipe) {
                    setImportedRecipe(null);
                    setEditedRecipe(null);
                    setIsEditing(false);
                    setImportError('');
                    setUsedFallback(false);
                    setParsingMethod('');
                  } else {
                    handleClose();
                  }
                }}
                disabled={isImporting || saving}
                className="btn-secondary disabled:opacity-50"
              >
                {importedRecipe ? 'Back' : 'Cancel'}
              </button>

              {importedRecipe && (
                <button
                  onClick={handleSave}
                  disabled={saving || !editedRecipe}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Recipe'}
                </button>
              )}
            </div>
          </motion.div>
          
          {/* Upgrade Prompt Modal */}
          <AnimatePresence>
            {showUpgradePrompt && (
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 m-4"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Unlock Enhanced Recipe Import
                    </h3>
                    <p className="text-gray-600">
                      Get access to our Python-powered parser that supports 500+ recipe sites with maximum accuracy and reliability.
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Standard Plan - $4.99/month</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Enhanced Python recipe parser</li>
                        <li>• 500+ supported recipe sites</li>
                        <li>• Advanced dietary filters</li>
                        <li>• 15 saved meal plans</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowUpgradePrompt(false);
                        handleImport(false, true);
                      }}
                      className="flex-1 btn-secondary"
                    >
                      Use Basic Parser
                    </button>
                    <button
                      onClick={() => setShowUpgradePrompt(false)}
                      className="flex-1 btn-primary"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}