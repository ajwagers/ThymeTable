import React, { createContext, useContext, useState } from 'react';

export type DietaryFilter = 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'ketogenic' 
  | 'vegan' 
  | 'vegetarian' 
  | 'lacto-vegetarian'
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

// Mapping dietary filters to Spoonacular API parameters
const dietaryMappings: Record<DietaryFilter, { diet?: string; intolerances?: string[]; excludeIngredients?: string[] }> = {
  'gluten-free': { 
    intolerances: ['gluten'] 
  },
  'dairy-free': { 
    intolerances: ['dairy'] 
  },
  'ketogenic': { 
    diet: 'ketogenic' 
  },
  'vegan': { 
    diet: 'vegan' 
  },
  'vegetarian': { 
    diet: 'vegetarian' 
  },
  'lacto-vegetarian': { 
    diet: 'lacto vegetarian' 
  },
  'custom': {} // Handled separately
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
    
    // Collect all dietary requirements
    const allIntolerances: string[] = [];
    const allExcludeIngredients: string[] = [];
    let primaryDiet: string | undefined;

    // Process standard dietary filters
    activeDiets.forEach(diet => {
      if (diet === 'custom') return; // Handle custom separately
      
      const mapping = dietaryMappings[diet];
      if (mapping.diet) {
        // For conflicting diets, prioritize more restrictive ones
        const dietPriority = { vegan: 4, vegetarian: 3, 'lacto vegetarian': 2, ketogenic: 1 };
        const currentPriority = dietPriority[mapping.diet as keyof typeof dietPriority] || 0;
        const existingPriority = primaryDiet ? dietPriority[primaryDiet as keyof typeof dietPriority] || 0 : 0;
        
        if (currentPriority > existingPriority) {
          primaryDiet = mapping.diet;
        }
      }
      if (mapping.intolerances) {
        allIntolerances.push(...mapping.intolerances);
      }
      if (mapping.excludeIngredients) {
        allExcludeIngredients.push(...mapping.excludeIngredients);
      }
    });

    // Process custom filters
    if (activeDiets.includes('custom')) {
      customFilters.forEach(filter => {
        if (filter.diet && !primaryDiet) {
          primaryDiet = filter.diet;
        }
        allIntolerances.push(...filter.intolerances);
        allExcludeIngredients.push(...filter.excludeIngredients);
      });
    }

    // Build final parameters
    if (primaryDiet) {
      params.diet = primaryDiet;
    }
    if (allIntolerances.length > 0) {
      params.intolerances = [...new Set(allIntolerances)].join(',');
    }
    if (allExcludeIngredients.length > 0) {
      params.excludeIngredients = [...new Set(allExcludeIngredients)].join(',');
    }

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