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

  React.useEffect(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');

    if (savedMealPlan) {
      const days: Day[] = JSON.parse(savedMealPlan);
      const ingredients: Record<string, GroceryItem> = {};

      // Process each meal's ingredients
      days.flatMap(day => day.meals).forEach((meal: Meal) => {
        if (meal.ingredients) {
          meal.ingredients.forEach((ingredient) => {
            // Use the original name from Spoonacular, just trimmed and lowercased for consistency
            const name = ingredient.name.trim().toLowerCase();
            const unit = ingredient.unit.toLowerCase().trim();
            const key = `${name}-${unit}`; // Compound key of name-unit
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
                name,
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