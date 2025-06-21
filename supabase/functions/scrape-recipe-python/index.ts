/*
  # Enhanced Recipe Scraping Edge Function with Python Integration
  
  This function provides multiple scraping strategies:
  1. Python recipe_scrapers library (most comprehensive)
  2. JavaScript JSON-LD parsing (fast and reliable)
  3. HTML microdata parsing (fallback)
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

interface ScrapedRecipe {
  title: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: string[];
  image?: string;
  servings?: number;
  readyInMinutes?: number;
  calories?: number;
  cuisines?: string[];
  dishTypes?: string[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Parse time strings like "PT30M", "30 minutes", "1 hour 30 minutes"
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 30;
  
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
  return totalMinutes > 0 ? totalMinutes : 30;
}

// Parse serving count from strings
function parseServings(servingStr: string): number {
  if (!servingStr) return 4;
  
  const match = servingStr.match(/(\d+)/);
  if (match) {
    const servings = parseInt(match[1]);
    return servings > 0 && servings <= 20 ? servings : 4;
  }
  
  return 4;
}

// Parse ingredient string to extract amount, unit, and name
function parseIngredient(ingredientStr: string): { name: string; amount: number; unit: string } {
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

// Try to scrape using Python recipe_scrapers library
async function scrapePythonRecipe(url: string): Promise<ScrapedRecipe | null> {
  try {
    console.log('🐍 Attempting Python recipe_scrapers...');
    
    // Create the Python script content
    const pythonScript = `
import sys
import json
from recipe_scrapers import scrape_me
from recipe_scrapers._exceptions import WebsiteNotImplementedError, NoSchemaFoundInWildMode

def main():
    url = "${url}"
    scraper = None
    
    try:
        scraper = scrape_me(url)
    except WebsiteNotImplementedError:
        try:
            scraper = scrape_me(url, online=False)
        except:
            pass
    except:
        pass

    if scraper is None:
        try:
            import requests
            response = requests.get(url)
            response.raise_for_status()
            scraper = scrape_me(url, html=response.content)
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    try:
        recipe_data = {
            "title": scraper.title(),
            "total_time_minutes": scraper.total_time(),
            "yields": scraper.yields(),
            "ingredients": scraper.ingredients(),
            "instructions": [line for line in scraper.instructions().split('\\n') if line.strip()],
            "image_url": scraper.image(),
            "nutrients": scraper.nutrients(),
            "canonical_url": scraper.canonical_url(),
            "host": scraper.host(),
        }
        print(json.dumps(recipe_data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

    // Execute Python script
    const process = new Deno.Command("python3", {
      args: ["-c", pythonScript],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await process.output();
    
    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr);
      console.warn('Python scraper failed:', errorOutput);
      return null;
    }

    const output = new TextDecoder().decode(stdout);
    const pythonData = JSON.parse(output);

    if (pythonData.error) {
      console.warn('Python scraper error:', pythonData.error);
      return null;
    }

    // Convert Python data to our format
    const recipe: ScrapedRecipe = {
      title: pythonData.title || '',
      readyInMinutes: pythonData.total_time_minutes || 30,
      servings: parseServings(pythonData.yields || '4'),
      image: pythonData.image_url || '',
      ingredients: (pythonData.ingredients || []).map((ing: string) => parseIngredient(ing)),
      instructions: pythonData.instructions || [],
      cuisines: [],
      dishTypes: []
    };

    // Extract calories from nutrients if available
    if (pythonData.nutrients && pythonData.nutrients.calories) {
      const caloriesStr = pythonData.nutrients.calories.toString();
      const calories = parseInt(caloriesStr.replace(/[^\d]/g, ''));
      if (!isNaN(calories)) recipe.calories = calories;
    }

    console.log('✅ Python scraper successful:', recipe.title);
    return recipe;

  } catch (error) {
    console.warn('Python scraper exception:', error);
    return null;
  }
}

// Parse JSON-LD structured data
function parseJsonLd(doc: Document): Partial<ScrapedRecipe> | null {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      
      // Handle arrays of structured data
      const recipes = Array.isArray(data) ? data : [data];
      
      for (const item of recipes) {
        if (item['@type'] === 'Recipe' || item.type === 'Recipe') {
          const recipe: Partial<ScrapedRecipe> = {};
          
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
function parseMicrodata(doc: Document): Partial<ScrapedRecipe> {
  const recipe: Partial<ScrapedRecipe> = {};
  
  // Common selectors for recipe data
  const titleSelectors = [
    '[itemProp="name"]',
    '.recipe-title',
    '.entry-title',
    'h1.recipe-name',
    'h1[class*="title"]',
    'h1[class*="recipe"]',
    'h1'
  ];
  
  const timeSelectors = [
    '[itemProp="prepTime"]',
    '[itemProp="cookTime"]',
    '[itemProp="totalTime"]',
    '.prep-time',
    '.cook-time',
    '.total-time'
  ];
  
  const servingSelectors = [
    '[itemProp="recipeYield"]',
    '[itemProp="yield"]',
    '.servings',
    '.yield',
    '.recipe-yield'
  ];
  
  const ingredientSelectors = [
    '[itemProp="recipeIngredient"]',
    '.recipe-ingredient',
    '.ingredient',
    '.ingredients li',
    '.recipe-ingredients li'
  ];
  
  const instructionSelectors = [
    '[itemProp="recipeInstructions"]',
    '.recipe-instruction',
    '.instruction',
    '.instructions li',
    '.recipe-instructions li',
    '.directions li'
  ];
  
  const imageSelectors = [
    '[itemProp="image"]',
    '.recipe-image img',
    '.recipe-photo img',
    '.entry-content img:first-of-type'
  ];
  
  // Helper function to find element using multiple selectors
  function findElement(selectors: string[]): Element | null {
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) return element;
    }
    return null;
  }
  
  // Title
  const titleElement = findElement(titleSelectors);
  if (titleElement) recipe.title = titleElement.textContent?.trim() || '';
  
  // Prep time
  const timeElement = findElement(timeSelectors);
  if (timeElement) {
    const timeText = timeElement.textContent?.trim() || timeElement.getAttribute('datetime') || '';
    recipe.readyInMinutes = parseTimeToMinutes(timeText);
  }
  
  // Servings
  const servingsElement = findElement(servingSelectors);
  if (servingsElement) {
    recipe.servings = parseServings(servingsElement.textContent?.trim() || '');
  }
  
  // Ingredients
  const ingredientElements = doc.querySelectorAll(ingredientSelectors.join(', '));
  if (ingredientElements.length > 0) {
    recipe.ingredients = Array.from(ingredientElements)
      .map(el => parseIngredient(el.textContent?.trim() || ''))
      .filter(ing => ing.name.length > 0);
  }
  
  // Instructions
  const instructionElements = doc.querySelectorAll(instructionSelectors.join(', '));
  if (instructionElements.length > 0) {
    recipe.instructions = Array.from(instructionElements)
      .map(el => el.textContent?.trim() || '')
      .filter(inst => inst.length > 10);
  }
  
  // Image
  const imageElement = findElement(imageSelectors) as HTMLImageElement;
  if (imageElement) {
    recipe.image = imageElement.src || imageElement.getAttribute('data-src') || '';
  }
  
  return recipe;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate URL
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid URL protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🔍 Fetching recipe from:', url);

    let parsedRecipe: ScrapedRecipe | null = null;
    let method = 'unknown';

    // Strategy 1: Try Python recipe_scrapers first (most comprehensive)
    try {
      parsedRecipe = await scrapePythonRecipe(url);
      if (parsedRecipe && parsedRecipe.title) {
        method = 'python-recipe-scrapers';
      }
    } catch (error) {
      console.warn('Python scraper failed:', error);
    }

    // Strategy 2: Fall back to JavaScript parsing if Python failed
    if (!parsedRecipe || !parsedRecipe.title) {
      console.log('🔄 Falling back to JavaScript parsing...');
      
      // Fetch the webpage
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      if (!html) {
        throw new Error('No content received from the webpage');
      }

      // Parse HTML
      const doc = new DOMParser().parseFromString(html, 'text/html');

      if (!doc) {
        throw new Error('Failed to parse HTML content');
      }

      // Try JSON-LD first (most reliable)
      let jsRecipe = parseJsonLd(doc);

      // Fall back to microdata parsing
      if (!jsRecipe || !jsRecipe.title) {
        const microdataRecipe = parseMicrodata(doc);
        jsRecipe = { ...microdataRecipe, ...jsRecipe };
        method = 'javascript-microdata';
      } else {
        method = 'javascript-jsonld';
      }

      if (jsRecipe && jsRecipe.title) {
        parsedRecipe = {
          title: jsRecipe.title,
          readyInMinutes: jsRecipe.readyInMinutes || 30,
          servings: jsRecipe.servings || 4,
          calories: jsRecipe.calories || 300,
          image: jsRecipe.image || '',
          cuisines: jsRecipe.cuisines || [],
          instructions: jsRecipe.instructions || [],
          ingredients: jsRecipe.ingredients || [],
          dishTypes: jsRecipe.dishTypes || []
        };
      }
    }

    // Validate we got essential data
    if (!parsedRecipe || !parsedRecipe.title) {
      throw new Error('Could not extract recipe title from the webpage. Please check the URL or try a different recipe site.');
    }

    // Create final recipe object with defaults
    const recipe: ScrapedRecipe = {
      title: parsedRecipe.title,
      readyInMinutes: parsedRecipe.readyInMinutes || 30,
      servings: parsedRecipe.servings || 4,
      calories: parsedRecipe.calories || 300,
      image: parsedRecipe.image || '',
      cuisines: parsedRecipe.cuisines || [],
      instructions: parsedRecipe.instructions || [],
      ingredients: parsedRecipe.ingredients || [],
      dishTypes: parsedRecipe.dishTypes || []
    };

    console.log(`✅ Successfully parsed recipe using ${method}:`, recipe.title);
    console.log('📊 Recipe data:', {
      ingredients: recipe.ingredients.length,
      instructions: recipe.instructions.length,
      prepTime: recipe.readyInMinutes,
      servings: recipe.servings
    });

    return new Response(
      JSON.stringify({ 
        recipe,
        method,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Recipe parsing error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while parsing the recipe';

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});