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
  ingredients?: {
    name: string;
    amount: number;
    unit: string;
  }[];
}

export interface Day {
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

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  originalAmount?: number;
  originalUnit?: string;
  convertedAmount?: number;
  convertedUnit?: string;
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
  dishTypes?: string[];
}