import React from 'react';
import { ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
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
  getIngredientCategory,
  getShortRecipeName,
  getMealTypeColor
} from '../utils/groceryListUtils';

interface RecipeTag {
  id: string;
  name: string;
  mealType: string;
  dayName: string;
}

interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  category: string;
  recipeTags: RecipeTag[];
}

function GroceryListPage() {
  const navigate = useNavigate();
  const { adjustQuantity } = useServings();
  const [groceryList, setGroceryList] = React.useState<GroceryItem[]>([]);

  React.useEffect(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');

    if (savedMealPlan) {
      const days: Day[] = JSON.parse(savedMealPlan);
      const rawIngredients: Array<{ 
        name: string; 
        amount: number; 
        unit: string; 
        recipeTag: RecipeTag;
      }> = [];

      // First pass: collect all ingredients with their recipe tags
      days.forEach(day => {
        day.meals.forEach((meal: Meal) => {
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
                  unit: ingredient.unit.toLowerCase().trim(),
                  recipeTag: {
                    id: recipeId,
                    name: getShortRecipeName(meal.name),
                    mealType: meal.type,
                    dayName: day.name
                  }
                });
              }
            });
          }
        });
      });

      // Second pass: group and combine similar ingredients while preserving recipe tags
      const consolidatedIngredients: Record<string, { 
        name: string; 
        amount: number; 
        unit: string; 
        recipeTags: RecipeTag[];
      }> = {};

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
                unit: friendly.unit,
                recipeTags: [...existing.recipeTags, ingredient.recipeTag]
              };
              foundMatch = true;
              break;
            }
          }
        }
        
        if (!foundMatch) {
          // Create a new entry
          const key = `${ingredient.name}-${Date.now()}-${Math.random()}`;
          consolidatedIngredients[key] = {
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            recipeTags: [ingredient.recipeTag]
          };
        }
      });

      // Convert to final grocery list format with categories and deduplicated recipe tags
      const finalList = Object.values(consolidatedIngredients)
        .map(item => {
          // Remove duplicate recipe tags (same recipe ID)
          const uniqueRecipeTags = item.recipeTags.filter((tag, index, array) => 
            array.findIndex(t => t.id === tag.id) === index
          );

          return {
            name: item.name,
            amount: toFraction(item.amount),
            unit: normalizeUnit(item.unit), // Apply final unit normalization
            checked: false,
            category: getIngredientCategory(item.name),
            recipeTags: uniqueRecipeTags
          };
        });

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

  const handleRecipeClick = (recipeId: string) => {
    const numericId = recipeId.replace('recipe-', '');
    navigate(`/recipe/${numericId}`);
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
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
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
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {category}
              </h2>
              <div className="space-y-2">
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
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(globalIndex)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className={`text-lg ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            <span className="font-medium">
                              {item.amount} {item.unit && item.unit.trim() !== '' ? `${item.unit} ` : ''}{item.name}
                            </span>
                          </div>
                          
                          {item.recipeTags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.recipeTags.map((tag, tagIndex) => (
                                <button
                                  key={`${tag.id}-${tagIndex}`}
                                  onClick={() => handleRecipeClick(tag.id)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80 ${getMealTypeColor(tag.mealType)}`}
                                  title={`${tag.name} - ${tag.dayName} ${tag.mealType}`}
                                >
                                  <span>{tag.name}</span>
                                  <span className="text-xs opacity-75">({tag.dayName.slice(0, 3)})</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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