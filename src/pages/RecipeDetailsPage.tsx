import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Utensils, Minus, Plus } from 'lucide-react';
import { getRecipeDetails } from '../services/spoonacular';
import { SpoonacularRecipe } from '../types';
import { useServings } from '../contexts/ServingsContext';
import { useMeasurement } from '../contexts/MeasurementContext';

function RecipeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<SpoonacularRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { mealServings, setMealServings, globalServings, adjustQuantity } = useServings();
  const { convertUnit } = useMeasurement();

  const recipeId = id ? `recipe-${id}` : '';
  const currentServings = recipeId ? (mealServings[recipeId] || globalServings) : globalServings;

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const data = await getRecipeDetails(parseInt(id));
        setRecipe(data);
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleServingsChange = (newServings: number) => {
    if (recipeId) {
      setMealServings(recipeId, newServings);
    }
  };

  // Helper function to clean ingredient names by removing embedded amounts and units
  const cleanIngredientName = (name: string) => {
    // Remove common patterns like "1 cup of", "2 tablespoons", "1/2 teaspoon", etc.
    // This regex removes numbers, fractions, and common units from the beginning of ingredient names
    return name
      .replace(/^\d+(\s*\/\s*\d+)?\s*(cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|cans?|cloves?)\s*(of\s+)?/i, '')
      .replace(/^\d+(\s*\/\s*\d+)?\s+/, '') // Remove any remaining numbers at the start
      .trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Recipe not found</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 btn-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Planner
        </button>
      </div>
    );
  }

  const adjustedCalories = adjustQuantity(recipe.calories, recipe.servings, recipeId);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 btn-secondary"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Planner
      </button>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-[300px] object-cover rounded-lg shadow-md"
          />
        </div>

        <div className="md:w-1/2">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">{recipe.title}</h1>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
              <div className="flex-1">
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                  Adjust Servings
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleServingsChange(Math.max(1, currentServings - 1))}
                    className="p-2 rounded bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-12 text-center font-medium">{currentServings}</span>
                  <button
                    onClick={() => handleServingsChange(currentServings + 1)}
                    className="p-2 rounded bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary-600" />
              <span className="block text-sm text-gray-600">Prep Time</span>
              <span className="block font-medium">{recipe.readyInMinutes} min</span>
            </div>
            <div className="text-center p-3 bg-primary-50 rounded-lg">
              <Utensils className="w-5 h-5 mx-auto mb-1 text-primary-600" />
              <span className="block text-sm text-gray-600">Calories</span>
              <span className="block font-medium">{adjustedCalories}</span>
            </div>
          </div>

          {recipe.cuisines.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Cuisine</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.cuisines.map((cuisine, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-terra-100 text-terra-700 rounded-full text-sm"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => {
                const adjustedAmount = adjustQuantity(ingredient.amount, recipe.servings, recipeId);
                const cleanName = cleanIngredientName(ingredient.name);
                
                // Convert the adjusted amount and unit to the selected measurement system DURING generation
                const adjustedAmountNum = parseFloat(adjustedAmount);
                const converted = convertUnit(adjustedAmountNum, ingredient.unit);
                
                return (
                  <li 
                    key={index}
                    className="flex items-center text-gray-700"
                  >
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                    {converted.amount} {converted.unit} {cleanName}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <li 
                  key={index}
                  className="flex gap-4 text-gray-700"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetailsPage;