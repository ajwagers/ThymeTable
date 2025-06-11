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

export const getRandomRecipes = async (mealType: string, category: 'main' | 'side' = 'main'): Promise<SpoonacularRecipe[]> => {
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

    const response = await axios.get(`${BASE_URL}/random`, {
      params: {
        apiKey: API_KEY,
        number: 10,
        tags: tags.join(','),
      },
      timeout: 10000, // 10 second timeout
    });

    return response.data.recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      calories: Math.round(recipe.nutrition?.nutrients?.[0]?.amount || 0),
      image: recipe.image,
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
    }));
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