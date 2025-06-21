import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Clock, Users, Utensils, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useDietary } from '../contexts/DietaryContext';
import { searchRecipes } from '../services/spoonacular';
import { SpoonacularRecipe } from '../types';

interface SearchRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: SpoonacularRecipe) => void;
  mealType: string;
  category: 'main' | 'side';
}

function SearchRecipeModal({ 
  isOpen, 
  onClose, 
  mealType, 
  category, 
  onSelectRecipe 
}: SearchRecipeModalProps) {
  const { getSpoonacularParams, getAllForbiddenIngredients, isRecipeAllowed } = useDietary();
  
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

  // Pre-load dietary restrictions when modal opens
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, mealType, getAllForbiddenIngredients]);

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

  const handleSelectRecipe = (recipe: SpoonacularRecipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  const getMealTypeColor = () => {
    switch (selectedMealType) {
      case 'breakfast': return 'bg-lemon text-gray-800';
      case 'lunch': return 'bg-terra-400 text-white';
      case 'dinner': return 'bg-primary-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLoadingColor = () => {
    switch (selectedMealType) {
      case 'breakfast': return 'text-lemon';
      case 'lunch': return 'text-terra-500';
      case 'dinner': return 'text-primary-500';
      default: return 'text-gray-500';
    }
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
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMealTypeColor()}`}>
                  {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} {category}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Search Recipes</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col h-[calc(90vh-80px)]">
              {/* Search Section */}
              <div className="p-6 border-b border-gray-200">
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-lg"
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
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
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
                      className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
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
                          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                            {excludeIngredients.slice(0, 10).map((ingredient, index) => (
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
                            {excludeIngredients.length > 10 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                +{excludeIngredients.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Results Section */}
              <div className="flex-1 overflow-y-auto p-6">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mb-4"
                    >
                      <Loader2 className={`w-12 h-12 ${getLoadingColor()}`} />
                    </motion.div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Searching Recipes</h3>
                    <p className="text-gray-600 text-center">
                      Finding {selectedMealType} recipes that match your criteria...
                    </p>
                  </div>
                ) : hasSearched ? (
                  searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((recipe, index) => (
                        <motion.button
                          key={recipe.id}
                          onClick={() => handleSelectRecipe(recipe)}
                          className="p-4 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-lg transition-all duration-200 text-left group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex flex-col h-full">
                            <img
                              src={recipe.image || '/api/placeholder/300/200'}
                              alt={recipe.title}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors mb-2">
                              {recipe.title}
                            </h4>
                            
                            <div className="flex justify-between text-xs text-gray-500 mt-auto">
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
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No recipes found</h3>
                      <p className="text-sm">
                        Try adjusting your search terms or filters to find more recipes.
                      </p>
                      <p className="text-xs mt-2 text-gray-400">
                        Search: "{searchQuery}" • Meal: {selectedMealType} • Filters: {includeIngredients.length + excludeIngredients.length} active
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Search for Recipes</h3>
                    <p className="text-sm">
                      Enter a search term above to find recipes that match your dietary preferences.
                    </p>
                    <p className="text-xs mt-2 text-gray-400">
                      Your dietary filters are automatically applied to all search results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SearchRecipeModal;