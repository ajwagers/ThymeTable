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
}

const DietaryContext = createContext<DietaryContextType | undefined>(undefined);

// Enhanced mapping with comprehensive ingredient exclusions
const dietaryMappings: Record<DietaryFilter, { diet?: string; intolerances?: string[]; excludeIngredients?: string[] }> = {
  'gluten-free': { 
    intolerances: ['gluten'],
    excludeIngredients: [
      'wheat', 'barley', 'rye', 'spelt', 'kamut', 'triticale', 'bulgur', 'semolina', 'durum',
      'bread', 'pasta', 'noodles', 'flour', 'breadcrumbs', 'croutons', 'couscous',
      'beer', 'malt', 'brewer\'s yeast', 'wheat germ', 'wheat bran', 'graham flour',
      'farro', 'einkorn', 'emmer', 'seitan', 'vital wheat gluten'
    ]
  },
  'dairy-free': { 
    intolerances: ['dairy'],
    excludeIngredients: [
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cottage cheese',
      'ricotta', 'mozzarella', 'cheddar', 'parmesan', 'swiss', 'goat cheese', 'feta',
      'cream cheese', 'mascarpone', 'whey', 'casein', 'lactose', 'buttermilk',
      'heavy cream', 'half and half', 'evaporated milk', 'condensed milk',
      'ice cream', 'sherbet', 'frozen yogurt', 'kefir', 'ghee', 'clarified butter'
    ]
  },
  'ketogenic': { 
    diet: 'ketogenic',
    excludeIngredients: [
      'sugar', 'honey', 'maple syrup', 'agave', 'corn syrup', 'brown sugar',
      'bread', 'pasta', 'rice', 'quinoa', 'oats', 'cereal', 'crackers',
      'potato', 'sweet potato', 'corn', 'beans', 'lentils', 'chickpeas',
      'banana', 'apple', 'orange', 'grapes', 'pineapple', 'mango',
      'flour', 'wheat', 'barley', 'rye'
    ]
  },
  'vegan': { 
    diet: 'vegan',
    excludeIngredients: [
      'meat', 'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck', 'fish', 'salmon',
      'tuna', 'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams',
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'eggs', 'honey',
      'gelatin', 'lard', 'bacon', 'ham', 'sausage', 'pepperoni'
    ]
  },
  'vegetarian': { 
    diet: 'vegetarian',
    excludeIngredients: [
      'meat', 'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck', 'fish', 'salmon',
      'tuna', 'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams',
      'bacon', 'ham', 'sausage', 'pepperoni', 'anchovy', 'gelatin', 'lard'
    ]
  },
  'lacto-vegetarian': { 
    diet: 'lacto vegetarian',
    excludeIngredients: [
      'meat', 'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck', 'fish', 'salmon',
      'tuna', 'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams',
      'eggs', 'bacon', 'ham', 'sausage', 'pepperoni', 'anchovy', 'gelatin', 'lard'
    ]
  },
  'ovo-vegetarian': { 
    diet: 'ovo vegetarian',
    excludeIngredients: [
      'meat', 'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck', 'fish', 'salmon',
      'tuna', 'shrimp', 'crab', 'lobster', 'scallops', 'mussels', 'clams',
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'bacon', 'ham', 'sausage',
      'pepperoni', 'anchovy', 'gelatin', 'lard'
    ]
  },
  'pescatarian': { 
    diet: 'pescetarian',
    excludeIngredients: [
      'meat', 'beef', 'pork', 'lamb', 'chicken', 'turkey', 'duck',
      'bacon', 'ham', 'sausage', 'pepperoni', 'lard'
    ]
  },
  'paleo': { 
    diet: 'paleo',
    excludeIngredients: [
      'grains', 'wheat', 'rice', 'oats', 'quinoa', 'barley', 'rye', 'corn',
      'legumes', 'beans', 'lentils', 'chickpeas', 'peanuts', 'soy',
      'dairy', 'milk', 'cheese', 'yogurt', 'butter',
      'sugar', 'processed foods', 'refined oils', 'bread', 'pasta'
    ]
  },
  'primal': { 
    diet: 'primal',
    excludeIngredients: [
      'grains', 'wheat', 'rice', 'oats', 'quinoa', 'barley', 'rye', 'corn',
      'legumes', 'beans', 'lentils', 'chickpeas', 'peanuts', 'soy',
      'sugar', 'processed foods', 'refined oils', 'bread', 'pasta'
    ]
  },
  'slow-carb': {
    excludeIngredients: [
      'bread', 'pasta', 'rice', 'potato', 'sugar', 'flour', 'cereal', 'oats',
      'quinoa', 'corn', 'wheat', 'barley', 'rye', 'crackers', 'bagels'
    ]
  },
  'bulletproof': {
    excludeIngredients: [
      'sugar', 'gluten', 'corn', 'soy', 'vegetable oil', 'canola oil', 'margarine',
      'processed foods', 'artificial sweeteners', 'grains', 'legumes'
    ]
  },
  'low-fodmap': {
    excludeIngredients: [
      'onion', 'garlic', 'wheat', 'beans', 'lentils', 'chickpeas', 'apple', 'pear',
      'mango', 'watermelon', 'honey', 'agave', 'cashews', 'pistachios',
      'artichoke', 'asparagus', 'cauliflower', 'mushrooms'
    ]
  },
  'whole30': {
    excludeIngredients: [
      'sugar', 'honey', 'maple syrup', 'agave', 'alcohol', 'grains', 'wheat', 'rice',
      'oats', 'quinoa', 'beans', 'lentils', 'peanuts', 'soy', 'dairy', 'cheese',
      'milk', 'yogurt', 'processed foods', 'carrageenan', 'msg', 'sulfites'
    ]
  },
  'gaps': {
    excludeIngredients: [
      'grains', 'wheat', 'rice', 'corn', 'oats', 'quinoa', 'potato', 'sweet potato',
      'sugar', 'processed foods', 'soy', 'beans', 'lentils', 'chickpeas'
    ]
  },
  'mediterranean': {
    diet: 'mediterranean'
  },
  'grain-free': {
    excludeIngredients: [
      'wheat', 'rice', 'oats', 'barley', 'rye', 'corn', 'quinoa', 'millet',
      'buckwheat', 'amaranth', 'bread', 'pasta', 'cereal', 'crackers', 'flour'
    ]
  },
  'fruitarian': {
    excludeIngredients: [
      'meat', 'fish', 'dairy', 'eggs', 'grains', 'vegetables', 'legumes',
      'nuts', 'seeds', 'roots', 'tubers', 'leaves', 'stems'
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

  const getSpoonacularParams = () => {
    const params: { diet?: string; intolerances?: string; excludeIngredients?: string } = {};
    
    // Collect all dietary requirements with STRICT PRIORITY on exclusions
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
      params.excludeIngredients = [...new Set(allExcludeIngredients)].join(',');
    }
    
    // 3. Only include diet if it doesn't conflict with exclusions
    // For strict filtering, we might want to be more conservative here
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

    console.log('🔍 Dietary Filter Debug:', {
      activeDiets,
      allIntolerances,
      allExcludeIngredients: allExcludeIngredients.slice(0, 10), // Show first 10 for debugging
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
      getSpoonacularParams
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