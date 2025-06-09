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
    
    // If already in the target system, return as-is
    if (system === 'us') {
      return { amount: toFraction(amount), unit: normalizedUnit };
    }
    
    // Convert US to Metric
    const conversions: Record<string, { factor: number; unit: string }> = {
      // Volume conversions
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
      
      // Weight conversions
      'oz': { factor: 28.35, unit: 'g' },
      'ounce': { factor: 28.35, unit: 'g' },
      'ounces': { factor: 28.35, unit: 'g' },
      'lb': { factor: 453.592, unit: 'g' },
      'lbs': { factor: 453.592, unit: 'g' },
      'pound': { factor: 453.592, unit: 'g' },
      'pounds': { factor: 453.592, unit: 'g' },
      
      // Temperature (if needed)
      'fahrenheit': { factor: 1, unit: 'celsius' }, // Special handling needed
      'f': { factor: 1, unit: 'c' },
    };

    const conversion = conversions[normalizedUnit];
    if (!conversion) {
      // No conversion available, return as-is
      return { amount: toFraction(amount), unit: normalizedUnit };
    }

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
  };

  // Helper function to convert decimal to fraction (same as in ServingsContext)
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