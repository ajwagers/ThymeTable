import React from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Day, Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';

interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
}

function GroceryListPage() {
  const navigate = useNavigate();
  const { adjustQuantity } = useServings();
  const [groceryList, setGroceryList] = React.useState<GroceryItem[]>([]);

  // Helper function to convert decimal to fraction (copied from ServingsContext)
  const toFraction = (decimal: number): string => {
    if (decimal === Math.floor(decimal)) {
      return decimal.toString();
    }

    // Convert to nearest third or eighth
    const thirds = Math.round(decimal * 3) / 3;
    const eighths = Math.round(decimal * 8) / 8;

    // Use whichever is closer
    const useThirds = Math.abs(decimal - thirds) < Math.abs(decimal - eighths);
    const rounded = useThirds ? thirds : eighths;

    // Extract whole number and fractional parts
    const whole = Math.floor(rounded);
    const fraction = rounded - whole;

    // Convert to fraction string
    let fractionStr = '';
    if (useThirds) {
      if (Math.abs(fraction - 1/3) < 0.01) fractionStr = '1/3';
      else if (Math.abs(fraction - 2/3) < 0.01) fractionStr = '2/3';
    } else {
      if (Math.abs(fraction - 1/8) < 0.01) fractionStr = '1/8';
      else if (Math.abs(fraction - 1/4) < 0.01) fractionStr = '1/4';
      else if (Math.abs(fraction - 3/8) < 0.01) fractionStr = '3/8';
      else if (Math.abs(fraction - 1/2) < 0.01) fractionStr = '1/2';
      else if (Math.abs(fraction - 5/8) < 0.01) fractionStr = '5/8';
      else if (Math.abs(fraction - 3/4) < 0.01) fractionStr = '3/4';
      else if (Math.abs(fraction - 7/8) < 0.01) fractionStr = '7/8';
    }

    return whole > 0 ? `${whole} ${fractionStr}` : fractionStr;
  };

  // Helper function to detect if an ingredient name is actually a cooking instruction
  const isInstruction = (text: string): boolean => {
    const instructionKeywords = [
      'add', 'cook', 'stir', 'fry', 'heat', 'boil', 'simmer', 'bake', 'roast', 'grill',
      'mix', 'combine', 'blend', 'whisk', 'beat', 'fold', 'toss', 'season', 'taste',
      'serve', 'garnish', 'sprinkle', 'drizzle', 'pour', 'place', 'remove', 'drain',
      'chop', 'dice', 'slice', 'mince', 'crush', 'press', 'squeeze', 'strain',
      'continue', 'until', 'about', 'minute', 'minutes', 'second', 'seconds',
      'cooked through', 'golden brown', 'tender', 'crispy', 'hot', 'warm', 'cool'
    ];

    const lowerText = text.toLowerCase();
    
    // Check if it contains multiple instruction keywords
    const keywordCount = instructionKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    // If it contains 2+ instruction keywords, it's likely an instruction
    if (keywordCount >= 2) return true;
    
    // Check for common instruction patterns
    const instructionPatterns = [
      /\b(add|cook|stir|mix|heat|boil)\s+.*\s+(until|about|for)\s+/i,
      /\b(continue|keep|let)\s+.*\s+(until|for)\s+/i,
      /\bcooked?\s+through\b/i,
      /\b(about|for)\s+\d+\s+(minute|second)/i,
      /\band\s+(cook|stir|mix|add|continue)/i
    ];
    
    return instructionPatterns.some(pattern => pattern.test(text));
  };

  // Helper function to clean ingredient names by removing embedded amounts and units
  const getCleanedIngredientName = (originalName: string): string => {
    let cleaned = originalName.trim();
    
    // Define all units that should be removed
    const units = [
      'pounds?', 'lbs?', 'ounces?', 'oz', 'cups?', 'tablespoons?', 'tbsp', 'teaspoons?', 'tsp',
      'cans?', 'cloves?', 'ml', 'liters?', 'grams?', 'kg', 'blocks?', 'bunches?', 'bunch', 'heads?', 'head',
      'bags?', 'bag'
    ].join('|');
    
    // Remove common patterns at the beginning of ingredient names
    // This handles cases like "2 pounds regular chicken wings" or "1/2 cup brown sugar"
    const leadingPattern = new RegExp(`^[\\d\\s\\/]+\\s*(${units})\\s*`, 'i');
    cleaned = cleaned.replace(leadingPattern, '');
    
    // Remove patterns like "& ½ cups" or "½ cup" that appear in the middle
    const embeddedPattern = new RegExp(`\\s*[&\\+]?\\s*[\\d\\s\\/½¼¾⅓⅔⅛⅜⅝⅞]+\\s*(${units})\\s*`, 'gi');
    cleaned = cleaned.replace(embeddedPattern, ' ');
    
    // Remove standalone fractions and numbers that might be left over
    cleaned = cleaned.replace(/\s*[\d\s\/½¼¾⅓⅔⅛⅜⅝⅞]+\s*/g, ' ');
    
    // Remove measurement indicators like "(5ml)" or ". (5ml)"
    cleaned = cleaned.replace(/\s*\.?\s*\([^)]*\)/g, '');
    
    // Remove extra periods and dashes
    cleaned = cleaned.replace(/\s*\.\s*/g, ' ');
    cleaned = cleaned.replace(/\s*-\s*/g, ' ');
    
    // Remove "of" at the beginning if it remains
    cleaned = cleaned.replace(/^of\s+/i, '');
    
    // Clean up multiple spaces and trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove any remaining leading/trailing punctuation
    cleaned = cleaned.replace(/^[,\-\.\s]+|[,\-\.\s]+$/g, '');
    
    return cleaned.toLowerCase() || originalName.toLowerCase();
  };

  // Helper function to normalize ingredient names for better matching
  const normalizeIngredientName = (name: string): string => {
    let normalized = name.toLowerCase().trim();
    
    // Remove common descriptors and preparation methods
    const descriptorsToRemove = [
      'fresh', 'dried', 'frozen', 'canned', 'organic', 'raw', 'cooked',
      'chopped', 'diced', 'sliced', 'minced', 'crushed', 'grated', 'shredded',
      'cut into.*?dice', 'cut into.*?pieces', 'finely chopped', 'roughly chopped',
      'plus extra for garnish', 'for garnish', 'extra for.*?', 'divided',
      'low sodium', 'reduced sodium', 'unsalted', 'salted',
      'extra virgin', 'virgin', 'light', 'dark', 'heavy', 'thick',
      'flat leaf', 'italian', 'regular', 'large', 'small', 'medium',
      'baby', 'young', 'mature', 'ripe', 'unripe'
    ];
    
    // Remove descriptors
    descriptorsToRemove.forEach(descriptor => {
      const regex = new RegExp(`\\b${descriptor}\\b`, 'gi');
      normalized = normalized.replace(regex, ' ');
    });
    
    // Clean up multiple spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
  };

  // Helper function to normalize units for better matching
  const normalizeUnit = (unit: string): string => {
    const unitMap: Record<string, string> = {
      // Volume
      'cup': 'cup', 'cups': 'cup',
      'tablespoon': 'tbsp', 'tablespoons': 'tbsp', 'tbsp': 'tbsp',
      'teaspoon': 'tsp', 'teaspoons': 'tsp', 'tsp': 'tsp',
      'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
      'liter': 'liter', 'liters': 'liter', 'l': 'liter',
      'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz', 'fl oz': 'fl oz',
      
      // Weight
      'pound': 'lb', 'pounds': 'lb', 'lb': 'lb', 'lbs': 'lb',
      'ounce': 'oz', 'ounces': 'oz', 'oz': 'oz',
      'gram': 'g', 'grams': 'g', 'g': 'g',
      'kilogram': 'kg', 'kilograms': 'kg', 'kg': 'kg',
      
      // Count
      'piece': 'piece', 'pieces': 'piece',
      'clove': 'clove', 'cloves': 'clove',
      'head': 'head', 'heads': 'head',
      'bunch': 'bunch', 'bunches': 'bunch',
      'can': 'can', 'cans': 'can',
      'block': 'block', 'blocks': 'block',
      'cube': 'cube', 'cubes': 'cube',
      'bag': 'bag', 'bags': 'bag',
      
      // Empty unit stays empty (for count-based ingredients)
      '': '',
    };
    
    const normalized = unit.toLowerCase().trim();
    return unitMap[normalized] || normalized;
  };

  // Helper function to check if two ingredients should be combined
  const shouldCombineIngredients = (name1: string, name2: string): boolean => {
    const norm1 = normalizeIngredientName(name1);
    const norm2 = normalizeIngredientName(name2);
    
    // Exact match after normalization
    if (norm1 === norm2) return true;
    
    // Define ingredient groups that should be combined
    const ingredientGroups = [
      // Chicken stock/broth variations
      ['chicken broth', 'chicken stock', 'chicken bouillon', 'chicken bullion'],
      ['beef broth', 'beef stock', 'beef bouillon', 'beef bullion'],
      ['vegetable broth', 'vegetable stock', 'vegetable bouillon'],
      
      // Parsley variations
      ['parsley', 'flat leaf parsley', 'italian parsley'],
      
      // Common ingredient variations
      ['onion', 'onions', 'yellow onion', 'white onion'],
      ['garlic', 'garlic clove', 'garlic cloves'],
      ['carrot', 'carrots'],
      ['celery', 'celery stalk', 'celery stalks'],
      ['tomato', 'tomatoes', 'plum tomato', 'plum tomatoes'],
      ['bell pepper', 'bell peppers', 'red bell pepper', 'green bell pepper'],
      ['broccoli florets', 'broccoli flowerets'],
      
      // Oils and fats
      ['olive oil', 'extra virgin olive oil'],
      ['butter', 'unsalted butter', 'salted butter'],
      
      // Cheese variations
      ['parmesan', 'parmesan cheese', 'parmigiano reggiano'],
      ['mozzarella', 'mozzarella cheese'],
      ['cheddar', 'cheddar cheese'],
    ];
    
    // Check if both ingredients belong to the same group
    for (const group of ingredientGroups) {
      const inGroup1 = group.some(item => norm1.includes(item) || item.includes(norm1));
      const inGroup2 = group.some(item => norm2.includes(item) || item.includes(norm2));
      if (inGroup1 && inGroup2) return true;
    }
    
    // Check for partial matches (one contains the other)
    if (norm1.length > 3 && norm2.length > 3) {
      if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    }
    
    return false;
  };

  // Helper function to convert units to a common base for addition
  const convertToCommonUnit = (amount: number, unit: string): { amount: number; unit: string } => {
    const normalizedUnit = normalizeUnit(unit);
    
    // Volume conversions (convert to cups as base)
    const volumeConversions: Record<string, number> = {
      'tsp': 1/48,      // 1 tsp = 1/48 cup
      'tbsp': 1/16,     // 1 tbsp = 1/16 cup
      'cup': 1,         // base unit
      'fl oz': 1/8,     // 1 fl oz = 1/8 cup
      'ml': 1/236.588,  // 1 ml ≈ 1/236.588 cup
      'liter': 4.22675, // 1 liter ≈ 4.22675 cups
    };
    
    // Weight conversions (convert to ounces as base)
    const weightConversions: Record<string, number> = {
      'oz': 1,          // base unit
      'lb': 16,         // 1 lb = 16 oz
      'g': 0.035274,    // 1 g ≈ 0.035274 oz
      'kg': 35.274,     // 1 kg ≈ 35.274 oz
    };
    
    // Try volume conversion first
    if (volumeConversions[normalizedUnit]) {
      const convertedAmount = amount * volumeConversions[normalizedUnit];
      return { amount: convertedAmount, unit: 'cup' };
    }
    
    // Try weight conversion
    if (weightConversions[normalizedUnit]) {
      const convertedAmount = amount * weightConversions[normalizedUnit];
      return { amount: convertedAmount, unit: 'oz' };
    }
    
    // Return as-is if no conversion available
    return { amount, unit: normalizedUnit };
  };

  // Helper function to convert back to a user-friendly unit
  const convertToFriendlyUnit = (amount: number, baseUnit: string): { amount: string; unit: string } => {
    if (baseUnit === 'cup') {
      // Convert cups to more appropriate units
      if (amount >= 1) {
        return { amount: toFraction(amount), unit: 'cup' };
      } else if (amount >= 1/16) {
        const tbsp = amount * 16;
        return { amount: toFraction(tbsp), unit: 'tbsp' };
      } else {
        const tsp = amount * 48;
        return { amount: toFraction(tsp), unit: 'tsp' };
      }
    } else if (baseUnit === 'oz') {
      // Convert ounces to more appropriate units
      if (amount >= 16) {
        const lbs = amount / 16;
        return { amount: toFraction(lbs), unit: 'lb' };
      } else {
        return { amount: toFraction(amount), unit: 'oz' };
      }
    }
    
    return { amount: toFraction(amount), unit: baseUnit };
  };

  React.useEffect(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');

    if (savedMealPlan) {
      const days: Day[] = JSON.parse(savedMealPlan);
      const rawIngredients: Array<{ name: string; amount: number; unit: string }> = [];

      // First pass: collect all ingredients
      days.flatMap(day => day.meals).forEach((meal: Meal) => {
        if (meal.ingredients) {
          meal.ingredients.forEach((ingredient) => {
            // Skip if this looks like a cooking instruction rather than an ingredient
            if (isInstruction(ingredient.name)) {
              return;
            }

            // Use the cleaning function to get a clean ingredient name
            const cleanName = getCleanedIngredientName(ingredient.name);
            
            // Skip if the cleaned name is too short or empty
            if (cleanName.length < 2) {
              return;
            }
            
            const recipeId = `recipe-${meal.id.split('-').pop()}`;
            const adjustedAmountStr = adjustQuantity(ingredient.amount, meal.servings, recipeId);
            const adjustedAmount = parseFloat(adjustedAmountStr);

            if (!isNaN(adjustedAmount)) {
              rawIngredients.push({
                name: cleanName,
                amount: adjustedAmount,
                unit: ingredient.unit.toLowerCase().trim()
              });
            }
          });
        }
      });

      // Second pass: group and combine similar ingredients
      const consolidatedIngredients: Record<string, { name: string; amount: number; unit: string }> = {};

      rawIngredients.forEach(ingredient => {
        let foundMatch = false;
        
        // Check if this ingredient should be combined with an existing one
        for (const [key, existing] of Object.entries(consolidatedIngredients)) {
          if (shouldCombineIngredients(ingredient.name, existing.name)) {
            // Convert both to common units and add
            const convertedExisting = convertToCommonUnit(existing.amount, existing.unit);
            const convertedNew = convertToCommonUnit(ingredient.amount, ingredient.unit);
            
            // Only combine if they convert to the same base unit
            if (convertedExisting.unit === convertedNew.unit) {
              const totalAmount = convertedExisting.amount + convertedNew.amount;
              const friendly = convertToFriendlyUnit(totalAmount, convertedExisting.unit);
              
              consolidatedIngredients[key] = {
                name: existing.name, // Keep the first name encountered
                amount: parseFloat(friendly.amount),
                unit: friendly.unit
              };
              foundMatch = true;
              break;
            }
          }
        }
        
        if (!foundMatch) {
          // Create a new entry
          const key = `${ingredient.name}-${Date.now()}-${Math.random()}`;
          consolidatedIngredients[key] = ingredient;
        }
      });

      // Convert to final grocery list format
      const finalList = Object.values(consolidatedIngredients)
        .map(item => ({
          name: item.name,
          amount: toFraction(item.amount),
          unit: item.unit,
          checked: false
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setGroceryList(finalList);
    }
  }, [adjustQuantity]);

  const toggleItem = (index: number) => {
    setGroceryList(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Planner
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2 text-primary-500" />
          Weekly Grocery List
        </h1>
      </div>

      {groceryList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No ingredients found in your meal plan.</p>
          <p className="text-sm mt-2">Add some meals to your weekly plan to generate a grocery list.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groceryList.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(index)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.amount} {item.unit && item.unit.trim() !== '' ? `${item.unit} ` : ''}{item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroceryListPage;