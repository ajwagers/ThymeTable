#!/usr/bin/env python
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
    print(f"Scraping recipe from: {url}\n", file=sys.stderr)

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
            "instructions": [line for line in scraper.instructions().split('\n') if line.strip()],
            "image_url": scraper.image(),
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