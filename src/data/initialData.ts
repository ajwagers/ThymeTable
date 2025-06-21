import { Day } from '../types';

// Helper function to get date strings for the current week (Sunday-first)
export const getDatesForCurrentWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dates = [];
  
  // Get Sunday (start of week)
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  
  // Generate dates for the whole week (Sunday through Saturday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  return dates;
};

export const createEmptyWeek = (): Day[] => {
  const weekDates = getDatesForCurrentWeek();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return dayNames.map((name, index) => ({
    id: name.toLowerCase(),
    name,
    date: weekDates[index],
    meals: []
  }));
};

export const initialDays: Day[] = [];