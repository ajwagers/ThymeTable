import { SpoonacularRecipe, Ingredient } from '../types';

interface ParsedRecipe {
  title: string;
  readyInMinutes: number;
  servings: number;
  calories: number;
  image: string;
  cuisines: string[];
  instructions: string[];
  ingredients: Ingredient[];
  dishTypes: string[];
}

// Main parsing function using enhanced Supabase Edge Function with Python support
export async function parseRecipeFromUrl(url: string): Promise<SpoonacularRecipe> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Please use HTTP or HTTPS.');
    }

    console.log('🔍 Fetching recipe from:', url);

    // Call our enhanced Supabase Edge Function with Python support
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/scrape-recipe-python`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ url: url.trim() })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.recipe) {
      throw new Error(data.error || 'No recipe data received from server');
    }

    const parsedRecipe = data.recipe;
    const method = data.method || 'unknown';

    // Validate we got essential data
    if (!parsedRecipe.title) {
      throw new Error('Could not extract recipe title from the webpage. Please check the URL or try a different recipe site.');
    }

    // Create SpoonacularRecipe object with defaults
    const recipe: SpoonacularRecipe = {
      id: -Date.now(), // Negative ID for imported recipes
      title: parsedRecipe.title,
      readyInMinutes: parsedRecipe.readyInMinutes || 30,
      servings: parsedRecipe.servings || 4,
      calories: parsedRecipe.calories || 300,
      image: parsedRecipe.image || '',
      cuisines: parsedRecipe.cuisines || [],
      instructions: parsedRecipe.instructions || [],
      ingredients: parsedRecipe.ingredients || [],
      dishTypes: parsedRecipe.dishTypes || [],
      isUserCreated: true
    };

    console.log(`✅ Successfully parsed recipe using ${method}:`, recipe.title);
    console.log('📊 Recipe data:', {
      ingredients: recipe.ingredients.length,
      instructions: recipe.instructions.length,
      prepTime: recipe.readyInMinutes,
      servings: recipe.servings,
      method: method
    });

    return recipe;

  } catch (error) {
    console.error('❌ Recipe parsing error:', error);

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to access the recipe parsing service. Please check your internet connection and try again.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred while parsing the recipe. Please try again or enter the recipe manually.');
  }
}

// Client-side fallback parser (limited functionality due to CORS)
export async function parseRecipeFromUrlFallback(url: string): Promise<SpoonacularRecipe> {
  try {
    console.log('🔄 Using fallback parser for:', url);

    // Try using a CORS proxy as fallback
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;

    if (!html) {
      throw new Error('No content received from the webpage');
    }

    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Try to extract basic recipe information
    let title = '';
    let ingredients: Ingredient[] = [];
    let instructions: string[] = [];
    let image = '';
    let readyInMinutes = 30;
    let servings = 4;
    let calories = 300;

    // Try to find title
    const titleElement = doc.querySelector('h1, .recipe-title, [itemProp="name"]');
    if (titleElement) {
      title = titleElement.textContent?.trim() || '';
    }

    // Try to find ingredients
    const ingredientElements = doc.querySelectorAll('[itemProp="recipeIngredient"], .ingredient, .ingredients li');
    if (ingredientElements.length > 0) {
      ingredients = Array.from(ingredientElements).map(el => {
        const text = el.textContent?.trim() || '';
        return parseIngredientText(text);
      }).filter(ing => ing.name.length > 0);
    }

    // Try to find instructions
    const instructionElements = doc.querySelectorAll('[itemProp="recipeInstructions"], .instruction, .instructions li');
    if (instructionElements.length > 0) {
      instructions = Array.from(instructionElements)
        .map(el => el.textContent?.trim() || '')
        .filter(inst => inst.length > 10);
    }

    // Try to find image
    const imageElement = doc.querySelector('[itemProp="image"], .recipe-image img') as HTMLImageElement;
    if (imageElement) {
      image = imageElement.src || '';
    }

    if (!title) {
      throw new Error('Could not extract recipe title from the webpage. The site may not be supported or may be blocking automated requests.');
    }

    const recipe: SpoonacularRecipe = {
      id: -Date.now(),
      title,
      readyInMinutes,
      servings,
      calories,
      image,
      cuisines: [],
      instructions,
      ingredients,
      dishTypes: [],
      isUserCreated: true
    };

    console.log('✅ Fallback parser extracted recipe:', recipe.title);
    return recipe;

  } catch (error) {
    console.error('❌ Fallback parser error:', error);
    throw new Error('Unable to parse recipe from this URL. Please try entering the recipe manually or use a different recipe website.');
  }
}

// Helper function to parse ingredient text
function parseIngredientText(text: string): Ingredient {
  const cleanText = text.trim();
  
  // Try to extract amount and unit from the beginning
  const match = cleanText.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]*)\s*(.+)$/);
  
  if (match) {
    const [, amountStr, unit, name] = match;
    
    // Handle fractions
    let amount = 1;
    if (amountStr.includes('/')) {
      const [numerator, denominator] = amountStr.split('/').map(Number);
      amount = numerator / denominator;
    } else {
      amount = parseFloat(amountStr);
    }
    
    return {
      name: name.trim(),
      amount: isNaN(amount) ? 1 : amount,
      unit: unit || ''
    };
  }
  
  // If no amount/unit found, treat entire string as ingredient name
  return {
    name: cleanText,
    amount: 1,
    unit: ''
  };
}

// Helper function to validate and clean imported recipe data
export function validateImportedRecipe(recipe: SpoonacularRecipe): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!recipe.title || recipe.title.trim().length < 3) {
    errors.push('Recipe title is required and must be at least 3 characters long');
  }

  if (recipe.readyInMinutes < 1 || recipe.readyInMinutes > 1440) {
    errors.push('Prep time must be between 1 and 1440 minutes (24 hours)');
  }

  if (recipe.servings < 1 || recipe.servings > 50) {
    errors.push('Servings must be between 1 and 50');
  }

  if (recipe.calories < 0 || recipe.calories > 5000) {
    errors.push('Calories must be between 0 and 5000');
  }

  if (recipe.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }

  // Validate ingredients
  recipe.ingredients.forEach((ingredient, index) => {
    if (!ingredient.name || ingredient.name.trim().length < 2) {
      errors.push(`Ingredient ${index + 1}: Name is required and must be at least 2 characters long`);
    }
    if (ingredient.amount <= 0) {
      errors.push(`Ingredient ${index + 1}: Amount must be greater than 0`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}