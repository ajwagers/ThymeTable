import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shuffle, Heart, Clock, Users, Utensils, Search, Loader2, ChevronDown, Filter } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useDietary } from '../contexts/DietaryContext';
import { searchRecipes } from '../services/spoonacular';
import { FavoriteRecipe, SpoonacularRecipe } from '../types';

interface ChangeRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  category: 'main' | 'side';
  onSelectRandom: () => void;
  onSelectFavorite: (favoriteRecipeId: number) => void;
  onSelectSearchResult: (recipe: SpoonacularRecipe) => void;
  isLoading?: boolean;
}

function ChangeRecipeModal({ 
  isOpen, 
  onClose, 
  mealType, 
  category, 
  onSelectRandom, 
  onSelectFavorite,
  onSelectSearchResult,
  isLoading = false
}: ChangeRecipeModalProps) {
  const { favorites } = useFavorites();
  const { getSpoonacularParams, getAllForbiddenIngredients, isRecipeAllowed } = useDietary();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'random' | 'search' | 'favorites'>('random');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpoonacularRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter state
  const [selectedMealType, setSelectedMealType] = useState(mealType);
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [newIncludeIngredient, setNewIncludeIngredient] = useState('');
  const [newExcludeIngredient, setNewExcludeIngredient] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Initialize search filters when modal opens or tab changes
  React.useEffect(() => {
    if (isOpen && activeTab === 'search') {
      const forbiddenIngredients = getAllForbiddenIngredients();
      setExcludeIngredients(forbiddenIngredients);
      setSelectedMealType(mealType);
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setIncludeIngredients([]);
      setNewIncludeIngredient('');
      setNewExcludeIngredient('');
    }
  }, [isOpen, activeTab, mealType, getAllForbiddenIngredients]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const dietaryParams = getSpoonacularParams();
      
      // Combine dietary restrictions with user-added exclusions
      const allExcludeIngredients = [
        ...excludeIngredients,
        ...(dietaryParams.excludeIngredients ? dietaryParams.excludeIngredients.split(',') : [])
      ];

      const searchParams = {
        query: searchQuery.trim(),
        type: selectedMealType,
        includeIngredients: includeIngredients.join(','),
        excludeIngredients: [...new Set(allExcludeIngredients)].join(','),
        diet: dietaryParams.diet,
        intolerances: dietaryParams.intolerances,
        number: 20
      };

      console.log('🔍 Searching with params:', searchParams);

      const results = await searchRecipes(searchParams, isRecipeAllowed);
      
      // Additional client-side filtering for meal type appropriateness
      const filteredResults = results.filter(recipe => {
        return isAppropriateForMealType(recipe, selectedMealType, category);
      });

      setSearchResults(filteredResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to check meal type appropriateness
  const isAppropriateForMealType = (recipe: SpoonacularRecipe, mealType: string, category: 'main' | 'side'): boolean => {
    const title = recipe.title.toLowerCase();
    const dishTypes = (recipe.dishTypes || []).map((type: string) => type.toLowerCase());
    
    // Define inappropriate dish types for each meal
    const inappropriateDishTypes = {
      breakfast: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart'],
      lunch: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart'],
      dinner: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart']
    };

    const mealTypeKey = mealType as keyof typeof inappropriateDishTypes;
    const inappropriateTypes = inappropriateDishTypes[mealTypeKey] || [];
    
    // Check for inappropriate dish types
    for (const inappropriateType of inappropriateTypes) {
      if (dishTypes.some(dishType => dishType.includes(inappropriateType))) {
        return false;
      }
    }

    // Check for inappropriate keywords in title
    const inappropriateKeywords = ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart'];
    for (const keyword of inappropriateKeywords) {
      if (title.includes(keyword)) {
        return false;
      }
    }

    return true;
  };

  const handleAddIncludeIngredient = () => {
    if (newIncludeIngredient.trim() && !includeIngredients.includes(newIncludeIngredient.trim())) {
      setIncludeIngredients([...includeIngredients, newIncludeIngredient.trim()]);
      setNewIncludeIngredient('');
    }
  };

  const handleAddExcludeIngredient = () => {
    if (newExcludeIngredient.trim() && !excludeIngredients.includes(newExcludeIngredient.trim())) {
      setExcludeIngredients([...excludeIngredients, newExcludeIngredient.trim()]);
      setNewExcludeIngredient('');
    }
  };

  const handleRemoveIncludeIngredient = (ingredient: string) => {
    setIncludeIngredients(includeIngredients.filter(i => i !== ingredient));
  };

  const handleRemoveExcludeIngredient = (ingredient: string) => {
    setExcludeIngredients(excludeIngredients.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  // Filter favorites that might be appropriate for the meal type
  const getRelevantFavorites = (): FavoriteRecipe[] => {
    return favorites.filter(fav => {
      const dishTypes = fav.recipe_data.dishTypes || [];
      const title = fav.recipe_data.title.toLowerCase();
      const searchMatch = searchTerm === '' || title.includes(searchTerm.toLowerCase());
      
      if (!searchMatch) return false;

      // For breakfast
      if (mealType === 'breakfast') {
        return dishTypes.some(type => type.toLowerCase().includes('breakfast')) || 
               title.includes('breakfast') || 
               title.includes('pancake') || 
               title.includes('waffle') ||
               title.includes('omelette') ||
               title.includes('toast') ||
               title.includes('cereal') ||
               title.includes('smoothie') ||
               category === 'side'; // Allow all sides for breakfast
      }
      
      // For lunch
      if (mealType === 'lunch') {
        return dishTypes.some(type => 
          type.toLowerCase().includes('lunch') ||
          type.toLowerCase().includes('salad') ||
          type.toLowerCase().includes('sandwich') ||
          type.toLowerCase().includes('soup')
        ) || 
        title.includes('lunch') || 
        title.includes('sandwich') || 
        title.includes('salad') ||
        title.includes('wrap') ||
        title.includes('soup') ||
        category === 'side';
      }
      
      // For dinner
      if (mealType === 'dinner') {
        return dishTypes.some(type => 
          type.toLowerCase().includes('dinner') ||
          type.toLowerCase().includes('main course') ||
          type.toLowerCase().includes('entree')
        ) || 
        title.includes('dinner') ||
        title.includes('roast') ||
        title.includes('grilled') ||
        title.includes('baked') ||
        category === 'side';
      }
      
      return true; // Include all if no specific match
    });
  };

  const relevantFavorites = getRelevantFavorites();

  const handleSelectFavorite = (favoriteRecipeId: number) => {
    onSelectFavorite(favoriteRecipeId);
    onClose();
  };

  const handleSelectRandom = () => {
    onSelectRandom();
    onClose();
  };

  const handleSelectSearchResult = (recipe: SpoonacularRecipe) => {
    onSelectSearchResult(recipe);
    onClose();
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

  const getTabButtonClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-primary-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
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
                <h2 className="text-xl font-semibold text-gray-900">Change Recipe</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-4 border-b border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('random')}
                  className={getTabButtonClass('random')}
                  disabled={isLoading}
                >
                  <Shuffle className="w-4 h-4 mr-2 inline" />
                  Random
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={getTabButtonClass('search')}
                  disabled={isLoading}
                >
                  <Search className="w-4 h-4 mr-2 inline" />
                  Search
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={getTabButtonClass('favorites')}
                  disabled={isLoading}
                >
                  <Heart className="w-4 h-4 mr-2 inline" />
                  Favorites ({relevantFavorites.length})
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-160px)]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <Loader2 className={`w-12 h-12 ${getLoadingColor()}`} />
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Finding New Recipe</h3>
                  <p className="text-gray-600 text-center">
                    Searching for a {category} {mealType} recipe that matches your dietary preferences...
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Random Tab */}
                  {activeTab === 'random' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Generate New Recipe</h3>
                      <motion.button
                        onClick={handleSelectRandom}
                        className="w-full p-4 bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 hover:border-primary-300 rounded-lg transition-all duration-200 flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="p-3 bg-primary-500 rounded-lg">
                          <Shuffle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Get Random Recipe</h4>
                          <p className="text-sm text-gray-600">
                            Generate a new {mealType} {category} recipe that follows your dietary preferences
                          </p>
                        </div>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Search Tab */}
                  {activeTab === 'search' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Search Section */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Search for Recipes</h3>
                        
                        {/* Main Search Bar */}
                        <div className="flex gap-3 mb-4">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search for recipes... (e.g., 'chicken pasta', 'vegetarian soup')"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <button
                            onClick={handleSearch}
                            disabled={!searchQuery.trim() || isSearching}
                            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSearching ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Search className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Meal Type Selector */}
                        <div className="flex items-center gap-3 mb-4">
                          <label className="text-sm font-medium text-gray-700">Meal Type:</label>
                          <select
                            value={selectedMealType}
                            onChange={(e) => setSelectedMealType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                          </select>
                        </div>

                        {/* Advanced Filters Toggle */}
                        <button
                          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors mb-4"
                        >
                          <Filter className="w-4 h-4" />
                          Advanced Filters
                          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Advanced Filters */}
                        <AnimatePresence>
                          {showAdvancedFilters && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Include Ingredients */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Must Include Ingredients
                                  </label>
                                  <div className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      placeholder="e.g., chicken, tomatoes"
                                      value={newIncludeIngredient}
                                      onChange={(e) => setNewIncludeIngredient(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIncludeIngredient())}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleAddIncludeIngredient}
                                      className="btn-secondary px-3"
                                    >
                                      <Search className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                                    {includeIngredients.map((ingredient, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                      >
                                        {ingredient}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveIncludeIngredient(ingredient)}
                                          className="hover:text-green-900"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Exclude Ingredients */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exclude Ingredients
                                    <span className="text-xs text-gray-500 ml-1">
                                      (Pre-loaded from dietary filters)
                                    </span>
                                  </label>
                                  <div className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      placeholder="e.g., nuts, dairy"
                                      value={newExcludeIngredient}
                                      onChange={(e) => setNewExcludeIngredient(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExcludeIngredient())}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleAddExcludeIngredient}
                                      className="btn-secondary px-3"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                                    {excludeIngredients.slice(0, 8).map((ingredient, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                                      >
                                        {ingredient}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveExcludeIngredient(ingredient)}
                                          className="hover:text-red-900"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                    {excludeIngredients.length > 8 && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                        +{excludeIngredients.length - 8} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Search Results */}
                      <div>
                        {isSearching ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mb-4"
                            >
                              <Loader2 className={`w-8 h-8 ${getLoadingColor()}`} />
                            </motion.div>
                            <p className="text-gray-600 text-center">
                              Searching for {selectedMealType} recipes...
                            </p>
                          </div>
                        ) : hasSearched ? (
                          searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {searchResults.map((recipe, index) => (
                                <motion.button
                                  key={recipe.id}
                                  onClick={() => handleSelectSearchResult(recipe)}
                                  className="p-4 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg transition-all duration-200 text-left group"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-start gap-4">
                                    <img
                                      src={recipe.image || '/api/placeholder/80/80'}
                                      alt={recipe.title}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                                        {recipe.title}
                                      </h4>
                                      
                                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{recipe.readyInMinutes} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{recipe.servings} serv</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Utensils className="w-3 h-3" />
                                          <span>{recipe.calories} cal</span>
                                        </div>
                                      </div>

                                      {recipe.cuisines && recipe.cuisines.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {recipe.cuisines.slice(0, 2).map((cuisine, index) => (
                                            <span
                                              key={index}
                                              className="px-2 py-1 bg-terra-100 text-terra-700 rounded-full text-xs"
                                            >
                                              {cuisine}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">
                                No recipes found for "{searchQuery}". Try different search terms.
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">
                              Enter a search term above to find recipes.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Favorites Tab */}
                  {activeTab === 'favorites' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Choose from Favorites</h3>
                        <span className="text-sm text-gray-500">
                          {relevantFavorites.length} recipe{relevantFavorites.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {favorites.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No favorite recipes saved yet.</p>
                          <p className="text-sm">Add recipes to favorites to see them here.</p>
                        </div>
                      ) : (
                        <>
                          {/* Search Bar */}
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search your favorite recipes..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          {relevantFavorites.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                              <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {searchTerm ? 'No favorites match your search.' : `No favorites found for ${mealType} recipes.`}
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                              {relevantFavorites.map((favorite, index) => (
                                <motion.button
                                  key={favorite.id}
                                  onClick={() => handleSelectFavorite(favorite.recipe_id)}
                                  className="p-4 bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-lg transition-all duration-200 text-left group"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: index * 0.05 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-start gap-4">
                                    <img
                                      src={favorite.recipe_image || '/api/placeholder/80/80'}
                                      alt={favorite.recipe_title}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                                          {favorite.recipe_title}
                                        </h4>
                                        <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0 ml-2" />
                                      </div>
                                      
                                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{favorite.recipe_data.readyInMinutes} min</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          <span>{favorite.recipe_data.servings} serv</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Utensils className="w-3 h-3" />
                                          <span>{favorite.recipe_data.calories} cal</span>
                                        </div>
                                      </div>

                                      {favorite.recipe_data.cuisines && favorite.recipe_data.cuisines.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {favorite.recipe_data.cuisines.slice(0, 2).map((cuisine, index) => (
                                            <span
                                              key={index}
                                              className="px-2 py-1 bg-terra-100 text-terra-700 rounded-full text-xs"
                                            >
                                              {cuisine}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ChangeRecipeModal;