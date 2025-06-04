import React, { createContext, useContext, useState } from 'react';

interface ServingsContextType {
  globalServings: number;
  setGlobalServings: (servings: number) => void;
  mealServings: Record<string, number>;
  setMealServings: (mealId: string, servings: number) => void;
  adjustQuantity: (original: number, originalServings: number, mealId?: string) => string;
}

const ServingsContext = createContext<ServingsContextType | undefined>(undefined);

export function ServingsProvider({ children }: { children: React.ReactNode }) {
  const [globalServings, setGlobalServings] = useState(4);
  const [mealServings, setMealServings] = useState<Record<string, number>>({});

  const toFraction = (decimal: number): string => {
    if (decimal === Math.floor(decimal)) {
      return decimal.toString();
    }

    // Convert to nearest third or eighth
    const thirds = Math.round(decimal * 3) / 3;
    const eighths = Math.round(decimal * 8) / 8;

    // Use whichever is closer
    const useThirds = Math.abs(decimal - thirds) < Math.abs(decimal - eighths);
    const rounded = useThirds ? thirds : eighths;

    // Extract whole number and fractional parts
    const whole = Math.floor(rounded);
    const fraction = rounded - whole;

    // Convert to fraction string
    let fractionStr = '';
    if (useThirds) {
      if (Math.abs(fraction - 1/3) < 0.01) fractionStr = '1/3';
      else if (Math.abs(fraction - 2/3) < 0.01) fractionStr = '2/3';
    } else {
      if (Math.abs(fraction - 1/8) < 0.01) fractionStr = '1/8';
      else if (Math.abs(fraction - 1/4) < 0.01) fractionStr = '1/4';
      else if (Math.abs(fraction - 3/8) < 0.01) fractionStr = '3/8';
      else if (Math.abs(fraction - 1/2) < 0.01) fractionStr = '1/2';
      else if (Math.abs(fraction - 5/8) < 0.01) fractionStr = '5/8';
      else if (Math.abs(fraction - 3/4) < 0.01) fractionStr = '3/4';
      else if (Math.abs(fraction - 7/8) < 0.01) fractionStr = '7/8';
    }

    return whole > 0 ? `${whole} ${fractionStr}` : fractionStr;
  };

  const adjustQuantity = (original: number, originalServings: number, mealId?: string): string => {
    const targetServings = mealId && mealId in mealServings 
      ? mealServings[mealId] 
      : globalServings;
    
    const adjusted = (original * targetServings) / originalServings;
    return toFraction(adjusted);
  };

  const handleSetMealServings = (mealId: string, servings: number) => {
    setMealServings(prev => ({
      ...prev,
      [mealId]: servings
    }));
  };

  return (
    <ServingsContext.Provider value={{ 
      globalServings, 
      setGlobalServings: setGlobalServings,
      mealServings,
      setMealServings: handleSetMealServings,
      adjustQuantity 
    }}>
      {children}
    </ServingsContext.Provider>
  );
}

export function useServings() {
  const context = useContext(ServingsContext);
  if (context === undefined) {
    throw new Error('useServings must be used within a ServingsProvider');
  }
  return context;
}