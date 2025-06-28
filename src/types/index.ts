export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  originalAmount?: number;
  originalUnit?: string;
  convertedAmount?: number;
  convertedUnit?: string;
}

export interface Meal {
  id: string;
  recipeId?: number; // Add separate field for Spoonacular recipe ID
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  category: 'main' | 'side';
  cuisine: string;
  prepTime: number;
  servings: number;
  calories: number;
  image?: string;
  ingredients?: Ingredient[];
}

export interface Day {
  recipeData?: SpoonacularRecipe; // Store complete recipe data for user-created recipes
  id: string;
  name: string;
  date: string;
  meals: Meal[];
}

export interface DragResult {
  destination?: {
    droppableId: string;
    index: number;
  };
  source: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  type: string;
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  calories: number;
  image: string;
  cuisines: string[];
  instructions?: string[];
  ingredients?: Ingredient[];
  recipeData?: SpoonacularRecipe; // Store complete recipe data for user-created recipes
  dishTypes?: string[];
  isUserCreated?: boolean;  // Add this field
}

export interface FavoriteRecipe {
  id: string;
  user_id: string;
  recipe_id: number;
  recipe_title: string;
  recipe_image?: string;
  recipe_data: SpoonacularRecipe;
  created_at: string;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_plan_data: Day[];
  created_at: string;
  updated_at: string;
}