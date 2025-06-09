import React from 'react';
import { ArrowLeft, ShoppingCart, ExternalLink, Printer, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Day, Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';
import { useMeasurement } from '../contexts/MeasurementContext';
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
  const { convertUnit } = useMeasurement();
  const [groceryList, setGroceryList] = React.useState<GroceryItem[]>([]);
  const [isPrintMode, setIsPrintMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const generateGroceryList = async () => {
      setIsLoading(true);
      
      // Add a small delay to show the loading animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
                
                // Step 1: Adjust for servings first
                const adjustedAmountStr = adjustQuantity(ingredient.amount, meal.servings, recipeId);
                const adjustedAmount = parseFloat(adjustedAmountStr);

                if (!isNaN(adjustedAmount)) {
                  // Step 2: Apply measurement conversion to the adjusted amount
                  const converted = convertUnit(adjustedAmount, ingredient.unit);
                  
                  rawIngredients.push({
                    name: cleanName,
                    amount: parseFloat(converted.amount),
                    unit: converted.unit.toLowerCase().trim(),
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
      
      setIsLoading(false);
    };

    generateGroceryList();
  }, [adjustQuantity, convertUnit]);

  const toggleItem = (index: number) => {
    setGroceryList(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setGroceryList(prev => prev.filter((_, i) => i !== index));
  };

  const handleRecipeClick = (recipeId: string) => {
    const numericId = recipeId.replace('recipe-', '');
    navigate(`/recipe/${numericId}`);
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
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

  if (isPrintMode) {
    return (
      <div className="print:block hidden">
        <style>{`
          @media print {
            body { font-size: 12px; }
            header { display: none !important; }
            .print-header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; }
            .print-category { font-weight: bold; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px solid #ccc; }
            .print-item { margin: 3px 0; display: flex; align-items: center; }
            .print-checkbox { width: 12px; height: 12px; border: 1px solid #000; margin-right: 8px; }
            .print-amount { font-weight: bold; margin-right: 5px; }
          }
        `}</style>
        <div className="max-w-4xl mx-auto p-4">
          <div className="print-header">
            <h1 className="text-2xl font-bold">Weekly Grocery List</h1>
            <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          {groupedItems.map(({ category, items }) => (
            <div key={category} className="mb-4">
              <h2 className="print-category text-lg">{category}</h2>
              {items.map((item, index) => (
                <div key={`${item.name}-${item.amount}-${item.unit}`} className="print-item">
                  <div className="print-checkbox"></div>
                  <span className="print-amount">
                    {item.amount} {item.unit && item.unit.trim() !== '' ? `${item.unit} ` : ''}
                  </span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4 mx-auto"></div>
              <ShoppingCart className="w-6 h-6 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Grocery List</h2>
            <p className="text-gray-600">Analyzing your meal plan and organizing ingredients...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6 print:shadow-none print:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
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
        <button
          onClick={handlePrint}
          className="btn-primary"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print List
        </button>
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
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
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
                        <button
                          onClick={() => removeItem(globalIndex)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Remove ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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