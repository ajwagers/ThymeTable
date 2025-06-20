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

// Helper function to check if a recipe is appropriate for the meal type
const isAppropriateForMealType = (recipe: any, mealType: string, category: 'main' | 'side'): boolean => {
  const title = recipe.title.toLowerCase();
  const dishTypes = (recipe.dishTypes || []).map((type: string) => type.toLowerCase());
  
  // Define inappropriate dish types for each meal
  const inappropriateDishTypes = {
    breakfast: {
      main: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'mousse', 'sorbet', 'gelato'],
      side: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'mousse', 'sorbet', 'gelato']
    },
    lunch: {
      main: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'mousse', 'sorbet', 'gelato'],
      side: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'mousse', 'sorbet', 'gelato']
    },
    dinner: {
      main: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'mousse', 'sorbet', 'gelato'],
      side: ['dessert', 'cake', 'cookies', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'mousse', 'sorbet', 'gelato']
    }
  };

  // Define appropriate dish types for each meal
  const appropriateDishTypes = {
    breakfast: {
      main: ['breakfast', 'brunch', 'morning meal', 'pancakes', 'waffles', 'french toast', 'omelette', 'scrambled eggs', 'cereal', 'oatmeal', 'smoothie', 'toast'],
      side: ['side dish', 'fruit', 'yogurt', 'juice', 'coffee', 'tea', 'muffin', 'bagel']
    },
    lunch: {
      main: ['lunch', 'main course', 'main dish', 'entree', 'sandwich', 'salad', 'soup', 'pasta', 'rice dish', 'stir fry', 'burger', 'wrap'],
      side: ['side dish', 'appetizer', 'bread', 'rolls', 'vegetables', 'fruit', 'chips', 'fries']
    },
    dinner: {
      main: ['dinner', 'main course', 'main dish', 'entree', 'roast', 'grilled', 'baked', 'pasta', 'rice dish', 'stir fry', 'casserole', 'stew'],
      side: ['side dish', 'appetizer', 'bread', 'rolls', 'vegetables', 'salad', 'rice', 'potatoes']
    }
  };

  // Define inappropriate keywords in recipe titles
  const inappropriateKeywords = {
    breakfast: {
      main: ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'chocolate chip', 'frosting', 'icing'],
      side: ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart', 'pudding']
    },
    lunch: {
      main: ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'chocolate chip', 'frosting', 'icing'],
      side: ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart', 'pudding']
    },
    dinner: {
      main: ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart', 'pudding', 'chocolate chip', 'frosting', 'icing'],
      side: ['dessert', 'cake', 'cookie', 'candy', 'ice cream', 'pie', 'tart', 'pudding']
    }
  };

  const mealTypeKey = mealType as keyof typeof inappropriateDishTypes;
  const categoryKey = category as keyof typeof inappropriateDishTypes[typeof mealTypeKey];

  // Check for inappropriate dish types
  const inappropriateTypes = inappropriateDishTypes[mealTypeKey]?.[categoryKey] || [];
  for (const inappropriateType of inappropriateTypes) {
    if (dishTypes.some(dishType => dishType.includes(inappropriateType))) {
      console.log(`🚫 MEAL TYPE FILTER: Rejected "${recipe.title}" - inappropriate dish type "${inappropriateType}" for ${mealType} ${category}`);
      return false;
    }
  }

  // Check for inappropriate keywords in title
  const inappropriateWords = inappropriateKeywords[mealTypeKey]?.[categoryKey] || [];
  for (const keyword of inappropriateWords) {
    if (title.includes(keyword)) {
      console.log(`🚫 MEAL TYPE FILTER: Rejected "${recipe.title}" - inappropriate keyword "${keyword}" for ${mealType} ${category}`);
      return false;
    }
  }

  // For main dishes, ensure they're substantial enough
  if (category === 'main') {
    const appropriateTypes = appropriateDishTypes[mealTypeKey]?.[categoryKey] || [];
    
    // Check if it has appropriate dish types OR appropriate keywords in title
    const hasAppropriateDishType = dishTypes.some(dishType => 
      appropriateTypes.some(appropriateType => dishType.includes(appropriateType))
    );
    
    const hasAppropriateKeyword = appropriateTypes.some(keyword => title.includes(keyword));
    
    // For main dishes, be more strict - require either appropriate dish type or keyword
    if (!hasAppropriateDishType && !hasAppropriateKeyword) {
      // Additional check for general main course indicators
      const mainCourseIndicators = ['protein', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'lamb', 'tofu', 'beans', 'lentils'];
      const hasProtein = mainCourseIndicators.some(indicator => title.includes(indicator));
      
      if (!hasProtein) {
        console.log(`🚫 MEAL TYPE FILTER: Rejected "${recipe.title}" - not substantial enough for ${mealType} main dish`);
        return false;
      }
    }
  }

  return true;
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

    // Enhanced tag selection based on meal type and category
    const tags = [];
    
    // Add meal-specific tags
    if (mealType === 'breakfast') {
      tags.push('breakfast');
      if (category === 'main') {
        tags.push('main course');
      } else {
        tags.push('side dish');
      }
    } else if (mealType === 'lunch') {
      tags.push('lunch');
      if (category === 'main') {
        tags.push('main course');
      } else {
        tags.push('side dish');
      }
    } else if (mealType === 'dinner') {
      tags.push('dinner');
      if (category === 'main') {
        tags.push('main course');
      } else {
        tags.push('side dish');
      }
    }

    const params: any = {
      apiKey: API_KEY,
      number: 50, // Get more recipes to filter through
      tags: tags.join(','),
      addRecipeInformation: true, // Get dish types for better filtering
    };

    // Add dietary parameters if provided
    if (dietaryParams) {
      console.log('🔍 Spoonacular API Request with dietary params:', dietaryParams);
      
      if (dietaryParams.intolerances) {
        params.intolerances = dietaryParams.intolerances;
      }
      
      if (dietaryParams.excludeIngredients) {
        params.excludeIngredients = dietaryParams.excludeIngredients;
      }
      
      if (dietaryParams.diet) {
        params.diet = dietaryParams.diet;
      }
    }

    console.log('🌐 Final Spoonacular API params:', params);

    const response = await axios.get(`${BASE_URL}/random`, {
      params,
      timeout: 20000,
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
    
    // STEP 1: Filter by meal type appropriateness
    const originalCount = recipes.length;
    recipes = recipes.filter((recipe: SpoonacularRecipe) => 
      isAppropriateForMealType(recipe, mealType, category)
    );
    console.log(`🍽️ Meal type filtering: ${originalCount} → ${recipes.length} recipes after meal appropriateness check`);
    
    // STEP 2: Apply dietary restrictions if provided
    if (isRecipeAllowedFn) {
      const beforeDietaryCount = recipes.length;
      recipes = recipes.filter((recipe: SpoonacularRecipe) => {
        const titleWords = recipe.title.toLowerCase().split(/[\s,&-]+/);
        return isRecipeAllowedFn(recipe.title, titleWords);
      });
      
      console.log(`🔍 Dietary filtering: ${beforeDietaryCount} → ${recipes.length} recipes after dietary restrictions`);
    }
    
    // STEP 3: Additional safety check for specific forbidden ingredients in titles
    if (dietaryParams?.excludeIngredients) {
      const excludeList = dietaryParams.excludeIngredients.toLowerCase().split(',').map(item => item.trim());
      const beforeTitleCount = recipes.length;
      
      recipes = recipes.filter((recipe: SpoonacularRecipe) => {
        const titleLower = recipe.title.toLowerCase();
        
        for (const excluded of excludeList) {
          const regex = new RegExp(`\\b${excluded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(titleLower)) {
            console.log(`🚫 TITLE FILTER: Rejected "${recipe.title}" for containing "${excluded}"`);
            return false;
          }
        }
        return true;
      });
      
      console.log(`🔍 Title-based filtering: ${beforeTitleCount} → ${recipes.length} recipes after title screening`);
    }

    if (recipes.length === 0) {
      console.warn(`⚠️ No suitable ${category} ${mealType} recipes found after all filtering. Consider broadening search criteria.`);
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