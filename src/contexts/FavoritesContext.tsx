import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { FavoriteRecipe, SavedMealPlan, SpoonacularRecipe, Day } from '../types';

interface FavoritesContextType {
  favorites: FavoriteRecipe[];
  savedMealPlans: SavedMealPlan[];
  loading: boolean;
  
  // Favorites methods
  addToFavorites: (recipe: SpoonacularRecipe) => Promise<void>;
  removeFromFavorites: (recipeId: number) => Promise<void>;
  isFavorite: (recipeId: number) => boolean;
  
  // Saved meal plans methods
  saveMealPlan: (name: string, description: string, mealPlanData: Day[]) => Promise<void>;
  loadMealPlan: (mealPlanId: string) => Promise<Day[] | null>;
  deleteMealPlan: (mealPlanId: string) => Promise<void>;
  updateMealPlan: (mealPlanId: string, name: string, description: string, mealPlanData: Day[]) => Promise<void>;
  
  // Utility methods
  refreshData: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user's favorites and saved meal plans
  const loadUserData = async () => {
    if (!user) {
      setFavorites([]);
      setSavedMealPlans([]);
      return;
    }

    setLoading(true);
    try {
      // Load favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorite_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error loading favorites:', favoritesError);
      } else {
        setFavorites(favoritesData || []);
      }

      // Load saved meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (mealPlansError) {
        console.error('Error loading saved meal plans:', mealPlansError);
      } else {
        setSavedMealPlans(mealPlansData || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [user]);

  // Add recipe to favorites
  const addToFavorites = async (recipe: SpoonacularRecipe) => {
    if (!user) {
      throw new Error('User must be logged in to add favorites');
    }

    try {
      const { data, error } = await supabase
        .from('favorite_recipes')
        .insert({
          user_id: user.id,
          recipe_id: recipe.id,
          recipe_title: recipe.title,
          recipe_image: recipe.image,
          recipe_data: recipe
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setFavorites(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  // Remove recipe from favorites
  const removeFromFavorites = async (recipeId: number) => {
    if (!user) {
      throw new Error('User must be logged in to remove favorites');
    }

    try {
      const { error } = await supabase
        .from('favorite_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) {
        throw error;
      }

      setFavorites(prev => prev.filter(fav => fav.recipe_id !== recipeId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  // Check if recipe is favorited
  const isFavorite = (recipeId: number): boolean => {
    return favorites.some(fav => fav.recipe_id === recipeId);
  };

  // Save meal plan
  const saveMealPlan = async (name: string, description: string, mealPlanData: Day[]) => {
    if (!user) {
      throw new Error('User must be logged in to save meal plans');
    }

    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .insert({
          user_id: user.id,
          name,
          description,
          meal_plan_data: mealPlanData
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSavedMealPlans(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  };

  // Load meal plan
  const loadMealPlan = async (mealPlanId: string): Promise<Day[] | null> => {
    if (!user) {
      throw new Error('User must be logged in to load meal plans');
    }

    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('meal_plan_data')
        .eq('id', mealPlanId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data?.meal_plan_data || null;
    } catch (error) {
      console.error('Error loading meal plan:', error);
      throw error;
    }
  };

  // Delete meal plan
  const deleteMealPlan = async (mealPlanId: string) => {
    if (!user) {
      throw new Error('User must be logged in to delete meal plans');
    }

    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', mealPlanId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setSavedMealPlans(prev => prev.filter(plan => plan.id !== mealPlanId));
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  };

  // Update meal plan
  const updateMealPlan = async (mealPlanId: string, name: string, description: string, mealPlanData: Day[]) => {
    if (!user) {
      throw new Error('User must be logged in to update meal plans');
    }

    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .update({
          name,
          description,
          meal_plan_data: mealPlanData
        })
        .eq('id', mealPlanId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSavedMealPlans(prev => 
        prev.map(plan => plan.id === mealPlanId ? data : plan)
      );
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  };

  // Refresh data
  const refreshData = async () => {
    await loadUserData();
  };

  // Save user recipe
  const saveUserRecipe = async (recipe: SpoonacularRecipe) => {
    if (!user) throw new Error('User must be logged in');

    const { data, error } = await supabase
      .from('user_recipes')
      .insert({
        id: recipe.id,
        user_id: user.id,
        recipe_data: recipe
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      savedMealPlans,
      loading,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      saveMealPlan,
      loadMealPlan,
      deleteMealPlan,
      updateMealPlan,
      refreshData,
      saveUserRecipe
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}