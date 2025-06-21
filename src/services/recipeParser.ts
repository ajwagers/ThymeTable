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

// Common recipe schema selectors for different websites
const RECIPE_SELECTORS = {
  // JSON-LD structured data (most common)
  jsonLd: 'script[type="application/ld+json"]',
  
  // Common recipe microdata selectors
  title: [
    '[itemProp="name"]',
    '.recipe-title',
    '.entry-title',
    'h1.recipe-name',
    'h1[class*="title"]',
    'h1[class*="recipe"]'
  ],
  
  prepTime: [
    '[itemProp="prepTime"]',
    '[itemProp="cookTime"]',
    '[itemProp="totalTime"]',
    '.prep-time',
    '.cook-time',
    '.total-time'
  ],
  
  servings: [
    '[itemProp="recipeYield"]',
    '[itemProp="yield"]',
    '.servings',
    '.yield',
    '.recipe-yield'
  ],
  
  ingredients: [
    '[itemProp="recipeIngredient"]',
    '.recipe-ingredient',
    '.ingredient',
    '.ingredients li',
    '.recipe-ingredients li'
  ],
  
  instructions: [
    '[itemProp="recipeInstructions"]',
    '.recipe-instruction',
    '.instruction',
    '.instructions li',
    '.recipe-instructions li',
    '.directions li'
  ],
  
  image: [
    '[itemProp="image"]',
    '.recipe-image img',
    '.recipe-photo img',
    '.entry-content img:first-of-type'
  ]
};

// Parse time strings like "PT30M", "30 minutes", "1 hour 30 minutes"
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 30; // Default fallback
  
  // Handle ISO 8601 duration format (PT30M, PT1H30M)
  const isoDuration = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (isoDuration) {
    const hours = parseInt(isoDuration[1] || '0');
    const minutes = parseInt(isoDuration[2] || '0');
    return hours * 60 + minutes;
  }
  
  // Handle natural language time
  const hourMatch = timeStr.match(/(\d+)\s*(?:hour|hr|h)/i);
  const minuteMatch = timeStr.match(/(\d+)\s*(?:minute|min|m)/i);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
  
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes > 0 ? totalMinutes : 30; // Default to 30 if parsing fails
}

// Parse serving count from strings like "4 servings", "Serves 6", "6-8 people"
function parseServings(servingStr: string): number {
  if (!servingStr) return 4; // Default fallback
  
  const match = servingStr.match(/(\d+)/);
  if (match) {
    const servings = parseInt(match[1]);
    return servings > 0 && servings <= 20 ? servings : 4;
  }
  
  return 4;
}

// Parse ingredient string to extract amount, unit, and name
function parseIngredient(ingredientStr: string): Ingredient {
  const cleanStr = ingredientStr.trim();
  
  // Try to extract amount and unit from the beginning
  const match = cleanStr.match(/^(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]*)\s*(.+)$/);
  
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
    name: cleanStr,
    amount: 1,
    unit: ''
  };
}

// Extract text content from HTML element
function getTextContent(element: Element): string {
  return element.textContent?.trim() || '';
}

// Try to find element using multiple selectors
function findElementBySelectors(doc: Document, selectors: string[]): Element | null {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) return element;
  }
  return null;
}

// Parse JSON-LD structured data
function parseJsonLd(doc: Document): Partial<ParsedRecipe> | null {
  const scripts = doc.querySelectorAll(RECIPE_SELECTORS.jsonLd);
  
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      
      // Handle arrays of structured data
      const recipes = Array.isArray(data) ? data : [data];
      
      for (const item of recipes) {
        if (item['@type'] === 'Recipe' || item.type === 'Recipe') {
          const recipe: Partial<ParsedRecipe> = {};
          
          if (item.name) recipe.title = item.name;
          if (item.totalTime) recipe.readyInMinutes = parseTimeToMinutes(item.totalTime);
          if (item.cookTime && !recipe.readyInMinutes) recipe.readyInMinutes = parseTimeToMinutes(item.cookTime);
          if (item.prepTime && !recipe.readyInMinutes) recipe.readyInMinutes = parseTimeToMinutes(item.prepTime);
          
          if (item.recipeYield) recipe.servings = parseServings(Array.isArray(item.recipeYield) ? item.recipeYield[0] : item.recipeYield);
          if (item.yield && !recipe.servings) recipe.servings = parseServings(Array.isArray(item.yield) ? item.yield[0] : item.yield);
          
          if (item.image) {
            const imageUrl = typeof item.image === 'string' ? item.image : 
                           Array.isArray(item.image) ? item.image[0] :
                           item.image.url || item.image['@id'] || '';
            recipe.image = imageUrl;
          }
          
          if (item.recipeIngredient) {
            recipe.ingredients = item.recipeIngredient.map((ing: string) => parseIngredient(ing));
          }
          
          if (item.recipeInstructions) {
            recipe.instructions = item.recipeInstructions.map((inst: any) => {
              if (typeof inst === 'string') return inst;
              if (inst.text) return inst.text;
              if (inst.name) return inst.name;
              return '';
            }).filter(Boolean);
          }
          
          if (item.recipeCuisine) {
            recipe.cuisines = Array.isArray(item.recipeCuisine) ? item.recipeCuisine : [item.recipeCuisine];
          }
          
          if (item.recipeCategory) {
            recipe.dishTypes = Array.isArray(item.recipeCategory) ? item.recipeCategory : [item.recipeCategory];
          }
          
          // Estimate calories if nutrition info is available
          if (item.nutrition && item.nutrition.calories) {
            const caloriesStr = typeof item.nutrition.calories === 'string' ? 
              item.nutrition.calories : item.nutrition.calories.toString();
            const calories = parseInt(caloriesStr.replace(/[^\d]/g, ''));
            if (!isNaN(calories)) recipe.calories = calories;
          }
          
          return recipe;
        }
      }
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error);
    }
  }
  
  return null;
}

// Parse recipe using microdata/HTML selectors
function parseMicrodata(doc: Document): Partial<ParsedRecipe> {
  const recipe: Partial<ParsedRecipe> = {};
  
  // Title
  const titleElement = findElementBySelectors(doc, RECIPE_SELECTORS.title);
  if (titleElement) recipe.title = getTextContent(titleElement);
  
  // Prep time
  const timeElement = findElementBySelectors(doc, RECIPE_SELECTORS.prepTime);
  if (timeElement) {
    const timeText = getTextContent(timeElement) || timeElement.getAttribute('datetime') || '';
    recipe.readyInMinutes = parseTimeToMinutes(timeText);
  }
  
  // Servings
  const servingsElement = findElementBySelectors(doc, RECIPE_SELECTORS.servings);
  if (servingsElement) {
    recipe.servings = parseServings(getTextContent(servingsElement));
  }
  
  // Ingredients
  const ingredientElements = doc.querySelectorAll(RECIPE_SELECTORS.ingredients.join(', '));
  if (ingredientElements.length > 0) {
    recipe.ingredients = Array.from(ingredientElements)
      .map(el => parseIngredient(getTextContent(el)))
      .filter(ing => ing.name.length > 0);
  }
  
  // Instructions
  const instructionElements = doc.querySelectorAll(RECIPE_SELECTORS.instructions.join(', '));
  if (instructionElements.length > 0) {
    recipe.instructions = Array.from(instructionElements)
      .map(el => getTextContent(el))
      .filter(inst => inst.length > 10); // Filter out very short instructions
  }
  
  // Image
  const imageElement = findElementBySelectors(doc, RECIPE_SELECTORS.image) as HTMLImageElement;
  if (imageElement) {
    recipe.image = imageElement.src || imageElement.getAttribute('data-src') || '';
  }
  
  return recipe;
}

// Main parsing function
export async function parseRecipeFromUrl(url: string): Promise<SpoonacularRecipe> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Please use HTTP or HTTPS.');
    }
    
    console.log('🔍 Fetching recipe from:', url);
    
    // Fetch the webpage
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const html = data.contents;
    
    if (!html) {
      throw new Error('No content received from the webpage');
    }
    
    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try JSON-LD first (most reliable)
    let parsedRecipe = parseJsonLd(doc);
    
    // Fall back to microdata parsing
    if (!parsedRecipe || !parsedRecipe.title) {
      const microdataRecipe = parseMicrodata(doc);
      parsedRecipe = { ...microdataRecipe, ...parsedRecipe };
    }
    
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
    
    console.log('✅ Successfully parsed recipe:', recipe.title);
    console.log('📊 Recipe data:', {
      ingredients: recipe.ingredients.length,
      instructions: recipe.instructions.length,
      prepTime: recipe.readyInMinutes,
      servings: recipe.servings
    });
    
    return recipe;
    
  } catch (error) {
    console.error('❌ Recipe parsing error:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to access the website. The site may be blocking automated requests or may be temporarily unavailable.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred while parsing the recipe. Please try again or enter the recipe manually.');
  }
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