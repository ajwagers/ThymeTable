import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Utensils, Minus, Plus, Heart, ExternalLink } from 'lucide-react';
import { getRecipeDetails } from '../services/spoonacular';
import { SpoonacularRecipe } from '../types';
import { useServings } from '../contexts/ServingsContext';
import { useMeasurement } from '../contexts/MeasurementContext';
import { useFavorites } from '../contexts/FavoritesContext';

function RecipeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<SpoonacularRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mealServings, setMealServings, globalServings, adjustQuantity } = useServings();
  const { convertUnit, system } = useMeasurement();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const recipeId = id ? `recipe-${id}` : '';
  const currentServings = recipeId ? (mealServings[recipeId] || globalServings) : globalServings;
  const numericRecipeId = id ? parseInt(id) : null;
  const isRecipeFavorited = numericRecipeId ? isFavorite(numericRecipeId) : false;

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError('No recipe ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching recipe details for ID:', id);
        const numericId = parseInt(id);
        
        if (isNaN(numericId)) {
          throw new Error('Invalid recipe ID format');
        }

        // Check if this is a user-created recipe (negative ID)
        if (numericId < 0) {
          // Try to find the recipe in localStorage meal plan data
          const savedMealPlan = localStorage.getItem('mealPlan');
          if (savedMealPlan) {
            const days = JSON.parse(savedMealPlan);
            let foundRecipe = null;
            
            // Search through all days and meals to find the recipe
            for (const day of days) {
              for (const meal of day.meals) {
                if (meal.recipeId === numericId) {
                  // Use the stored recipe data if available, otherwise construct from meal data
                  if (meal.recipeData) {
                    foundRecipe = {
                      ...meal.recipeData,
                      // Ensure we have a placeholder image if none exists
                      image: meal.recipeData.image || '/No Image.png'
                    };
                  } else {
                    // Fallback to constructing from meal data
                  foundRecipe = {
                    id: numericId,
                    title: meal.name,
                    readyInMinutes: meal.readyInMinutes || 30,
                    servings: meal.servings || 4,
                    calories: meal.calories || 300,
                      image: meal.image || '/No Image.png',
                    cuisines: meal.cuisines || [],
                    instructions: meal.instructions || [],
                    ingredients: meal.ingredients || [],
                    dishTypes: meal.dishTypes || [],
                    isUserCreated: true
                  };
                  }
                  break;
                }
              }
              if (foundRecipe) break;
            }
            
            if (foundRecipe) {
              console.log('Found user recipe:', foundRecipe);
              console.log('Recipe ingredients:', foundRecipe.ingredients);
              // Process ingredients for display
              const processedIngredients = (foundRecipe.ingredients || []).map(ingredient => {
                // Ensure ingredient has the required structure
                const processedIngredient = {
                  name: ingredient.name || '',
                  amount: ingredient.amount || 0,
                  unit: ingredient.unit || '',
                  originalAmount: ingredient.amount || 0,
                  originalUnit: ingredient.unit || '',
                };
                console.log('Processed ingredient:', processedIngredient);
                return processedIngredient;
              });

              setRecipe({
                ...foundRecipe,
                ingredients: processedIngredients
              });
              console.log('Set recipe with ingredients:', processedIngredients);
              setLoading(false);
              return;
            }
          }
          
          throw new Error('User-created recipe not found');
        }
        const data = await getRecipeDetails(numericId);
        
        if (!data) {
          throw new Error('Recipe not found');
        }

        console.log('Successfully fetched recipe:', data.title);
        
        if (data.ingredients) {
          // Store original amounts for conversion calculations
          const processedIngredients = data.ingredients.map(ingredient => {
            const processedIngredient = {
              ...ingredient,
              originalAmount: ingredient.amount,
              originalUnit: ingredient.unit,
            };
            return processedIngredient;
          });

          setRecipe({
            ...data,
            ingredients: processedIngredients
          });
        } else {
          setRecipe(data);
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Handle measurement system changes and serving adjustments
  useEffect(() => {
    if (recipe?.ingredients) {
      console.log('Processing ingredients for measurement/serving changes:', recipe.ingredients);
      const updatedIngredients = recipe.ingredients.map(ingredient => {
        const originalAmount = ingredient.originalAmount || ingredient.amount;
        const originalUnit = ingredient.originalUnit || ingredient.unit;
        
        // First adjust for servings
        const adjustedAmount = adjustQuantity(originalAmount, recipe.servings, recipeId);
        
        // Then convert units
        const converted = convertUnit(parseFloat(adjustedAmount), originalUnit);
        
        const updatedIngredient = {
          ...ingredient,
          amount: converted.amount,
          unit: converted.unit,
        };
        return updatedIngredient;
      });

      console.log('Updated ingredients after processing:', updatedIngredients);
      setRecipe(prev => prev ? {
        ...prev,
        ingredients: updatedIngredients
      } : null);
    }
  }, [system, convertUnit, currentServings, recipe?.servings, recipeId, adjustQuantity]);

  const handleServingsChange = (newServings: number) => {
    if (recipeId) {
      setMealServings(recipeId, newServings);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!recipe || !numericRecipeId) return;

    try {
      if (isRecipeFavorited) {
        await removeFromFavorites(numericRecipeId);
      } else {
        await addToFavorites(recipe);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Planner
        </button>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Planner
        </button>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{error || 'Recipe not found'}</p>
          <p className="text-sm text-gray-500">Recipe ID: {id}</p>
        </div>
      </div>
    );
  }

  const adjustedCalories = adjustQuantity(recipe.calories, recipe.servings, recipeId);

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
        
        <button
          onClick={handleFavoriteToggle}
          className={`btn-secondary ${
            isRecipeFavorited 
              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
              : 'hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-4 h-4 mr-2 ${isRecipeFavorited ? 'fill-current' : ''}`} />
          {isRecipeFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>

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

          {recipe.cuisines && recipe.cuisines.length > 0 && (
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
            {console.log('Rendering ingredients:', recipe.ingredients)}
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => {
                const cleanName = cleanIngredientName(ingredient.name);
                console.log(`Rendering ingredient ${index}:`, ingredient, 'Clean name:', cleanName);
                return (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                    {ingredient.amount} {ingredient.unit ? `${ingredient.unit} ` : ''}{cleanName}
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