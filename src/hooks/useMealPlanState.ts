import { useState, useEffect } from 'react';
import { Day, DragResult, Meal } from '../types';
import { createEmptyWeek } from '../data/initialData';
import { getRandomRecipes, getRecipeDetails } from '../services/spoonacular';
import { useDietary } from '../contexts/DietaryContext';

export const useMealPlanState = () => {
  const { getSpoonacularParams, isRecipeAllowed } = useDietary();
  const [days, setDays] = useState<Day[]>(() => {
    const saved = localStorage.getItem('mealPlan');
    return saved ? JSON.parse(saved) : createEmptyWeek();
  });
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetWeek = () => {
    setDays(createEmptyWeek());
    setApiError(null);
  };

  const createMealFromRecipe = async (recipe: any, dayId: string, mealType: string, category: 'main' | 'side' = 'main') => {
    // CRITICAL: Double-check that this recipe is allowed before creating the meal
    if (!isRecipeAllowed(recipe.title)) {
      console.error(`🚫 BLOCKED: Recipe "${recipe.title}" violates dietary restrictions`);
      throw new Error(`Recipe "${recipe.title}" contains forbidden ingredients`);
    }

    // Fetch full recipe details to get ingredients
    const fullRecipe = await getRecipeDetails(recipe.id);
    
    // Additional check with full ingredient list
    if (fullRecipe?.ingredients) {
      const ingredientNames = fullRecipe.ingredients.map(ing => ing.name);
      if (!isRecipeAllowed(recipe.title, ingredientNames)) {
        console.error(`🚫 BLOCKED: Recipe "${recipe.title}" has forbidden ingredients in detailed list`);
        throw new Error(`Recipe "${recipe.title}" contains forbidden ingredients in ingredient list`);
      }
    }
    
    const meal: Meal = {
      id: `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${Date.now()}`, // Use timestamp for unique ID
      recipeId: recipe.id, // Store the actual Spoonacular recipe ID separately - this is critical!
      name: recipe.title,
      type: mealType as 'breakfast' | 'lunch' | 'dinner',
      category,
      cuisine: recipe.cuisines[0] || 'Various',
      prepTime: recipe.readyInMinutes,
      servings: recipe.servings,
      calories: recipe.calories,
      image: recipe.image,
      ingredients: fullRecipe?.ingredients || []
    };

    console.log('✅ Created APPROVED meal with recipeId:', meal.recipeId, 'for recipe:', recipe.title);
    return meal;
  };

  const autofillCalendar = async () => {
    setIsAutofilling(true);
    setApiError(null);
    try {
      const newDays = createEmptyWeek();
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      const dietaryParams = getSpoonacularParams();
      
      console.log('🚀 Starting autofill with dietary params:', dietaryParams);
      
      for (const day of newDays) {
        for (const mealType of mealTypes) {
          try {
            // Add main dish with STRICT filtering
            const mainRecipes = await getRandomRecipes(mealType, 'main', dietaryParams, isRecipeAllowed);
            if (mainRecipes.length > 0) {
              const recipe = mainRecipes[0];
              const newMeal = await createMealFromRecipe(recipe, day.id, mealType, 'main');
              day.meals.push(newMeal);

              // Add side dishes for lunch and dinner with STRICT filtering
              if (mealType !== 'breakfast') {
                const sideRecipes = await getRandomRecipes(mealType, 'side', dietaryParams, isRecipeAllowed);
                if (sideRecipes.length > 0) {
                  const sideRecipe = sideRecipes[0];
                  const sideMeal = await createMealFromRecipe(sideRecipe, day.id, mealType, 'side');
                  day.meals.push(sideMeal);
                }
              }
            } else {
              console.warn(`⚠️ No suitable ${mealType} recipes found for ${day.name} with current dietary restrictions`);
            }
          } catch (error) {
            console.error(`Error adding ${mealType} for ${day.name}:`, error);
            // Continue with other meals even if one fails
          }
        }
      }
      setDays(newDays);
    } catch (error) {
      console.error('Error autofilling calendar:', error);
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        setApiError('Spoonacular API quota exceeded. Please try again later or contact support for assistance.');
      } else {
        setApiError('Failed to generate meal plan. Please try again later.');
      }
    } finally {
      setIsAutofilling(false);
    }
  };

  const fetchRandomRecipe = async (dayId: string, mealType: string, category: 'main' | 'side' = 'main') => {
    try {
      const dietaryParams = getSpoonacularParams();
      console.log('🔍 Fetching single recipe with dietary params:', dietaryParams);
      
      const recipes = await getRandomRecipes(mealType, category, dietaryParams, isRecipeAllowed);
      if (recipes.length > 0) {
        const recipe = recipes[0];
        const newMeal = await createMealFromRecipe(recipe, dayId, mealType, category);

        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: [...day.meals, newMeal]
                }
              : day
          )
        );
      } else {
        console.warn(`⚠️ No suitable ${category} ${mealType} recipes found with current dietary restrictions`);
        setApiError(`No suitable ${mealType} recipes found that match your dietary restrictions. Try adjusting your filters or try again.`);
      }
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        setApiError('Spoonacular API quota exceeded. Please try again later or contact support for assistance.');
      } else if (error instanceof Error && error.message.includes('forbidden ingredients')) {
        setApiError('Recipe was blocked due to dietary restrictions. Trying again...');
        // Automatically retry once
        setTimeout(() => fetchRandomRecipe(dayId, mealType, category), 1000);
      } else {
        setApiError('Failed to fetch recipe. Please try again.');
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(days));
  }, [days]);

  const handleDragEnd = (result: DragResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const [sourceDay, sourceMealType] = source.droppableId.split('-');
    const [destDay, destMealType] = destination.droppableId.split('-');

    const newDays = JSON.parse(JSON.stringify(days)) as Day[];

    const sourceDayObj = newDays.find(day => day.id === sourceDay);
    const destDayObj = newDays.find(day => day.id === destDay);

    if (!sourceDayObj || !destDayObj) return;

    const sourceMeals = sourceDayObj.meals.filter(meal => meal.type === sourceMealType);
    const mealToMove = { ...sourceMeals[source.index] };

    if (sourceMealType !== destMealType) {
      mealToMove.type = destMealType as 'breakfast' | 'lunch' | 'dinner';
      fetchRandomRecipe(destDay, destMealType, mealToMove.category);
      return;
    }

    sourceDayObj.meals = sourceDayObj.meals.filter(meal => meal.id !== mealToMove.id);
    destDayObj.meals.push(mealToMove);

    destDayObj.meals.sort((a, b) => {
      const typeOrder = { breakfast: 0, lunch: 1, dinner: 2 };
      const categoryOrder = { main: 0, side: 1 };
      const typeComparison = typeOrder[a.type] - typeOrder[b.type];
      return typeComparison === 0 ? categoryOrder[a.category] - categoryOrder[b.category] : typeComparison;
    });

    setDays(newDays);
  };

  const getListStyle = (isDraggingOver: boolean) => {
    return `rounded-lg min-h-[80px] transition-colors ${
      isDraggingOver ? 'bg-primary-50' : 'bg-gray-50'
    }`;
  };

  return { 
    days, 
    handleDragEnd, 
    getListStyle, 
    fetchRandomRecipe, 
    autofillCalendar,
    isAutofilling,
    resetWeek,
    apiError
  };
};