import axios, { AxiosError } from 'axios';
import { SpoonacularRecipe } from '../types';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

const handleSpoonacularError = (error: AxiosError) => {
  if (!API_KEY) {
    throw new Error('Spoonacular API key is missing. Please check your environment variables.');
  }

  if (error.response?.status === 402) {
    throw new Error('Spoonacular API quota exceeded. Please try again later.');
  }

  if (error.response?.status === 401) {
    throw new Error('Invalid Spoonacular API key. Please check your API key.');
  }

  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timed out. Please check your internet connection and try again.');
  }

  if (error.message === 'Network Error') {
    throw new Error('Network error occurred. Please check your internet connection and try again.');
  }

  throw new Error(`API Error: ${error.message}`);
};

export const getRandomRecipes = async (
  mealType: string, 
  category: 'main' | 'side' = 'main',
  dietaryParams?: {
    diet?: string;
    intolerances?: string;
    excludeIngredients?: string;
  },
  isRecipeAllowedFn?: (title: string, ingredients?: string[]) => boolean
): Promise<SpoonacularRecipe[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Spoonacular API key is missing');
    }

    const tags = [mealType];
    
    if (category === 'side') {
      tags.push('side dish');
    } else {
      tags.push('main course');
    }

    const params: any = {
      apiKey: API_KEY,
      number: 50, // Increased significantly to get more options for strict filtering
      tags: tags.join(','),
    };

    // Add dietary parameters if provided - WITH STRICT ENFORCEMENT
    if (dietaryParams) {
      console.log('🔍 Spoonacular API Request with dietary params:', dietaryParams);
      
      // CRITICAL: Intolerances are hard restrictions
      if (dietaryParams.intolerances) {
        params.intolerances = dietaryParams.intolerances;
      }
      
      // CRITICAL: Excluded ingredients are absolute restrictions
      if (dietaryParams.excludeIngredients) {
        params.excludeIngredients = dietaryParams.excludeIngredients;
      }
      
      // Diet is a preference, but exclusions override
      if (dietaryParams.diet) {
        params.diet = dietaryParams.diet;
      }
    }

    console.log('🌐 Final Spoonacular API params:', params);

    const response = await axios.get(`${BASE_URL}/random`, {
      params,
      timeout: 20000, // Increased timeout for more complex filtering
    });

    let recipes = response.data.recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      calories: Math.round(recipe.nutrition?.nutrients?.[0]?.amount || 0),
      image: recipe.image,
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
    }));

    console.log(`✅ Received ${recipes.length} recipes from Spoonacular for ${mealType} (${category})`);
    
    // ENHANCED CLIENT-SIDE FILTERING - ABSOLUTELY CRITICAL
    if (isRecipeAllowedFn) {
      const originalCount = recipes.length;
      recipes = recipes.filter((recipe: SpoonacularRecipe) => {
        // Extract potential ingredients from the recipe title for additional checking
        const titleWords = recipe.title.toLowerCase().split(/[\s,&-]+/);
        return isRecipeAllowedFn(recipe.title, titleWords);
      });
      
      console.log(`🔍 STRICT Client-side filtering: ${originalCount} → ${recipes.length} recipes after dietary restrictions`);
      
      if (recipes.length === 0) {
        console.warn('⚠️ All recipes were filtered out due to dietary restrictions. Consider broadening search criteria.');
      }
    }
    
    // Additional safety check for specific forbidden ingredients in titles
    if (dietaryParams?.excludeIngredients) {
      const excludeList = dietaryParams.excludeIngredients.toLowerCase().split(',').map(item => item.trim());
      const originalCount = recipes.length;
      
      recipes = recipes.filter((recipe: SpoonacularRecipe) => {
        const titleLower = recipe.title.toLowerCase();
        
        // Check each excluded ingredient against the recipe title
        for (const excluded of excludeList) {
          // Use word boundaries to avoid false positives
          const regex = new RegExp(`\\b${excluded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(titleLower)) {
            console.log(`🚫 TITLE FILTER: Rejected "${recipe.title}" for containing "${excluded}"`);
            return false;
          }
        }
        return true;
      });
      
      console.log(`🔍 Title-based filtering: ${originalCount} → ${recipes.length} recipes after title screening`);
    }

    return recipes;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      handleSpoonacularError(error);
    }
    throw new Error(`Failed to fetch random recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getRecipeDetails = async (recipeId: number): Promise<SpoonacularRecipe | null> => {
  try {
    if (!API_KEY) {
      throw new Error('Spoonacular API key is missing');
    }

    const response = await axios.get(`${BASE_URL}/${recipeId}/information`, {
      params: {
        apiKey: API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    const recipe = response.data;

    // Convert measurements when processing the ingredients
    const convertedIngredients = recipe.extendedIngredients.map((ingredient: any) => {
      // Convert the measurement first
      const amount = ingredient.amount;
      const unit = ingredient.unit;

      return {
        name: ingredient.original,
        amount,
        unit,
        originalAmount: amount,
        originalUnit: unit,
      };
    });

    return {
      id: recipe.id,
      title: recipe.title,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      calories: Math.round(recipe.nutrition?.nutrients?.[0]?.amount || 0),
      image: recipe.image,
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
      instructions: recipe.analyzedInstructions[0]?.steps.map((step: any) => step.step) || [],
      ingredients: convertedIngredients,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      handleSpoonacularError(error);
    }
    throw new Error(`Failed to fetch recipe details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};