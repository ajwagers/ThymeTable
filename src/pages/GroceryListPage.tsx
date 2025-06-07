import React from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Day, Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';
import {
  toFraction,
  isInstruction,
  getCleanedIngredientName,
  normalizeIngredientName,
  normalizeUnit,
  shouldCombineIngredients,
  convertToCommonUnit,
  convertToFriendlyUnit,
  getIngredientCategory
} from '../utils/groceryListUtils';

interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  category: string;
}

function GroceryListPage() {
  const navigate = useNavigate();
  const { adjustQuantity } = useServings();
  const [groceryList, setGroceryList] = React.useState<GroceryItem[]>([]);

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

      // Convert to final grocery list format with categories
      const finalList = Object.values(consolidatedIngredients)
        .map(item => ({
          name: item.name,
          amount: toFraction(item.amount),
          unit: normalizeUnit(item.unit), // Apply final unit normalization
          checked: false,
          category: getIngredientCategory(item.name)
        }));

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

  // Group items by category and sort
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    
    groceryList.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    // Sort categories and items within each category
    const sortedGroups: Array<{ category: string; items: GroceryItem[] }> = [];
    
    // Define category order for better shopping experience
    const categoryOrder = [
      'Produce',
      'Meat & Seafood',
      'Dairy & Refrigerated',
      'Frozen',
      'Pantry & Dry Goods',
      'Canned & Jarred',
      'Baked Goods',
      'Beverages',
      'Snacks',
      'Household',
      'Other'
    ];

    categoryOrder.forEach(category => {
      if (groups[category] && groups[category].length > 0) {
        sortedGroups.push({
          category,
          items: groups[category].sort((a, b) => a.name.localeCompare(b.name))
        });
      }
    });

    // Add any remaining categories not in the predefined order
    Object.keys(groups).forEach(category => {
      if (!categoryOrder.includes(category) && groups[category].length > 0) {
        sortedGroups.push({
          category,
          items: groups[category].sort((a, b) => a.name.localeCompare(b.name))
        });
      }
    });

    return sortedGroups;
  }, [groceryList]);

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
        <div className="space-y-6">
          {groupedItems.map(({ category, items }) => (
            <div key={category} className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {category}
              </h2>
              <div className="space-y-1">
                {items.map((item, index) => {
                  // Calculate global index for the toggle function
                  const globalIndex = groceryList.findIndex(
                    globalItem => globalItem.name === item.name && 
                                 globalItem.amount === item.amount && 
                                 globalItem.unit === item.unit
                  );
                  
                  return (
                    <div 
                      key={`${item.name}-${item.amount}-${item.unit}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(globalIndex)}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.amount} {item.unit && item.unit.trim() !== '' ? `${item.unit} ` : ''}{item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroceryListPage;