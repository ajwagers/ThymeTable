import { useState, useEffect } from 'react';
import { Day, DragResult, Meal } from '../types';
import { createEmptyWeek } from '../data/initialData';
import { getRandomRecipes, getRecipeDetails } from '../services/spoonacular';
import { useDietary } from '../contexts/DietaryContext';
import { useFavorites } from '../contexts/FavoritesContext';

export const useMealPlanState = () => {
  const { getSpoonacularParams, isRecipeAllowed } = useDietary();
  const { favorites } = useFavorites();
  const [days, setDays] = useState<Day[]>(() => {
    const saved = localStorage.getItem('mealPlan');
    return saved ? JSON.parse(saved) : createEmptyWeek();
  });
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingRecipes, setLoadingRecipes] = useState<Set<string>>(new Set());

  const resetWeek = () => {
    setDays(createEmptyWeek());
    setApiError(null);
  };

  const setRecipeLoading = (recipeKey: string, isLoading: boolean) => {
    setLoadingRecipes(prev => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(recipeKey);
      } else {
        newSet.delete(recipeKey);
      }
      return newSet;
    });
  };

  const isRecipeLoading = (recipeKey: string) => {
    return loadingRecipes.has(recipeKey);
  };

  const createMealFromRecipe = async (recipe: any, dayId: string, mealType: string, category: 'main' | 'side' = 'main'): Promise<Meal | null> => {
    try {
      // CRITICAL: Double-check that this recipe is allowed before creating the meal
      if (!isRecipeAllowed(recipe.title)) {
        console.log(`🚫 SKIPPED: Recipe "${recipe.title}" violates dietary restrictions`);
        return null;
      }

      // Fetch full recipe details to get ingredients
      const fullRecipe = await getRecipeDetails(recipe.id);
      
      // Additional check with full ingredient list
      if (fullRecipe?.ingredients) {
        const ingredientNames = fullRecipe.ingredients.map(ing => ing.name);
        if (!isRecipeAllowed(recipe.title, ingredientNames)) {
          console.log(`🚫 SKIPPED: Recipe "${recipe.title}" has forbidden ingredients in detailed list`);
          return null;
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
    } catch (error) {
      console.log(`🚫 ERROR creating meal from recipe "${recipe.title}":`, error);
      return null;
    }
  };

  const createMealFromFavorite = async (favorite: any, dayId: string, mealType: string, category: 'main' | 'side' = 'main'): Promise<Meal | null> => {
    try {
      const recipe = favorite.recipe_data;
      
      // Check if this favorite recipe is still allowed with current dietary restrictions
      if (!isRecipeAllowed(recipe.title)) {
        console.log(`🚫 SKIPPED: Favorite recipe "${recipe.title}" violates current dietary restrictions`);
        return null;
      }

      const meal: Meal = {
        id: `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${Date.now()}`,
        recipeId: recipe.id,
        name: recipe.title,
        type: mealType as 'breakfast' | 'lunch' | 'dinner',
        category,
        cuisine: recipe.cuisines?.[0] || 'Various',
        prepTime: recipe.readyInMinutes,
        servings: recipe.servings,
        calories: recipe.calories,
        image: recipe.image,
        ingredients: recipe.ingredients || []
      };

      console.log('✅ Created meal from favorite with recipeId:', meal.recipeId, 'for recipe:', recipe.title);
      return meal;
    } catch (error) {
      console.log(`🚫 ERROR creating meal from favorite "${favorite.recipe_title}":`, error);
      return null;
    }
  };

  const createMealFromUserRecipe = async (recipe: any, dayId: string, mealType: string, category: 'main' | 'side' = 'main'): Promise<Meal> => {
    const meal: Meal = {
      id: `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${Date.now()}`,
      recipeId: recipe.id, // This will be a negative number for user-created recipes
      name: recipe.title,
      type: mealType as 'breakfast' | 'lunch' | 'dinner',
      category,
      cuisine: recipe.cuisines?.[0] || 'Various',
      prepTime: recipe.readyInMinutes,
      servings: recipe.servings,
      calories: recipe.calories,
      image: recipe.image || '',
      ingredients: recipe.ingredients || []
    };

    console.log('✅ Created meal from user recipe with recipeId:', meal.recipeId, 'for recipe:', recipe.title);
    return meal;
  };

  const createMealFromSearchResult = async (recipe: any, dayId: string, mealType: string, category: 'main' | 'side' = 'main'): Promise<Meal | null> => {
    try {
      // Check if this search result recipe is allowed with current dietary restrictions
      if (!isRecipeAllowed(recipe.title)) {
        console.log(`🚫 SKIPPED: Search result recipe "${recipe.title}" violates dietary restrictions`);
        return null;
      }

      // Fetch full recipe details to get ingredients
      const fullRecipe = await getRecipeDetails(recipe.id);
      
      // Additional check with full ingredient list
      if (fullRecipe?.ingredients) {
        const ingredientNames = fullRecipe.ingredients.map(ing => ing.name);
        if (!isRecipeAllowed(recipe.title, ingredientNames)) {
          console.log(`🚫 SKIPPED: Search result recipe "${recipe.title}" has forbidden ingredients in detailed list`);
          return null;
        }
      }

      const meal: Meal = {
        id: `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${Date.now()}`,
        recipeId: recipe.id,
        name: recipe.title,
        type: mealType as 'breakfast' | 'lunch' | 'dinner',
        category,
        cuisine: recipe.cuisines?.[0] || 'Various',
        prepTime: recipe.readyInMinutes,
        servings: recipe.servings,
        calories: recipe.calories,
        image: recipe.image,
        ingredients: fullRecipe?.ingredients || []
      };

      console.log('✅ Created meal from search result with recipeId:', meal.recipeId, 'for recipe:', recipe.title);
      return meal;
    } catch (error) {
      console.log(`🚫 ERROR creating meal from search result "${recipe.title}":`, error);
      return null;
    }
  };

  const createPlaceholderMeal = (dayId: string, mealType: string, category: 'main' | 'side' = 'main'): Meal => {
    const mealNames = {
      breakfast: category === 'main' ? 'Simple Breakfast' : 'Breakfast Side',
      lunch: category === 'main' ? 'Quick Lunch' : 'Lunch Side',
      dinner: category === 'main' ? 'Easy Dinner' : 'Dinner Side'
    };

    return {
      id: `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${Date.now()}`,
      name: mealNames[mealType as keyof typeof mealNames],
      type: mealType as 'breakfast' | 'lunch' | 'dinner',
      category,
      cuisine: 'Various',
      prepTime: 30,
      servings: 4,
      calories: 300,
      ingredients: []
    };
  };

  const findSuitableRecipe = async (mealType: string, category: 'main' | 'side', dietaryParams: any, maxAttempts: number = 10): Promise<Meal | null> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const recipes = await getRandomRecipes(mealType, category, dietaryParams, isRecipeAllowed);
        
        for (const recipe of recipes) {
          const meal = await createMealFromRecipe(recipe, 'temp', mealType, category);
          if (meal) {
            return meal;
          }
        }
        
        // If no suitable recipe found in this batch, try again
        console.log(`🔄 Attempt ${attempt + 1}: No suitable ${category} ${mealType} recipes found, trying again...`);
      } catch (error) {
        console.error(`Error in attempt ${attempt + 1} for ${mealType} ${category}:`, error);
      }
    }
    
    return null;
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
            // Add main dish with multiple attempts
            const mainMeal = await findSuitableRecipe(mealType, 'main', dietaryParams);
            if (mainMeal) {
              mainMeal.id = `${day.id}-${mealType}-${Date.now()}`;
              day.meals.push(mainMeal);
            } else {
              console.warn(`⚠️ No suitable ${mealType} main recipes found for ${day.name}, adding placeholder`);
              day.meals.push(createPlaceholderMeal(day.id, mealType, 'main'));
            }

            // Add side dishes for lunch and dinner with multiple attempts
            if (mealType !== 'breakfast') {
              const sideMeal = await findSuitableRecipe(mealType, 'side', dietaryParams);
              if (sideMeal) {
                sideMeal.id = `${day.id}-${mealType}-side-${Date.now()}`;
                day.meals.push(sideMeal);
              } else {
                console.warn(`⚠️ No suitable ${mealType} side recipes found for ${day.name}, adding placeholder`);
                day.meals.push(createPlaceholderMeal(day.id, mealType, 'side'));
              }
            }
          } catch (error) {
            console.error(`Error adding ${mealType} for ${day.name}:`, error);
            // Add placeholder meals to ensure slots are filled
            day.meals.push(createPlaceholderMeal(day.id, mealType, 'main'));
            if (mealType !== 'breakfast') {
              day.meals.push(createPlaceholderMeal(day.id, mealType, 'side'));
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
    const loadingKey = `${dayId}-${mealType}-${category}`;
    setRecipeLoading(loadingKey, true);
    
    try {
      const dietaryParams = getSpoonacularParams();
      console.log('🔍 Fetching single recipe with dietary params:', dietaryParams);
      
      const meal = await findSuitableRecipe(mealType, category, dietaryParams);
      
      if (meal) {
        meal.id = `${dayId}-${mealType}-${category === 'side' ? 'side-' : ''}${Date.now()}`;
        
        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: [...day.meals, meal]
                }
              : day
          )
        );
      } else {
        console.warn(`⚠️ No suitable ${category} ${mealType} recipes found with current dietary restrictions, adding placeholder`);
        const placeholderMeal = createPlaceholderMeal(dayId, mealType, category);
        
        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: [...day.meals, placeholderMeal]
                }
              : day
          )
        );
        
        setApiError(`No suitable ${mealType} recipes found that match your dietary restrictions. A placeholder meal was added instead.`);
      }
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        setApiError('Spoonacular API quota exceeded. Please try again later or contact support for assistance.');
      } else {
        setApiError('Failed to fetch recipe. Adding placeholder meal instead.');
        // Add placeholder meal as fallback
        const placeholderMeal = createPlaceholderMeal(dayId, mealType, category);
        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: [...day.meals, placeholderMeal]
                }
              : day
          )
        );
      }
    } finally {
      setRecipeLoading(loadingKey, false);
    }
  };

  const addManualRecipe = async (dayId: string, mealType: string, recipe: any) => {
    try {
      const category = 'main'; // Default to main for manual recipes
      const meal = await createMealFromUserRecipe(recipe, dayId, mealType, category);
      
      setDays(prevDays => 
        prevDays.map(day => 
          day.id === dayId
            ? {
                ...day,
                meals: [...day.meals, meal]
              }
            : day
        )
      );
      
      console.log('✅ Successfully added manual recipe');
      setApiError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error adding manual recipe:', error);
      setApiError('Failed to add manual recipe. Please try again.');
    }
  };

  const addSearchRecipe = async (dayId: string, mealType: string, recipe: any) => {
    try {
      const category = 'main'; // Default to main for search recipes
      const meal = await createMealFromSearchResult(recipe, dayId, mealType, category);
      
      if (meal) {
        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: [...day.meals, meal]
                }
              : day
          )
        );
        
        console.log('✅ Successfully added search recipe');
        setApiError(null); // Clear any previous errors
      } else {
        console.warn(`⚠️ Search recipe "${recipe.title}" violates current dietary restrictions`);
        setApiError(`The selected recipe doesn't match your current dietary restrictions.`);
      }
    } catch (error) {
      console.error('Error adding search recipe:', error);
      setApiError('Failed to add search recipe. Please try again.');
    }
  };

  const changeRecipe = async (dayId: string, mealId: string, mealType: string, category: 'main' | 'side', useRandom: boolean = true, favoriteRecipeId?: number) => {
    const loadingKey = `change-${mealId}`;
    setRecipeLoading(loadingKey, true);
    
    try {
      let newMeal: Meal | null = null;

      if (useRandom) {
        // Use random recipe generation
        const dietaryParams = getSpoonacularParams();
        console.log('🔄 Changing to random recipe with dietary params:', dietaryParams);
        
        newMeal = await findSuitableRecipe(mealType, category, dietaryParams);
        
        if (!newMeal) {
          console.warn(`⚠️ No suitable replacement ${category} ${mealType} recipes found`);
          setApiError(`No suitable replacement ${mealType} recipes found that match your dietary restrictions.`);
          return;
        }
      } else if (favoriteRecipeId) {
        // Use favorite recipe
        console.log('🔄 Changing to favorite recipe ID:', favoriteRecipeId);
        const favorite = favorites.find(fav => fav.recipe_id === favoriteRecipeId);
        
        if (!favorite) {
          console.error('Favorite recipe not found:', favoriteRecipeId);
          setApiError('Selected favorite recipe not found.');
          return;
        }
        
        newMeal = await createMealFromFavorite(favorite, dayId, mealType, category);
        
        if (!newMeal) {
          console.warn(`⚠️ Favorite recipe "${favorite.recipe_title}" violates current dietary restrictions`);
          setApiError(`The selected favorite recipe doesn't match your current dietary restrictions.`);
          return;
        }
      }
      
      if (newMeal) {
        // Use the same ID as the meal being replaced to maintain position
        newMeal.id = mealId;
        
        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: day.meals.map(meal => 
                    meal.id === mealId ? newMeal : meal
                  )
                }
              : day
          )
        );
        
        console.log('✅ Successfully replaced recipe');
        setApiError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error changing recipe:', error);
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        setApiError('Spoonacular API quota exceeded. Please try again later or contact support for assistance.');
      } else {
        setApiError('Failed to change recipe. Please try again later.');
      }
    } finally {
      setRecipeLoading(loadingKey, false);
    }
  };

  const changeRecipeToSearchResult = async (dayId: string, mealId: string, mealType: string, category: 'main' | 'side', recipe: any) => {
    const loadingKey = `change-${mealId}`;
    setRecipeLoading(loadingKey, true);
    
    try {
      const newMeal = await createMealFromSearchResult(recipe, dayId, mealType, category);
      
      if (newMeal) {
        // Use the same ID as the meal being replaced to maintain position
        newMeal.id = mealId;
        
        setDays(prevDays => 
          prevDays.map(day => 
            day.id === dayId
              ? {
                  ...day,
                  meals: day.meals.map(meal => 
                    meal.id === mealId ? newMeal : meal
                  )
                }
              : day
          )
        );
        
        console.log('✅ Successfully replaced recipe with search result');
        setApiError(null); // Clear any previous errors
      } else {
        console.warn(`⚠️ Search result recipe "${recipe.title}" violates current dietary restrictions`);
        setApiError(`The selected recipe doesn't match your current dietary restrictions.`);
      }
    } catch (error) {
      console.error('Error changing recipe to search result:', error);
      setApiError('Failed to change recipe. Please try again later.');
    } finally {
      setRecipeLoading(loadingKey, false);
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
    addManualRecipe,
    addSearchRecipe,
    changeRecipe,
    changeRecipeToSearchResult,
    autofillCalendar,
    isAutofilling,
    resetWeek,
    apiError,
    isRecipeLoading
  };
};