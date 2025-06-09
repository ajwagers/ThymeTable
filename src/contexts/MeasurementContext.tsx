import React, { createContext, useContext, useState } from 'react';

export type MeasurementSystem = 'us' | 'metric';

interface MeasurementContextType {
  system: MeasurementSystem;
  setSystem: (system: MeasurementSystem) => void;
  convertUnit: (amount: number, unit: string) => { amount: string; unit: string };
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [system, setSystem] = useState<MeasurementSystem>('us');

  const convertUnit = (amount: number, unit: string): { amount: string; unit: string } => {
    const normalizedUnit = unit.toLowerCase().trim();
    
    // If already in the target system, return as-is with proper formatting
    if (system === 'us') {
      // Check if it's already a US unit
      const usUnits = ['cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons', 
                       'fl oz', 'fluid ounce', 'fluid ounces', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 
                       'pound', 'pounds', 'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons'];
      
      if (usUnits.includes(normalizedUnit)) {
        return { amount: toFraction(amount), unit: normalizedUnit };
      }
      
      // Convert metric to US
      const metricToUsConversions: Record<string, { factor: number; unit: string }> = {
        // Volume conversions (metric to US)
        'ml': { factor: 0.00422675, unit: 'cup' },
        'milliliter': { factor: 0.00422675, unit: 'cup' },
        'milliliters': { factor: 0.00422675, unit: 'cup' },
        'l': { factor: 4.22675, unit: 'cup' },
        'liter': { factor: 4.22675, unit: 'cup' },
        'liters': { factor: 4.22675, unit: 'cup' },
        
        // Weight conversions (metric to US)
        'g': { factor: 0.035274, unit: 'oz' },
        'gram': { factor: 0.035274, unit: 'oz' },
        'grams': { factor: 0.035274, unit: 'oz' },
        'kg': { factor: 2.20462, unit: 'lb' },
        'kilogram': { factor: 2.20462, unit: 'lb' },
        'kilograms': { factor: 2.20462, unit: 'lb' },
      };
      
      const conversion = metricToUsConversions[normalizedUnit];
      if (conversion) {
        let convertedAmount = amount * conversion.factor;
        let convertedUnit = conversion.unit;
        
        // Convert small cup amounts to tablespoons or teaspoons
        if (convertedUnit === 'cup' && convertedAmount < 0.25) {
          if (convertedAmount < 0.0625) { // Less than 1 tbsp
            convertedAmount = convertedAmount * 48; // Convert to tsp
            convertedUnit = 'tsp';
          } else {
            convertedAmount = convertedAmount * 16; // Convert to tbsp
            convertedUnit = 'tbsp';
          }
        }
        
        // Convert small oz amounts to larger units if needed
        if (convertedUnit === 'oz' && convertedAmount >= 16) {
          convertedAmount = convertedAmount / 16;
          convertedUnit = 'lb';
        }
        
        return { amount: toFraction(convertedAmount), unit: convertedUnit };
      }
    } else {
      // Convert to metric system
      const usToMetricConversions: Record<string, { factor: number; unit: string }> = {
        // Volume conversions (US to metric)
        'cup': { factor: 236.588, unit: 'ml' },
        'cups': { factor: 236.588, unit: 'ml' },
        'tbsp': { factor: 14.787, unit: 'ml' },
        'tablespoon': { factor: 14.787, unit: 'ml' },
        'tablespoons': { factor: 14.787, unit: 'ml' },
        'tsp': { factor: 4.929, unit: 'ml' },
        'teaspoon': { factor: 4.929, unit: 'ml' },
        'teaspoons': { factor: 4.929, unit: 'ml' },
        'fl oz': { factor: 29.574, unit: 'ml' },
        'fluid ounce': { factor: 29.574, unit: 'ml' },
        'fluid ounces': { factor: 29.574, unit: 'ml' },
        'pint': { factor: 473.176, unit: 'ml' },
        'pints': { factor: 473.176, unit: 'ml' },
        'quart': { factor: 946.353, unit: 'ml' },
        'quarts': { factor: 946.353, unit: 'ml' },
        'gallon': { factor: 3785.41, unit: 'ml' },
        'gallons': { factor: 3785.41, unit: 'ml' },
        
        // Weight conversions (US to metric)
        'oz': { factor: 28.35, unit: 'g' },
        'ounce': { factor: 28.35, unit: 'g' },
        'ounces': { factor: 28.35, unit: 'g' },
        'lb': { factor: 453.592, unit: 'g' },
        'lbs': { factor: 453.592, unit: 'g' },
        'pound': { factor: 453.592, unit: 'g' },
        'pounds': { factor: 453.592, unit: 'g' },
      };

      const conversion = usToMetricConversions[normalizedUnit];
      if (conversion) {
        let convertedAmount = amount * conversion.factor;
        let convertedUnit = conversion.unit;

        // Convert large ml amounts to liters
        if (convertedUnit === 'ml' && convertedAmount >= 1000) {
          convertedAmount = convertedAmount / 1000;
          convertedUnit = 'l';
        }

        // Convert large gram amounts to kilograms
        if (convertedUnit === 'g' && convertedAmount >= 1000) {
          convertedAmount = convertedAmount / 1000;
          convertedUnit = 'kg';
        }

        return { 
          amount: toFraction(convertedAmount), 
          unit: convertedUnit 
        };
      }
    }

    // No conversion available or already in correct system, return as-is
    return { amount: toFraction(amount), unit: normalizedUnit };
  };

  // Helper function to convert decimal to fraction
  const toFraction = (decimal: number): string => {
    if (decimal === Math.floor(decimal)) {
      return decimal.toString();
    }

    // For metric, use decimals for precision
    if (system === 'metric') {
      return decimal.toFixed(1).replace(/\.0$/, '');
    }

    // For US system, use fractions
    const thirds = Math.round(decimal * 3) / 3;
    const eighths = Math.round(decimal * 8) / 8;

    const useThirds = Math.abs(decimal - thirds) < Math.abs(decimal - eighths);
    const rounded = useThirds ? thirds : eighths;

    const whole = Math.floor(rounded);
    const fraction = rounded - whole;

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

  return (
    <MeasurementContext.Provider value={{ system, setSystem, convertUnit }}>
      {children}
    </MeasurementContext.Provider>
  );
}

export function useMeasurement() {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error('useMeasurement must be used within a MeasurementProvider');
  }
  return context;
}