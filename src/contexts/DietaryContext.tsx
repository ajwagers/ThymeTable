import React, { createContext, useContext, useState } from 'react';

export type DietaryFilter = 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'ketogenic' 
  | 'vegan' 
  | 'vegetarian' 
  | 'lacto-vegetarian'
  | 'ovo-vegetarian'
  | 'pescatarian'
  | 'paleo'
  | 'primal'
  | 'slow-carb'
  | 'bulletproof'
  | 'low-fodmap'
  | 'whole30'
  | 'gaps'
  | 'mediterranean'
  | 'grain-free'
  | 'fruitarian'
  | 'custom';

export interface CustomDietaryFilter {
  id: string;
  name: string;
  intolerances: string[];
  diet?: string;
  excludeIngredients: string[];
}

interface DietaryContextType {
  activeDiets: DietaryFilter[];
  customFilters: CustomDietaryFilter[];
  toggleDiet: (diet: DietaryFilter) => void;
  addCustomFilter: (filter: Omit<CustomDietaryFilter, 'id'>) => void;
  removeCustomFilter: (id: string) => void;
  updateCustomFilter: (id: string, filter: Partial<CustomDietaryFilter>) => void;
  getSpoonacularParams: () => {
    diet?: string;
    intolerances?: string;
    excludeIngredients?: string;
  };
  getAllForbiddenIngredients: () => string[];
  isRecipeAllowed: (recipeTitle: string, ingredients?: string[]) => boolean;
}

const DietaryContext = createContext<DietaryContextType | undefined>(undefined);

// MASSIVELY ENHANCED mapping with comprehensive ingredient exclusions
const dietaryMappings: Record<DietaryFilter, { diet?: string; intolerances?: string[]; excludeIngredients?: string[] }> = {
  'gluten-free': { 
    intolerances: ['gluten'],
    excludeIngredients: [
      // Primary gluten sources
      'wheat', 'barley', 'rye', 'spelt', 'kamut', 'triticale', 'bulgur', 'semolina', 'durum',
      'farro', 'einkorn', 'emmer', 'seitan', 'vital wheat gluten', 'wheat germ', 'wheat bran',
      
      // Flour types containing gluten
      'flour', 'all-purpose flour', 'bread flour', 'cake flour', 'pastry flour', 'self-rising flour',
      'whole wheat flour', 'graham flour', 'rye flour', 'barley flour', 'spelt flour',
      
      // Bread and baked goods
      'bread', 'breadcrumbs', 'croutons', 'bagel', 'bagels', 'muffin', 'muffins', 'croissant', 'croissants',
      'biscuit', 'biscuits', 'scone', 'scones', 'roll', 'rolls', 'bun', 'buns', 'toast',
      'sandwich bread', 'pita bread', 'naan', 'focaccia', 'sourdough',
      
      // Pasta and noodles
      'pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine', 'lasagna', 'ravioli', 'gnocchi',
      'noodles', 'egg noodles', 'ramen', 'udon', 'soba', 'couscous', 'orzo',
      
      // Crackers and snacks
      'crackers', 'pretzels', 'goldfish', 'cheez-its', 'wheat thins', 'triscuits',
      
      // Cereals and grains
      'cereal', 'granola', 'muesli', 'oatmeal', 'porridge', 'cream of wheat',
      
      // Beer and malt
      'beer', 'ale', 'lager', 'malt', 'malted', 'malt vinegar', 'brewer\'s yeast', 'malt extract',
      
      // Sauces and seasonings that often contain gluten
      'soy sauce', 'teriyaki sauce', 'worcestershire sauce', 'malt vinegar',
      'seasoning mix', 'soup mix', 'gravy mix', 'bouillon cubes',
      
      // Processed foods that often contain gluten
      'imitation crab', 'surimi', 'processed cheese', 'blue cheese', 'roquefort',
      'licorice', 'communion wafers', 'play dough'
    ]
  },
  'dairy-free': { 
    intolerances: ['dairy'],
    excludeIngredients: [
      // Milk and milk products
      'milk', 'whole milk', 'skim milk', '2% milk', 'low-fat milk', 'non-fat milk',
      'evaporated milk', 'condensed milk', 'sweetened condensed milk', 'powdered milk',
      'dry milk', 'milk powder', 'buttermilk', 'chocolate milk',
      
      // Cream products
      'cream', 'heavy cream', 'heavy whipping cream', 'light cream', 'half and half',
      'whipping cream', 'sour cream', 'crème fraîche', 'clotted cream',
      
      // Cheese varieties
      'cheese', 'cheddar', 'mozzarella', 'parmesan', 'swiss', 'american cheese',
      'goat cheese', 'feta', 'brie', 'camembert', 'blue cheese', 'roquefort',
      'cream cheese', 'cottage cheese', 'ricotta', 'mascarpone', 'gouda',
      'provolone', 'monterey jack', 'colby', 'pepper jack', 'string cheese',
      'processed cheese', 'cheese spread', 'cheese sauce', 'nacho cheese',
      
      // Butter and butter products
      'butter', 'salted butter', 'unsalted butter', 'clarified butter', 'ghee',
      'butter flavoring', 'butter extract', 'margarine', 'butter substitute',
      
      // Yogurt and fermented dairy
      'yogurt', 'greek yogurt', 'frozen yogurt', 'kefir', 'lassi',
      
      // Ice cream and frozen desserts
      'ice cream', 'gelato', 'sherbet', 'frozen custard', 'soft serve',
      
      // Dairy proteins and derivatives
      'whey', 'whey protein', 'casein', 'caseinate', 'lactose', 'lactalbumin',
      'lactoglobulin', 'milk solids', 'milk fat', 'anhydrous milk fat',
      
      // Hidden dairy ingredients
      'caramel', 'nougat', 'custard', 'pudding', 'mousse', 'ganache',
      'white chocolate', 'milk chocolate', 'butter cookies', 'creamy',
      
      // Processed foods often containing dairy
      'ranch dressing', 'caesar dressing', 'alfredo sauce', 'bechamel',
      'quiche', 'pizza', 'gratin', 'au gratin', 'scalloped'
    ]
  },
  'ketogenic': { 
    diet: 'ketogenic',
    excludeIngredients: [
      // Sugars and sweeteners
      'sugar', 'brown sugar', 'white sugar', 'cane sugar', 'coconut sugar',
      'honey', 'maple syrup', 'agave', 'corn syrup', 'high fructose corn syrup',
      'molasses', 'golden syrup', 'rice syrup', 'date syrup',
      
      // Grains and grain products
      'bread', 'pasta', 'rice', 'quinoa', 'oats', 'cereal', 'crackers',
      'wheat', 'barley', 'rye', 'corn', 'millet', 'buckwheat', 'amaranth',
      'flour', 'breadcrumbs', 'couscous', 'bulgur',
      
      // Starchy vegetables
      'potato', 'potatoes', 'sweet potato', 'sweet potatoes', 'yam', 'yams',
      'corn', 'peas', 'carrots', 'beets', 'parsnips', 'turnips',
      
      // Legumes
      'beans', 'black beans', 'kidney beans', 'pinto beans', 'navy beans',
      'lentils', 'chickpeas', 'garbanzo beans', 'split peas', 'soybeans',
      'edamame', 'peanuts', 'peanut butter',
      
      // High-carb fruits
      'banana', 'bananas', 'apple', 'apples', 'orange', 'oranges',
      'grapes', 'pineapple', 'mango', 'papaya', 'dates', 'figs',
      'raisins', 'dried fruit', 'fruit juice',
      
      // Processed and high-carb foods
      'pizza', 'sandwich', 'burger bun', 'tortilla', 'wrap',
      'chips', 'french fries', 'onion rings', 'breaded'
    ]
  },
  'vegan': { 
    diet: 'vegan',
    excludeIngredients: [
      // All meat and poultry
      'meat', 'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'goat',
      'chicken', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto',
      'hot dog', 'bratwurst', 'chorizo', 'ground beef', 'ground turkey',
      'steak', 'roast', 'ribs', 'chops', 'cutlet', 'tenderloin',
      
      // All seafood
      'fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'mahi mahi',
      'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams', 'oysters',
      'squid', 'octopus', 'calamari', 'anchovy', 'anchovies', 'sardines',
      'crab sticks', 'surimi', 'fish sauce', 'worcestershire sauce',
      
      // All dairy products
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'ice cream',
      'whey', 'casein', 'lactose', 'ghee', 'buttermilk',
      
      // Eggs and egg products
      'egg', 'eggs', 'egg white', 'egg whites', 'egg yolk', 'egg yolks',
      'mayonnaise', 'aioli', 'hollandaise', 'custard', 'meringue',
      
      // Honey and bee products
      'honey', 'beeswax', 'propolis', 'royal jelly',
      
      // Gelatin and animal-derived ingredients
      'gelatin', 'collagen', 'isinglass', 'carmine', 'cochineal',
      'shellac', 'lanolin', 'tallow', 'lard', 'suet',
      
      // Hidden animal ingredients
      'vitamin d3', 'omega-3', 'glucosamine', 'chondroitin',
      'l-cysteine', 'albumin', 'pepsin', 'rennet'
    ]
  },
  'vegetarian': { 
    diet: 'vegetarian',
    excludeIngredients: [
      // All meat and poultry
      'meat', 'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'goat',
      'chicken', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto',
      'hot dog', 'bratwurst', 'chorizo', 'ground beef', 'ground turkey',
      'steak', 'roast', 'ribs', 'chops', 'cutlet', 'tenderloin',
      
      // All seafood
      'fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'mahi mahi',
      'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams', 'oysters',
      'squid', 'octopus', 'calamari', 'anchovy', 'anchovies', 'sardines',
      'crab sticks', 'surimi', 'fish sauce', 'worcestershire sauce',
      
      // Animal fats and by-products
      'lard', 'tallow', 'suet', 'gelatin', 'rennet', 'isinglass'
    ]
  },
  'lacto-vegetarian': { 
    diet: 'lacto vegetarian',
    excludeIngredients: [
      // All meat and poultry
      'meat', 'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'goat',
      'chicken', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto',
      'hot dog', 'bratwurst', 'chorizo', 'ground beef', 'ground turkey',
      'steak', 'roast', 'ribs', 'chops', 'cutlet', 'tenderloin',
      
      // All seafood
      'fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'mahi mahi',
      'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams', 'oysters',
      'squid', 'octopus', 'calamari', 'anchovy', 'anchovies', 'sardines',
      'crab sticks', 'surimi', 'fish sauce', 'worcestershire sauce',
      
      // Eggs and egg products
      'egg', 'eggs', 'egg white', 'egg whites', 'egg yolk', 'egg yolks',
      'mayonnaise', 'aioli', 'hollandaise', 'custard', 'meringue',
      
      // Animal fats and by-products
      'lard', 'tallow', 'suet', 'gelatin', 'rennet', 'isinglass'
    ]
  },
  'ovo-vegetarian': { 
    diet: 'ovo vegetarian',
    excludeIngredients: [
      // All meat and poultry
      'meat', 'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'goat',
      'chicken', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto',
      'hot dog', 'bratwurst', 'chorizo', 'ground beef', 'ground turkey',
      'steak', 'roast', 'ribs', 'chops', 'cutlet', 'tenderloin',
      
      // All seafood
      'fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'mahi mahi',
      'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams', 'oysters',
      'squid', 'octopus', 'calamari', 'anchovy', 'anchovies', 'sardines',
      'crab sticks', 'surimi', 'fish sauce', 'worcestershire sauce',
      
      // All dairy products
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'ice cream',
      'whey', 'casein', 'lactose', 'ghee', 'buttermilk',
      
      // Animal fats and by-products
      'lard', 'tallow', 'suet', 'gelatin', 'rennet', 'isinglass'
    ]
  },
  'pescatarian': { 
    diet: 'pescetarian',
    excludeIngredients: [
      // All meat and poultry
      'meat', 'beef', 'pork', 'lamb', 'veal', 'venison', 'bison', 'goat',
      'chicken', 'turkey', 'duck', 'goose', 'quail', 'pheasant',
      'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'prosciutto',
      'hot dog', 'bratwurst', 'chorizo', 'ground beef', 'ground turkey',
      'steak', 'roast', 'ribs', 'chops', 'cutlet', 'tenderloin',
      
      // Animal fats from land animals
      'lard', 'tallow', 'suet'
    ]
  },
  'paleo': { 
    diet: 'paleo',
    excludeIngredients: [
      // All grains
      'grains', 'wheat', 'rice', 'oats', 'quinoa', 'barley', 'rye', 'corn',
      'bread', 'pasta', 'cereal', 'crackers', 'flour', 'bulgur', 'couscous',
      
      // All legumes
      'legumes', 'beans', 'lentils', 'chickpeas', 'peanuts', 'soy', 'tofu',
      'tempeh', 'edamame', 'peas', 'split peas', 'black beans', 'kidney beans',
      
      // All dairy
      'dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream',
      
      // Processed foods and sugars
      'sugar', 'processed foods', 'refined oils', 'vegetable oil', 'canola oil',
      'margarine', 'artificial sweeteners', 'high fructose corn syrup'
    ]
  },
  'primal': { 
    diet: 'primal',
    excludeIngredients: [
      // All grains
      'grains', 'wheat', 'rice', 'oats', 'quinoa', 'barley', 'rye', 'corn',
      'bread', 'pasta', 'cereal', 'crackers', 'flour', 'bulgur', 'couscous',
      
      // All legumes
      'legumes', 'beans', 'lentils', 'chickpeas', 'peanuts', 'soy', 'tofu',
      'tempeh', 'edamame', 'peas', 'split peas', 'black beans', 'kidney beans',
      
      // Processed foods and sugars
      'sugar', 'processed foods', 'refined oils', 'vegetable oil', 'canola oil',
      'margarine', 'artificial sweeteners', 'high fructose corn syrup'
    ]
  },
  'slow-carb': {
    excludeIngredients: [
      'bread', 'pasta', 'rice', 'potato', 'potatoes', 'sugar', 'flour', 'cereal', 'oats',
      'quinoa', 'corn', 'wheat', 'barley', 'rye', 'crackers', 'bagels', 'muffins',
      'cookies', 'cake', 'candy', 'soda', 'fruit juice', 'dried fruit'
    ]
  },
  'bulletproof': {
    excludeIngredients: [
      'sugar', 'gluten', 'corn', 'soy', 'vegetable oil', 'canola oil', 'margarine',
      'processed foods', 'artificial sweeteners', 'grains', 'legumes', 'beans',
      'peanuts', 'cashews', 'high fructose corn syrup', 'msg', 'preservatives'
    ]
  },
  'low-fodmap': {
    excludeIngredients: [
      'onion', 'onions', 'garlic', 'wheat', 'beans', 'lentils', 'chickpeas', 
      'apple', 'apples', 'pear', 'pears', 'mango', 'watermelon', 'honey', 'agave', 
      'cashews', 'pistachios', 'artichoke', 'asparagus', 'cauliflower', 'mushrooms',
      'avocado', 'stone fruits', 'dried fruits', 'high fructose corn syrup'
    ]
  },
  'whole30': {
    excludeIngredients: [
      'sugar', 'honey', 'maple syrup', 'agave', 'artificial sweeteners', 'alcohol', 
      'grains', 'wheat', 'rice', 'oats', 'quinoa', 'beans', 'lentils', 'peanuts', 
      'soy', 'tofu', 'dairy', 'cheese', 'milk', 'yogurt', 'processed foods', 
      'carrageenan', 'msg', 'sulfites', 'corn', 'legumes'
    ]
  },
  'gaps': {
    excludeIngredients: [
      'grains', 'wheat', 'rice', 'corn', 'oats', 'quinoa', 'potato', 'potatoes',
      'sweet potato', 'sweet potatoes', 'sugar', 'processed foods', 'soy', 
      'beans', 'lentils', 'chickpeas', 'starchy vegetables'
    ]
  },
  'mediterranean': {
    diet: 'mediterranean'
  },
  'grain-free': {
    excludeIngredients: [
      'wheat', 'rice', 'oats', 'barley', 'rye', 'corn', 'quinoa', 'millet',
      'buckwheat', 'amaranth', 'bread', 'pasta', 'cereal', 'crackers', 'flour',
      'bulgur', 'couscous', 'farro', 'spelt', 'kamut'
    ]
  },
  'fruitarian': {
    excludeIngredients: [
      'meat', 'fish', 'dairy', 'eggs', 'grains', 'vegetables', 'legumes',
      'nuts', 'seeds', 'roots', 'tubers', 'leaves', 'stems', 'bark'
    ]
  },
  'custom': {}
};

export function DietaryProvider({ children }: { children: React.ReactNode }) {
  const [activeDiets, setActiveDiets] = useState<DietaryFilter[]>(() => {
    const saved = localStorage.getItem('dietaryFilters');
    return saved ? JSON.parse(saved) : [];
  });

  const [customFilters, setCustomFilters] = useState<CustomDietaryFilter[]>(() => {
    const saved = localStorage.getItem('customDietaryFilters');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleDiet = (diet: DietaryFilter) => {
    setActiveDiets(prev => {
      const newDiets = prev.includes(diet) 
        ? prev.filter(d => d !== diet)
        : [...prev, diet];
      
      localStorage.setItem('dietaryFilters', JSON.stringify(newDiets));
      return newDiets;
    });
  };

  const addCustomFilter = (filter: Omit<CustomDietaryFilter, 'id'>) => {
    const newFilter: CustomDietaryFilter = {
      ...filter,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setCustomFilters(prev => {
      const updated = [...prev, newFilter];
      localStorage.setItem('customDietaryFilters', JSON.stringify(updated));
      return updated;
    });

    // Automatically activate custom filter type
    if (!activeDiets.includes('custom')) {
      toggleDiet('custom');
    }
  };

  const removeCustomFilter = (id: string) => {
    setCustomFilters(prev => {
      const updated = prev.filter(f => f.id !== id);
      localStorage.setItem('customDietaryFilters', JSON.stringify(updated));
      
      // If no custom filters remain, remove custom from active diets
      if (updated.length === 0 && activeDiets.includes('custom')) {
        toggleDiet('custom');
      }
      
      return updated;
    });
  };

  const updateCustomFilter = (id: string, updates: Partial<CustomDietaryFilter>) => {
    setCustomFilters(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...updates } : f);
      localStorage.setItem('customDietaryFilters', JSON.stringify(updated));
      return updated;
    });
  };

  // Get ALL forbidden ingredients from active dietary filters
  const getAllForbiddenIngredients = (): string[] => {
    const allForbidden: string[] = [];

    // Process standard dietary filters
    activeDiets.forEach(diet => {
      if (diet === 'custom') return; // Handle custom separately
      
      const mapping = dietaryMappings[diet];
      if (mapping.excludeIngredients) {
        allForbidden.push(...mapping.excludeIngredients);
      }
    });

    // Process custom filters
    if (activeDiets.includes('custom')) {
      customFilters.forEach(filter => {
        allForbidden.push(...filter.excludeIngredients);
      });
    }

    // Remove duplicates and return
    return [...new Set(allForbidden.map(ingredient => ingredient.toLowerCase()))];
  };

  // Check if a recipe is allowed based on title and ingredients
  const isRecipeAllowed = (recipeTitle: string, ingredients: string[] = []): boolean => {
    const forbiddenIngredients = getAllForbiddenIngredients();
    
    if (forbiddenIngredients.length === 0) {
      return true; // No restrictions
    }

    const titleLower = recipeTitle.toLowerCase();
    const allText = [titleLower, ...ingredients.map(ing => ing.toLowerCase())];

    // Check if ANY forbidden ingredient appears in the recipe title or ingredients
    for (const forbidden of forbiddenIngredients) {
      for (const text of allText) {
        // Use word boundaries to avoid false positives (e.g., "rice" in "price")
        const regex = new RegExp(`\\b${forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
          console.log(`🚫 Recipe "${recipeTitle}" REJECTED: Contains forbidden ingredient "${forbidden}" in "${text}"`);
          return false;
        }
      }
    }

    return true;
  };

  const getSpoonacularParams = () => {
    const params: { diet?: string; intolerances?: string; excludeIngredients?: string } = {};
    
    // Collect all dietary requirements with ABSOLUTE PRIORITY on exclusions
    const allIntolerances: string[] = [];
    const allExcludeIngredients: string[] = [];
    let primaryDiet: string | undefined;

    // Process standard dietary filters
    activeDiets.forEach(diet => {
      if (diet === 'custom') return; // Handle custom separately
      
      const mapping = dietaryMappings[diet];
      
      // CRITICAL: Always add exclusions first - these are non-negotiable
      if (mapping.intolerances) {
        allIntolerances.push(...mapping.intolerances);
      }
      if (mapping.excludeIngredients) {
        allExcludeIngredients.push(...mapping.excludeIngredients);
      }
      
      // Only set diet if no exclusions conflict
      if (mapping.diet) {
        // For conflicting diets, prioritize more restrictive ones
        const dietPriority = { 
          fruitarian: 12,
          vegan: 11, 
          vegetarian: 10, 
          'lacto vegetarian': 9, 
          'ovo vegetarian': 8,
          pescetarian: 7,
          paleo: 6,
          primal: 5,
          ketogenic: 4,
          mediterranean: 3,
          whole30: 2,
          gaps: 1 
        };
        const currentPriority = dietPriority[mapping.diet as keyof typeof dietPriority] || 0;
        const existingPriority = primaryDiet ? dietPriority[primaryDiet as keyof typeof dietPriority] || 0 : 0;
        
        if (currentPriority > existingPriority) {
          primaryDiet = mapping.diet;
        }
      }
    });

    // Process custom filters
    if (activeDiets.includes('custom')) {
      customFilters.forEach(filter => {
        // CRITICAL: Always prioritize exclusions
        allIntolerances.push(...filter.intolerances);
        allExcludeIngredients.push(...filter.excludeIngredients);
        
        if (filter.diet && !primaryDiet) {
          primaryDiet = filter.diet;
        }
      });
    }

    // Build final parameters with EXCLUSIONS TAKING ABSOLUTE PRIORITY
    
    // 1. ALWAYS include intolerances - these are hard restrictions
    if (allIntolerances.length > 0) {
      params.intolerances = [...new Set(allIntolerances)].join(',');
    }
    
    // 2. ALWAYS include ingredient exclusions - these override everything
    if (allExcludeIngredients.length > 0) {
      // Limit to first 50 ingredients to avoid URL length issues
      const limitedExclusions = [...new Set(allExcludeIngredients)].slice(0, 50);
      params.excludeIngredients = limitedExclusions.join(',');
    }
    
    // 3. Only include diet if it doesn't conflict with exclusions
    if (primaryDiet) {
      // Check if the diet conflicts with our exclusions
      const hasConflicts = (
        (primaryDiet.includes('vegetarian') && allExcludeIngredients.some(ing => ['dairy', 'milk', 'cheese'].includes(ing))) ||
        (primaryDiet === 'mediterranean' && allExcludeIngredients.some(ing => ['dairy', 'gluten', 'wheat'].includes(ing)))
      );
      
      // Only include diet if no major conflicts
      if (!hasConflicts) {
        params.diet = primaryDiet;
      }
    }

    console.log('🔍 Enhanced Dietary Filter Debug:', {
      activeDiets,
      totalExclusions: allExcludeIngredients.length,
      limitedExclusions: params.excludeIngredients?.split(',').length || 0,
      allIntolerances,
      primaryDiet,
      finalParams: params
    });

    return params;
  };

  return (
    <DietaryContext.Provider value={{
      activeDiets,
      customFilters,
      toggleDiet,
      addCustomFilter,
      removeCustomFilter,
      updateCustomFilter,
      getSpoonacularParams,
      getAllForbiddenIngredients,
      isRecipeAllowed
    }}>
      {children}
    </DietaryContext.Provider>
  );
}

export function useDietary() {
  const context = useContext(DietaryContext);
  if (context === undefined) {
    throw new Error('useDietary must be used within a DietaryProvider');
  }
  return context;
}