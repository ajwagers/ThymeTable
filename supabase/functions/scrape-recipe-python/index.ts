import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Your Python script with minimal modifications
const pythonScript = `#!/usr/bin/env python
import sys
import json
from recipe_scrapers import scrape_me
from recipe_scrapers._exceptions import WebsiteNotImplementedError, NoSchemaFoundInWildMode

def main():
    """
    A robust script to scrape recipe data from a given URL.
    Attempts different scraping methods for maximum compatibility.
    """
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <url>")
        sys.exit(1)

    url = sys.argv[1]
    print(f"Scraping recipe from: {url}\\n", file=sys.stderr)

    scraper = None
    
    # Try different approaches to scrape the recipe
    try:
        # First try: Standard scraping (for supported sites)
        scraper = scrape_me(url)
        print("✓ Using supported site scraper", file=sys.stderr)
        
    except WebsiteNotImplementedError:
        try:
            # Second try: Try with online=False to force schema.org parsing
            scraper = scrape_me(url, online=False)
            print("✓ Using schema.org fallback scraper", file=sys.stderr)
        except:
            pass
    except:
        pass

    # If we still don't have a scraper, try other methods
    if scraper is None:
        try:
            # Try importing requests and passing HTML directly
            import requests
            response = requests.get(url)
            response.raise_for_status()
            scraper = scrape_me(url, html=response.content)
            print("✓ Using manual HTML fetch", file=sys.stderr)
        except Exception as e:
            print(f"Error: Unable to scrape recipe from '{url}'", file=sys.stderr)
            print(f"Details: {e}", file=sys.stderr)
            print("This could be due to:", file=sys.stderr)
            print("  - Unsupported website (not in recipe_scrapers database)", file=sys.stderr)
            print("  - No structured recipe data (schema.org/Recipe) found", file=sys.stderr)
            print("  - Network connectivity issues", file=sys.stderr)
            print("  - Website blocking automated requests", file=sys.stderr)
            sys.exit(1)

    try:
        # Extract recipe data
        recipe_data = {
            "title": scraper.title(),
            "total_time_minutes": scraper.total_time(),
            "yields": scraper.yields(),
            "ingredients": scraper.ingredients(),
            # The instructions() method returns a single string; split it and remove empty lines for cleaner JSON
            "instructions": [line for line in scraper.instructions().split('\\n') if line.strip()],
            "nutrients": scraper.nutrients(),
            "canonical_url": scraper.canonical_url(),
            "host": scraper.host(),
        }

        # Pretty print the JSON output to standard output
        print(json.dumps(recipe_data, indent=2))

    except Exception as e:
        print(f"Error extracting recipe data: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

function transformToAppFormat(pythonOutput: any) {
  // Transform the Python script output to match the app's expected format
  const ingredients = Array.isArray(pythonOutput.ingredients) 
    ? pythonOutput.ingredients.map((ingredient: string, index: number) => {
        // Try to parse ingredient string to extract amount, unit, and name
        const match = ingredient.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?\s+(.+)$/);
        if (match) {
          const [, amount, unit, name] = match;
          return {
            name: name.trim(),
            amount: parseFloat(amount) || 1,
            unit: unit || ''
          };
        } else {
          // If parsing fails, treat as name only with default amount
          return {
            name: ingredient.trim(),
            amount: 1,
            unit: ''
          };
        }
      })
    : [];

  return {
    id: -Date.now(), // Negative ID for imported recipes
    title: pythonOutput.title || 'Imported Recipe',
    readyInMinutes: pythonOutput.total_time_minutes || 30,
    servings: pythonOutput.yields ? parseInt(pythonOutput.yields.replace(/\D/g, '')) || 4 : 4,
    calories: 300, // Default since Python script doesn't extract calories
    image: pythonOutput.image_url || '/No Image.png',
    cuisines: [], // Python script doesn't extract cuisines
    instructions: Array.isArray(pythonOutput.instructions) ? pythonOutput.instructions : [],
    ingredients: ingredients,
    dishTypes: [], // Python script doesn't extract dish types
    isUserCreated: false,
    isImported: true,
    sourceUrl: pythonOutput.canonical_url || pythonOutput.host
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🐍 Starting Python recipe scraping for: ${url}`);

    // Write the Python script to a temporary file
    const scriptPath = '/tmp/scrape_recipe.py';
    await Deno.writeTextFile(scriptPath, pythonScript);
    await Deno.chmod(scriptPath, 0o755);

    // Execute the Python script
    const command = new Deno.Command('python3', {
      args: [scriptPath, url],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await command.output();
    
    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    console.log('Python stderr:', stderrText);

    if (code !== 0) {
      console.error(`Python script failed with code ${code}`);
      console.error('stderr:', stderrText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to scrape recipe',
          details: stderrText || 'Unknown error occurred'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!stdoutText.trim()) {
      return new Response(
        JSON.stringify({ 
          error: 'No recipe data extracted',
          details: 'The Python script completed but returned no data'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // Parse the JSON output from the Python script
      const pythonOutput = JSON.parse(stdoutText);
      console.log('✅ Python script output:', pythonOutput);

      // Transform to app format
      const transformedRecipe = transformToAppFormat(pythonOutput);
      console.log('✅ Transformed recipe:', transformedRecipe);

      return new Response(
        JSON.stringify(transformedRecipe),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (parseError) {
      console.error('Failed to parse Python output:', parseError);
      console.error('Raw output:', stdoutText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse recipe data',
          details: 'The scraped data could not be processed'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});