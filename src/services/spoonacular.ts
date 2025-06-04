import axios from 'axios';
import { SpoonacularRecipe } from '../types';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

export const getRandomRecipes = async (mealType: string, category: 'main' | 'side' = 'main'): Promise<SpoonacularRecipe[]> => {
  try {
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
    console.error('Error fetching random recipes:', error);
    return [];
  }
};

export const getRecipeDetails = async (recipeId: number): Promise<SpoonacularRecipe | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/${recipeId}/information`, {
      params: {
        apiKey: API_KEY,
      },
    });

    const recipe = response.data;
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
      ingredients: recipe.extendedIngredients.map((ingredient: any) => ({
        name: ingredient.original,
        amount: ingredient.amount,
        unit: ingredient.unit,
      })),
    };
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
};