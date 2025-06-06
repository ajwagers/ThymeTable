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
      'cans?', 'cloves?', 'ml', 'liters?', 'grams?', 'kg', 'blocks?', 'bunches?', 'bunch', 'heads?', 'head'
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

  React.useEffect(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');

    if (savedMealPlan) {
      const days: Day[] = JSON.parse(savedMealPlan);
      const ingredients: Record<string, GroceryItem> = {};

      // Process each meal's ingredients
      days.flatMap(day => day.meals).forEach((meal: Meal) => {
        if (meal.ingredients) {
          meal.ingredients.forEach((ingredient) => {
            // Skip if this looks like a cooking instruction rather than an ingredient
            if (isInstruction(ingredient.name)) {
              return;
            }

            // Use the new cleaning function to get a clean ingredient name
            const cleanName = getCleanedIngredientName(ingredient.name);
            
            // Skip if the cleaned name is too short or empty
            if (cleanName.length < 2) {
              return;
            }
            
            const unit = ingredient.unit.toLowerCase().trim();
            const key = `${cleanName}-${unit}`; // Compound key of name-unit
            const recipeId = `recipe-${meal.id.split('-').pop()}`;
            const adjustedAmountStr = adjustQuantity(ingredient.amount, meal.servings, recipeId);
            const adjustedAmount = parseFloat(adjustedAmountStr);

            if (key in ingredients) {
              const existingAmountStr = ingredients[key].amount;
              const existingAmount = parseFloat(existingAmountStr);

              if (!isNaN(existingAmount) && !isNaN(adjustedAmount)) {
                // Both amounts are numbers, we can add them
                ingredients[key].amount = (existingAmount + adjustedAmount).toString();
              } else {
                // If either is not a number, keep the latest amount string
                ingredients[key].amount = adjustedAmountStr;
              }
            } else {
              ingredients[key] = {
                name: cleanName,
                amount: adjustedAmountStr,
                unit,
                checked: false
              };
            }
          });
        }
      });

      // Convert to array and sort alphabetically
      const sortedList = Object.values(ingredients)
        .sort((a, b) => a.name.localeCompare(b.name));

      setGroceryList(sortedList);
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
                {item.amount} {item.unit} {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroceryListPage;