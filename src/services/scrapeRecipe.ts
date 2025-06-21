import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface ScrapedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  servings?: number;
  readyInMinutes?: number;
}

export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe | null> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch the page');
  const html = await res.text();
  const $ = cheerio.load(html);

  // Try to find JSON-LD structured data
  const jsonLd = $('script[type="application/ld+json"]').toArray()
    .map(el => {
      try {
        return JSON.parse($(el).html() || '');
      } catch {
        return null;
      }
    })
    .find(obj => obj && (obj['@type'] === 'Recipe' || (Array.isArray(obj['@type']) && obj['@type'].includes('Recipe'))));

  if (jsonLd) {
    return {
      title: jsonLd.name || '',
      ingredients: jsonLd.recipeIngredient || [],
      instructions: Array.isArray(jsonLd.recipeInstructions)
        ? jsonLd.recipeInstructions.map((step: any) => typeof step === 'string' ? step : step.text)
        : [],
      image: typeof jsonLd.image === 'string' ? jsonLd.image : (Array.isArray(jsonLd.image) ? jsonLd.image[0] : undefined),
      servings: jsonLd.recipeYield ? parseInt(jsonLd.recipeYield) : undefined,
      readyInMinutes: jsonLd.totalTime ? parseInt(jsonLd.totalTime.replace(/\D/g, '')) : undefined,
    };
  }

  // Fallback: Try to extract Open Graph data or basic selectors
  return {
    title: $('meta[property="og:title"]').attr('content') || $('title').text(),
    ingredients: $('li.ingredient, .ingredients li').map((_, el) => $(el).text().trim()).get(),
    instructions: $('li.instruction, .instructions li').map((_, el) => $(el).text().trim()).get(),
    image: $('meta[property="og:image"]').attr('content'),
  };
}