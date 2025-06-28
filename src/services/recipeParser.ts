import { SpoonacularRecipe, Ingredient } from '../types';

export interface ParsedRecipeData {
  title: string;
  total_time_minutes: number;
  yields: string;
  ingredients: string[];
  instructions: string[];
  image_url: string;
  nutrients: {
    calories?: string;
    fatContent?: string;
    saturatedFatContent?: string;
    cholesterolContent?: string;
    sodiumContent?: string;
    carbohydrateContent?: string;
    fiberContent?: string;
    proteinContent?: string;
    sugarContent?: string;
  };
  canonical_url: string;
  host: string;
}

export async function parseRecipeFromUrl(url: string): Promise<SpoonacularRecipe> {
  try {
    console.log('🔄 Starting enhanced recipe parsing for:', url);
    
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-recipe-python`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Python parser API error:', response.status, errorText);
      throw new Error(`Failed to parse recipe: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Python parser result:', result);

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.data) {
      throw new Error('No recipe data returned from parser');
    }

    return convertPythonDataToSpoonacularFormat(result.data, url);
  } catch (error) {
    console.error('❌ Enhanced parsing failed:', error);
    throw error;
  }
}

export async function parseRecipeFromUrlFallback(url: string): Promise<SpoonacularRecipe> {
  try {
    console.log('🔄 Using fallback parser for:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to extract JSON-LD structured data
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    let recipeData = null;
    
    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.some(item => item['@type'] === 'Recipe'))) {
          recipeData = Array.isArray(data) ? data.find(item => item['@type'] === 'Recipe') : data;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!recipeData) {
      throw new Error('No structured recipe data found on this page');
    }
    
    return convertJsonLdToSpoonacularFormat(recipeData, url);
  } catch (error) {
    console.error('❌ Fallback parsing failed:', error);
    throw new Error('Unable to parse recipe from this URL. Please try entering the recipe manually or use a different recipe website.');
  }
}

function convertPythonDataToSpoonacularFormat(data: ParsedRecipeData, url: string): SpoonacularRecipe {
  console.log('🔄 Converting Python data to Spoonacular format:', data);
  
  // Parse servings from yields string (e.g., "8 servings" -> 8)
  const servings = parseServingsFromYields(data.yields);
  
  // Parse ingredients from string format to structured format
  const ingredients = parseIngredientsFromStrings(data.ingredients);
  
  // Extract calories from nutrients
  const calories = extractCaloriesFromNutrients(data.nutrients);
  
  // Generate a negative ID for imported recipes to distinguish from Spoonacular recipes
  const recipeId = -Date.now();
  
  const recipe: SpoonacularRecipe = {
    id: recipeId,
    title: data.title || 'Imported Recipe',
    readyInMinutes: data.total_time_minutes || 30,
    servings: servings,
    calories: calories,
    image: data.image_url || '/No Image.png',
    cuisines: [], // Python script doesn't provide cuisine info
    instructions: data.instructions || [],
    ingredients: ingredients,
    dishTypes: [], // Python script doesn't provide dish types
    isUserCreated: false, // This is imported, not user-created
    sourceUrl: url
  };
  
  console.log('✅ Converted recipe:', recipe);
  return recipe;
}

function convertJsonLdToSpoonacularFormat(data: any, url: string): SpoonacularRecipe {
  console.log('🔄 Converting JSON-LD data to Spoonacular format:', data);
  
  const servings = parseServingsFromYields(data.recipeYield || data.yield || '4');
  const ingredients = parseIngredientsFromStrings(data.recipeIngredient || []);
  const instructions = parseInstructionsFromJsonLd(data.recipeInstructions || []);
  const calories = extractCaloriesFromNutrition(data.nutrition);
  
  const recipeId = -Date.now();
  
  const recipe: SpoonacularRecipe = {
    id: recipeId,
    title: data.name || 'Imported Recipe',
    readyInMinutes: parseDurationToMinutes(data.totalTime || data.cookTime || data.prepTime) || 30,
    servings: servings,
    calories: calories,
    image: getImageUrl(data.image) || '/No Image.png',
    cuisines: data.recipeCuisine ? (Array.isArray(data.recipeCuisine) ? data.recipeCuisine : [data.recipeCuisine]) : [],
    instructions: instructions,
    ingredients: ingredients,
    dishTypes: data.recipeCategory ? (Array.isArray(data.recipeCategory) ? data.recipeCategory : [data.recipeCategory]) : [],
    isUserCreated: false,
    sourceUrl: url
  };
  
  console.log('✅ Converted recipe:', recipe);
  return recipe;
}

function parseServingsFromYields(yields: string | number): number {
  if (typeof yields === 'number') return yields;
  if (!yields) return 4;
  
  // Extract number from strings like "8 servings", "Makes 6", "4-6 people", etc.
  const match = yields.toString().match(/(\d+)/);
  return match ? parseInt(match[1]) : 4;
}

function parseIngredientsFromStrings(ingredientStrings: string[]): Ingredient[] {
  if (!Array.isArray(ingredientStrings)) return [];
  
  return ingredientStrings.map((ingredientStr, index) => {
    const parsed = parseIngredientString(ingredientStr);
    console.log(`Parsed ingredient ${index}:`, parsed);
    return parsed;
  });
}

function parseIngredientString(ingredientStr: string): Ingredient {
  if (!ingredientStr || typeof ingredientStr !== 'string') {
    return {
      name: 'Unknown ingredient',
      amount: 1,
      unit: ''
    };
  }
  
  // Clean the ingredient string
  const cleaned = ingredientStr.trim();
  
  // Try to extract amount, unit, and name using regex
  // Patterns to match: "2 cups flour", "1/2 teaspoon salt", "3 tablespoons olive oil", etc.
  const patterns = [
    // Pattern 1: Number + fraction + unit + ingredient (e.g., "2 1/2 cups flour")
    /^(\d+)\s+(\d+\/\d+)\s+([a-zA-Z]+)\s+(.+)$/,
    // Pattern 2: Fraction + unit + ingredient (e.g., "1/2 cup sugar")
    /^(\d+\/\d+)\s+([a-zA-Z]+)\s+(.+)$/,
    // Pattern 3: Number + unit + ingredient (e.g., "2 cups flour")
    /^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+(.+)$/,
    // Pattern 4: Just number + ingredient (e.g., "2 eggs")
    /^(\d+(?:\.\d+)?)\s+(.+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        // Number + fraction + unit + ingredient
        const wholeNumber = parseFloat(match[1]);
        const fraction = parseFraction(match[2]);
        const amount = wholeNumber + fraction;
        const unit = match[3];
        const name = match[4];
        return { name, amount, unit };
      } else if (pattern === patterns[1]) {
        // Fraction + unit + ingredient
        const amount = parseFraction(match[1]);
        const unit = match[2];
        const name = match[3];
        return { name, amount, unit };
      } else if (pattern === patterns[2]) {
        // Number + unit + ingredient
        const amount = parseFloat(match[1]);
        const unit = match[2];
        const name = match[3];
        return { name, amount, unit };
      } else if (pattern === patterns[3]) {
        // Just number + ingredient
        const amount = parseFloat(match[1]);
        const name = match[2];
        return { name, amount, unit: '' };
      }
    }
  }
  
  // If no pattern matches, return the whole string as the ingredient name
  return {
    name: cleaned,
    amount: 1,
    unit: ''
  };
}

function parseFraction(fractionStr: string): number {
  const parts = fractionStr.split('/');
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return numerator / denominator;
  }
  return parseFloat(fractionStr) || 0;
}

function parseInstructionsFromJsonLd(instructions: any[]): string[] {
  if (!Array.isArray(instructions)) return [];
  
  return instructions.map(instruction => {
    if (typeof instruction === 'string') {
      return instruction;
    } else if (instruction.text) {
      return instruction.text;
    } else if (instruction.name) {
      return instruction.name;
    }
    return '';
  }).filter(instruction => instruction.trim().length > 0);
}

function extractCaloriesFromNutrients(nutrients: any): number {
  if (!nutrients) return 300;
  
  // Handle the Python script format where calories might be "420 calorie"
  if (nutrients.calories) {
    const calorieStr = nutrients.calories.toString();
    const match = calorieStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 300;
  }
  
  return 300;
}

function extractCaloriesFromNutrition(nutrition: any): number {
  if (!nutrition) return 300;
  
  if (nutrition.calories) {
    const calories = parseFloat(nutrition.calories.toString());
    return isNaN(calories) ? 300 : calories;
  }
  
  return 300;
}

function parseDurationToMinutes(duration: string): number {
  if (!duration) return 30;
  
  // Handle ISO 8601 duration format (PT30M) or simple formats
  if (duration.startsWith('PT')) {
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    const totalMinutes = (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
    return totalMinutes || 30;
  }
  
  // Handle simple number formats
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 30;
}

function getImageUrl(image: any): string {
  if (!image) return '';
  
  if (typeof image === 'string') {
    return image;
  } else if (Array.isArray(image) && image.length > 0) {
    return typeof image[0] === 'string' ? image[0] : image[0].url || '';
  } else if (image.url) {
    return image.url;
  }
  
  return '';
}

export function validateImportedRecipe(recipe: SpoonacularRecipe): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!recipe.title || recipe.title.trim().length === 0) {
    errors.push('Recipe title is required');
  }
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }
  
  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('At least one instruction step is required');
  }
  
  if (recipe.servings <= 0) {
    errors.push('Servings must be greater than 0');
  }
  
  if (recipe.readyInMinutes <= 0) {
    errors.push('Preparation time must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}