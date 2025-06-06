import { useState, useEffect } from 'react';
import { Day, DragResult, Meal } from '../types';
import { createEmptyWeek } from '../data/initialData';
import { getRandomRecipes, getRecipeDetails } from '../services/spoonacular';

export const useMealPlanState = () => {
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
    // Fetch full recipe details to get ingredients
    const fullRecipe = await getRecipeDetails(recipe.id);
    
    return {
      id: `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${recipe.id}`,
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
  };

  const autofillCalendar = async () => {
    setIsAutofilling(true);
    setApiError(null);
    try {
      const newDays = createEmptyWeek();
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      
      for (const day of newDays) {
        for (const mealType of mealTypes) {
          // Add main dish
          const mainRecipes = await getRandomRecipes(mealType, 'main');
          if (mainRecipes.length > 0) {
            const recipe = mainRecipes[0];
            const newMeal = await createMealFromRecipe(recipe, day.id, mealType, 'main');
            day.meals.push(newMeal);

            // Add side dishes for lunch and dinner
            if (mealType !== 'breakfast') {
              const sideRecipes = await getRandomRecipes(mealType, 'side');
              if (sideRecipes.length > 0) {
                const sideRecipe = sideRecipes[0];
                const sideMeal = await createMealFromRecipe(sideRecipe, day.id, mealType, 'side');
                day.meals.push(sideMeal);
              }
            }
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
      const recipes = await getRandomRecipes(mealType, category);
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
      }
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        setApiError('Spoonacular API quota exceeded. Please try again later or contact support for assistance.');
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