import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Users, Utensils, Trash2, ExternalLink, Crown, AlertTriangle } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion } from 'framer-motion';

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites, loading, favoritesRemaining } = useFavorites();
  const { currentTier, limits } = useSubscription();

  const handleRemoveFavorite = async (recipeId: number) => {
    try {
      await removeFromFavorites(recipeId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
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
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Planner
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center justify-center">
            <Heart className="w-6 h-6 mr-2 text-red-500 fill-current" />
            Favorite Recipes
          </h1>
          {/* Usage indicator for non-unlimited plans */}
          {limits.maxFavoriteRecipes !== -1 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              {currentTier === 'free' && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm text-gray-600">
                {favorites.length}/{limits.maxFavoriteRecipes} favorites used
              </span>
              {favoritesRemaining === 0 && (
                <span className="text-xs text-amber-600 font-medium">
                  (Limit reached)
                </span>
              )}
            </div>
          )}
        </div>
        <div></div>
      </div>

      {/* Upgrade prompt when near or at limit */}
      {currentTier !== 'premium' && favoritesRemaining <= 2 && favoritesRemaining >= 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            {favoritesRemaining === 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">
                {favoritesRemaining === 0 
                  ? 'Favorites Limit Reached' 
                  : `Only ${favoritesRemaining} favorite${favoritesRemaining === 1 ? '' : 's'} remaining`
                }
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {favoritesRemaining === 0 
                  ? 'Upgrade your plan to save more favorite recipes.'
                  : 'Upgrade to Standard or Premium for more favorites.'
                }
              </p>
            </div>
            <button
              onClick={() => {/* TODO: Open upgrade modal */}}
              className="btn-primary text-sm"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">No Favorite Recipes Yet</h2>
          <div className="text-gray-500 mb-6">
            <p>Start adding recipes to your favorites by clicking the heart icon on recipe details pages.</p>
            {limits.maxFavoriteRecipes !== -1 && (
              <p className="text-sm mt-2">
                You can save up to {limits.maxFavoriteRecipes} favorites on your {currentTier} plan.
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Browse Recipes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite, index) => (
            <motion.div
              key={favorite.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <img
                  src={favorite.recipe_image || '/api/placeholder/300/200'}
                  alt={favorite.recipe_title}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => handleRecipeClick(favorite.recipe_id)}
                />
                <button
                  onClick={() => handleRemoveFavorite(favorite.recipe_id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 
                  className="font-medium text-gray-800 text-lg mb-3 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
                  onClick={() => handleRecipeClick(favorite.recipe_id)}
                >
                  {favorite.recipe_title}
                </h3>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{favorite.recipe_data.readyInMinutes} min</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{favorite.recipe_data.servings} serv</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Utensils className="w-4 h-4 mr-1" />
                    <span>{favorite.recipe_data.calories} cal</span>
                  </div>
                </div>

                {favorite.recipe_data.cuisines && favorite.recipe_data.cuisines.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
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

                <div className="mt-4">
                  <button
                    onClick={() => handleRecipeClick(favorite.recipe_id)}
                    className="w-full btn-primary text-sm py-2"
                  >
                    View Recipe
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;