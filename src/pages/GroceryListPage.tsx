import React from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Day, Meal } from '../types';
import { useServings } from '../contexts/ServingsContext';

interface GroceryItem {
  name: string;
  amount: string;
  unit: string;
  recipes: string[];
}

function GroceryListPage() {
  const navigate = useNavigate();
  const { adjustQuantity } = useServings();
  const [groceryList, setGroceryList] = React.useState<GroceryItem[]>([]);

  React.useEffect(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');
    if (savedMealPlan) {
      const days: Day[] = JSON.parse(savedMealPlan);
      const ingredients: Record<string, GroceryItem> = {};

      // Helper function to clean ingredient names
      const cleanIngredientName = (name: string) => {
        return name
          .replace(/^\d+(\s*\/\s*\d+)?\s*(cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|cans?|cloves?)\s*(of\s+)?/i, '')
          .replace(/^\d+(\s*\/\s*\d+)?\s+/, '')
          .trim()
          .toLowerCase();
      };

      // Collect all meals from the week
      const meals = days.flatMap(day => day.meals);

      // Process each meal's ingredients
      meals.forEach((meal: Meal) => {
        if (meal.ingredients) {
          meal.ingredients.forEach(ingredient => {
            const cleanName = cleanIngredientName(ingredient.name);
            const recipeId = `recipe-${meal.id.split('-').pop()}`;
            
            if (!ingredients[cleanName]) {
              ingredients[cleanName] = {
                name: cleanName,
                amount: adjustQuantity(ingredient.amount, meal.servings, recipeId),
                unit: ingredient.unit,
                recipes: [meal.name]
              };
            } else {
              // Add recipe name if not already included
              if (!ingredients[cleanName].recipes.includes(meal.name)) {
                ingredients[cleanName].recipes.push(meal.name);
              }
            }
          });
        }
      });

      // Convert to array and sort alphabetically
      const sortedList = Object.values(ingredients).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setGroceryList(sortedList);
    }
  }, [adjustQuantity]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
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
          <div className="grid gap-4">
            {groceryList.map((item, index) => (
              <div 
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 capitalize">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Used in: {item.recipes.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-primary-600">
                      {item.amount} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GroceryListPage;