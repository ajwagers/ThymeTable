import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shuffle, Heart, Clock, Users, Utensils, Search } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { FavoriteRecipe } from '../types';

interface ChangeRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  category: 'main' | 'side';
  onSelectRandom: () => void;
  onSelectFavorite: (favoriteRecipeId: number) => void;
}

function ChangeRecipeModal({ 
  isOpen, 
  onClose, 
  mealType, 
  category, 
  onSelectRandom, 
  onSelectFavorite 
}: ChangeRecipeModalProps) {
  const { favorites } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');

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

  const getMealTypeColor = () => {
    switch (mealType) {
      case 'breakfast': return 'bg-lemon text-gray-800';
      case 'lunch': return 'bg-terra-400 text-white';
      case 'dinner': return 'bg-primary-500 text-white';
      default: return 'bg-gray-500 text-white';
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
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
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
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Random Recipe Option */}
              <div className="mb-6">
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
              </div>

              {/* Favorites Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
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
                        <p className="text-xs mt-1">Try the random recipe option above.</p>
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
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-secondary"
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