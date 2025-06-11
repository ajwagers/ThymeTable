// Helper function to convert decimal to fraction
export const toFraction = (decimal: number): string => {
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

// Helper function to detect if an ingredient name is actually a cooking instruction
export const isInstruction = (text: string): boolean => {
  const instructionKeywords = [
    'add', 'cook', 'stir', 'fry', 'heat', 'boil', 'simmer', 'bake', 'roast', 'grill',
    'mix', 'combine', 'blend', 'whisk', 'beat', 'fold', 'toss', 'season', 'taste',
    'serve', 'garnish', 'sprinkle', 'drizzle', 'pour', 'place', 'remove', 'drain',
    'chop', 'dice', 'slice', 'mince', 'crush', 'press', 'squeeze', 'strain',
    'continue', 'until', 'about', 'minute', 'minutes', 'second', 'seconds',
    'cooked through', 'golden brown', 'tender', 'crispy', 'hot', 'warm', 'cool'
  ];

  const lowerText = text.toLowerCase();
  
  // Check if it contains multiple instruction keywords
  const keywordCount = instructionKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  
  // If it contains 2+ instruction keywords, it's likely an instruction
  if (keywordCount >= 2) return true;
  
  // Check for common instruction patterns
  const instructionPatterns = [
    /\b(add|cook|stir|mix|heat|boil)\s+.*\s+(until|about|for)\s+/i,
    /\b(continue|keep|let)\s+.*\s+(until|for)\s+/i,
    /\bcooked?\s+through\b/i,
    /\b(about|for)\s+\d+\s+(minute|second)/i,
    /\band\s+(cook|stir|mix|add|continue)/i
  ];
  
  return instructionPatterns.some(pattern => pattern.test(text));
};

// Helper function to clean ingredient names by removing embedded amounts and units
export const getCleanedIngredientName = (originalName: string): string => {
  let cleaned = originalName.trim();
  
  // Skip if this is clearly a cooking instruction
  if (isInstruction(cleaned)) {
    return '';
  }
  
  // Skip common non-ingredient phrases
  const skipPhrases = [
    'drizzle of', 'to taste', 'for garnish', 'for serving', 'optional',
    'few drops', 'pinch of', 'dash of', 'handful of'
  ];
  
  for (const phrase of skipPhrases) {
    if (cleaned.toLowerCase().includes(phrase)) {
      return '';
    }
  }
  
  // Define all units that should be removed - using word boundaries for precision
  const units = [
    'pounds?', 'lbs?', 'ounces?', 'oz', 'cups?', 'tablespoons?', 'tbsp', 'teaspoons?', 'tsp',
    'cans?', 'cloves?', 'ml', 'liters?', 'l', 'grams?', 'gr', 'g', 'kg', 'kilograms?',
    'blocks?', 'bunches?', 'bunch', 'heads?', 'head', 'bags?', 'bag', 'servings?', 'serving', 
    'large', 'medium', 'small', 'inches?', 'inch', 'loaves?', 'loaf', 'small\\s+loaf', 
    'pinches?', 'pinch', 'boxes?', 'box', 'pieces?', 'piece', 'dashes?', 'dash', 
    'halves?', 'half', 'drops?', 'drop'
  ].join('|');
  
  // Add standalone t, T, c with word boundaries to be more precise
  const standaloneUnits = '\\bt\\b|\\bT\\b|\\bc\\b';
  const allUnits = `${units}|${standaloneUnits}`;
  
  // STEP 1: Handle units stuck together without spaces (like "200gr", "400g", "180g")
  // This is the key fix for the reported issue
  const stuckUnitsPattern = new RegExp(`\\b\\d+\\s*(${units})\\b`, 'gi');
  cleaned = cleaned.replace(stuckUnitsPattern, ' ');
  
  // STEP 2: Handle duplicate words that appear in ingredient names
  // Fix cases like "1 cup cup of chopped shallots" -> "1 cup chopped shallots"
  cleaned = cleaned.replace(/\b(cup|head|box|piece|loaf|pinch|dash|gram|grams|gr|g|kg|kilogram|kilograms)\s+\1\s+/gi, '$1 ');
  
  // STEP 3: Handle "X of Y" patterns where X is a unit
  cleaned = cleaned.replace(/\b(cup|head|box|piece|loaf|pinch|dash|gram|grams|gr|g|kg|kilogram|kilograms)\s+of\s+/gi, '');
  
  // STEP 4: Remove leading measurement patterns
  // This handles cases like "2 pounds regular chicken wings" or "1/2 cup brown sugar"
  const leadingPattern = new RegExp(`^[\\d\\s\\/]+\\s*(${allUnits})\\s*`, 'i');
  cleaned = cleaned.replace(leadingPattern, '');
  
  // STEP 5: Remove embedded measurement patterns in the middle
  const embeddedPattern = new RegExp(`\\s*[&\\+]?\\s*[\\d\\s\\/½¼¾⅓⅔⅛⅜⅝⅞]+\\s*(${allUnits})\\s*`, 'gi');
  cleaned = cleaned.replace(embeddedPattern, ' ');
  
  // STEP 6: Remove standalone fractions and numbers that might be left over
  // BUT preserve % symbols and numbers that are part of product names
  cleaned = cleaned.replace(/\s*(?<!\w)[\d\s\/½¼¾⅓⅔⅛⅜⅝⅞]+(?![%\w])\s*/g, ' ');
  
  // STEP 7: Remove measurement indicators like "(5ml)" or ". (5ml)"
  cleaned = cleaned.replace(/\s*\.?\s*\([^)]*\)/g, '');
  
  // STEP 8: Remove extra periods, dashes, and commas
  cleaned = cleaned.replace(/\s*[,\.\-]\s*/g, ' ');
  
  // STEP 9: Remove "of" at the beginning if it remains
  cleaned = cleaned.replace(/^of\s+/i, '');
  
  // STEP 10: Remove "about" and similar qualifiers
  cleaned = cleaned.replace(/\b(about|approximately|roughly|around)\s+/gi, '');
  
  // STEP 11: Handle specific problematic patterns
  // Fix "kilo kilo or" -> "kilo"
  cleaned = cleaned.replace(/\bkilo\s+kilo\s+or\s*,?\s*/gi, 'kilo ');
  
  // STEP 12: Remove duplicate words that might remain (like "large large")
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // STEP 13: Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // STEP 14: Remove any remaining leading/trailing punctuation
  cleaned = cleaned.replace(/^[,\-\.\s&]+|[,\-\.\s&]+$/g, '');
  
  // STEP 15: Final check - if the result is too short or empty, return empty
  if (cleaned.length < 2) {
    return '';
  }
  
  return cleaned.toLowerCase();
};

// Helper function to normalize ingredient names for better matching
export const normalizeIngredientName = (name: string): string => {
  let normalized = name.toLowerCase().trim();
  
  // Remove common descriptors and preparation methods
  const descriptorsToRemove = [
    'fresh', 'dried', 'frozen', 'canned', 'organic', 'raw', 'cooked', 'beaten',
    'chopped', 'diced', 'sliced', 'minced', 'crushed', 'grated', 'shredded', 'cubed', 'finely diced',
    'cut into.*?dice', 'cut into.*?pieces', 'cut into small cubes', 'cut into inch cubes', 'finely chopped', 'roughly chopped',
    'plus extra for garnish', 'for garnish', 'extra for.*?', 'divided', 'for serving',
    'low sodium', 'reduced sodium', 'unsalted', 'salted',
    'extra virgin', 'virgin', 'light', 'dark', 'heavy', 'thick',
    'flat leaf', 'italian', 'regular', 'large', 'small', 'medium',
    'baby', 'young', 'mature', 'ripe', 'unripe',
    'boneless', 'skinless', 'bone-in', 'skin-on', 'boneless skinless',
    'juice of.*?', 'wedges', 'drizzle of', 'nice', 'creamy', 'one',
    'well rinsed', 'coarsely', 'on the bias', 'peeled', 'finely minced',
    'thick', 'to taste', 'freshly ground', 'granulated', 'sea', 'himalayan', 'kosher',
    'generous handful', 'handful', 'roasted and', 'whisked', 'thinly', 'finely',
    'cleaned', 'with stems trimmed.*?', 'stems trimmed.*?', 'for serving',
    'freshly squeezed', 'squeezed', 'stale and', 'halved', 'torn',
    'skinned', 'boned', 'skinned & boned', 'skinned and boned',
    'shelled', 'peeled', 'deveined', 'peeled and deveined',
    'uncooked', 'whisked', 'grated', 'optional:', 'optional',
    'or other', 'or to taste', 'style', 'tiger style', 'firm fleshed',
    'ned', 'drained', 'cut into pieces'
  ];
  
  // Remove descriptors
  descriptorsToRemove.forEach(descriptor => {
    const regex = new RegExp(`\\b${descriptor}\\b`, 'gi');
    normalized = normalized.replace(regex, ' ');
  });
  
  // Handle special cases for specific ingredients
  // Bay leaves variations
  normalized = normalized.replace(/\bbay leaves?\b/g, 'bay leaf');
  
  // Bread variations
  normalized = normalized.replace(/\bbread.*?cubed\b/g, 'bread');
  normalized = normalized.replace(/\bbreadcrumbs?\b/g, 'breadcrumbs');
  
  // Cherry tomato variations
  normalized = normalized.replace(/\bcherry tomatoes?\b/g, 'cherry tomato');
  
  // Chicken variations - ENHANCED
  normalized = normalized.replace(/\bchicken breast[s]?\b/g, 'chicken breast');
  normalized = normalized.replace(/\bchicken breast halves?\b/g, 'chicken breast');
  normalized = normalized.replace(/\bchicken pieces?\b/g, 'chicken');
  normalized = normalized.replace(/\bchicken wings?\b/g, 'chicken wing');
  
  // Shrimp variations - ENHANCED
  normalized = normalized.replace(/\bshrimp\b/g, 'shrimp');
  normalized = normalized.replace(/\bshrimps\b/g, 'shrimp');
  normalized = normalized.replace(/\blarge shrimp\b/g, 'shrimp');
  normalized = normalized.replace(/\bmedium shrimp\b/g, 'shrimp');
  normalized = normalized.replace(/\bsmall shrimp\b/g, 'shrimp');
  normalized = normalized.replace(/\btiger.*?shrimp\b/g, 'shrimp');
  
  // Fish variations - NEW
  normalized = normalized.replace(/\bwhite fish fillets?\b/g, 'white fish');
  normalized = normalized.replace(/\bfish fillets?\b/g, 'fish');
  normalized = normalized.replace(/\bsalmon fillets?\b/g, 'salmon');
  
  // Crab variations - NEW
  normalized = normalized.replace(/\bsurimi crab sticks?\b/g, 'crab sticks');
  normalized = normalized.replace(/\bcrab sticks?\b/g, 'crab sticks');
  
  // Egg variations - ENHANCED
  normalized = normalized.replace(/\beggs?\b/g, 'egg');
  normalized = normalized.replace(/\begg yolks?\b/g, 'egg yolk');
  normalized = normalized.replace(/\begg whites?\b/g, 'egg white');
  
  // Garlic variations
  normalized = normalized.replace(/\bgarlic cloves?\b/g, 'garlic');
  normalized = normalized.replace(/\bcloves? garlic\b/g, 'garlic');
  
  // Lemon variations
  normalized = normalized.replace(/\blemon wedges?\b/g, 'lemon');
  normalized = normalized.replace(/\bjuice of.*?lemons?\b/g, 'lemon juice');
  normalized = normalized.replace(/\bjuice of half.*?lemon\b/g, 'lemon juice');
  normalized = normalized.replace(/\blemon.*?juice\b/g, 'lemon juice');
  
  // Mushroom variations
  normalized = normalized.replace(/\bmixed wild mushrooms?\b/g, 'mushroom');
  normalized = normalized.replace(/\bmushrooms?\b/g, 'mushroom');
  
  // Onion/shallot variations
  normalized = normalized.replace(/\bonions?\b/g, 'onion');
  normalized = normalized.replace(/\bshallots?\b/g, 'shallot');
  
  // Feta cheese variations
  normalized = normalized.replace(/\bfeta cheese\b/g, 'feta');
  normalized = normalized.replace(/\bcrumbled\b/g, '');
  
  // Parmesan variations - ENHANCED
  normalized = normalized.replace(/\bparmesan cheese\b/g, 'parmesan');
  normalized = normalized.replace(/\bparmigiano reggiano\b/g, 'parmesan');
  normalized = normalized.replace(/\bparmigiano-reggiano\b/g, 'parmesan');
  
  // Ginger variations
  normalized = normalized.replace(/\bginger.*?minced\b/g, 'ginger');
  normalized = normalized.replace(/\binch.*?ginger\b/g, 'ginger');
  
  // Salt and pepper variations - ENHANCED
  normalized = normalized.replace(/\b(kosher|sea|himalayan)\s+salt\b/g, 'salt');
  normalized = normalized.replace(/\bsalt\s*&\s*pepper\b/g, 'salt and pepper');
  normalized = normalized.replace(/\bsalt\s*(and|&)\s*(black\s+)?pepper\b/g, 'salt and pepper');
  normalized = normalized.replace(/\bsalt\s*(and|&)\s*freshly\s+ground\s+pepper\b/g, 'salt and pepper');
  normalized = normalized.replace(/\bsalt.*?pepper.*?taste\b/g, 'salt and pepper');
  normalized = normalized.replace(/\bsalt.*?pepper.*?season\b/g, 'salt and pepper');
  normalized = normalized.replace(/\bsalt.*?fresh\s+ground\s+pepper.*?garlic\b/g, 'salt and pepper');
  normalized = normalized.replace(/\bfresh ground black pepper\b/g, 'black pepper');
  normalized = normalized.replace(/\bfreshly ground pepper\b/g, 'black pepper');
  normalized = normalized.replace(/\bground black pepper\b/g, 'black pepper');
  normalized = normalized.replace(/\bblack pepper\b/g, 'black pepper');
  
  // Hot sauce variations - ENHANCED
  normalized = normalized.replace(/\bhot sauce\b/g, 'hot sauce');
  normalized = normalized.replace(/\bsriracha\b/g, 'hot sauce');
  normalized = normalized.replace(/\btabasco\b/g, 'hot sauce');
  
  // Olive oil variations - ENHANCED
  normalized = normalized.replace(/\bolive oil\b/g, 'olive oil');
  normalized = normalized.replace(/\bextra virgin olive oil\b/g, 'olive oil');
  
  // Sesame oil variations - NEW
  normalized = normalized.replace(/\btoasted sesame oil\b/g, 'sesame oil');
  normalized = normalized.replace(/\bsesame oil\b/g, 'sesame oil');
  
  // Pasta variations - NEW
  normalized = normalized.replace(/\bpasta\b/g, 'pasta');
  
  // Corn variations - NEW
  normalized = normalized.replace(/\bsweet corn\b/g, 'corn');
  normalized = normalized.replace(/\bcorn\b/g, 'corn');
  
  // Pineapple variations - NEW
  normalized = normalized.replace(/\bfresh pineapple\b/g, 'pineapple');
  normalized = normalized.replace(/\bpineapple\b/g, 'pineapple');
  
  // Almond variations - NEW
  normalized = normalized.replace(/\balmond flakes?\b/g, 'almonds');
  normalized = normalized.replace(/\balmonds?\b/g, 'almonds');
  
  // Raisin variations - NEW
  normalized = normalized.replace(/\braisins?\b/g, 'raisins');
  
  // Leek variations
  normalized = normalized.replace(/\bleeks?\b/g, 'leek');
  
  // Butter variations
  normalized = normalized.replace(/\bbutter\b/g, 'butter');
  
  // Bell pepper variations
  normalized = normalized.replace(/\bgreen bell pepper\b/g, 'green pepper');
  normalized = normalized.replace(/\bbell pepper\b/g, 'pepper');
  normalized = normalized.replace(/\bgreen pepper\b/g, 'green pepper');
  
  // Basil variations
  normalized = normalized.replace(/\bbasil leaves?\b/g, 'basil');
  normalized = normalized.replace(/\bfresh basil\b/g, 'basil');
  
  // Pasta variations
  normalized = normalized.replace(/\bpenne pasta\b/g, 'penne');
  
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

// Helper function to normalize units for better matching
export const normalizeUnit = (unit: string): string => {
  const unitMap: Record<string, string> = {
    // Volume
    'cup': 'cup', 'cups': 'cup',
    'tablespoon': 'tbsp', 'tablespoons': 'tbsp', 'tbsp': 'tbsp',
    'teaspoon': 'tsp', 'teaspoons': 'tsp', 'tsp': 'tsp',
    'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
    'liter': 'l', 'liters': 'l', 'l': 'l',
    'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz', 'fl oz': 'fl oz',
    
    // Weight
    'pound': 'lb', 'pounds': 'lb', 'lb': 'lb', 'lbs': 'lb',
    'ounce': 'oz', 'ounces': 'oz', 'oz': 'oz',
    'gram': 'g', 'grams': 'g', 'g': 'g', 'gr': 'g',
    'kilogram': 'kg', 'kilograms': 'kg', 'kg': 'kg',
    
    // Count
    'piece': 'piece', 'pieces': 'piece',
    'clove': 'clove', 'cloves': 'clove',
    'head': 'head', 'heads': 'head',
    'bunch': 'bunch', 'bunches': 'bunch',
    'can': 'can', 'cans': 'can',
    'block': 'block', 'blocks': 'block',
    'cube': 'cube', 'cubes': 'cube',
    'bag': 'bag', 'bags': 'bag',
    'leaf': 'leaf', 'leaves': 'leaf',
    'serving': 'serving', 'servings': 'serving',
    'loaf': 'loaf', 'loaves': 'loaf',
    'pinch': 'pinch', 'pinches': 'pinch',
    'box': 'box', 'boxes': 'box',
    'inch': 'inch', 'inches': 'inch',
    'dash': 'dash', 'dashes': 'dash',
    'drop': 'drop', 'drops': 'drop',
    'handful': 'handful',
    
    // Size descriptors that were being treated as units
    'large': '', 'medium': '', 'small': '',
    
    // Empty unit stays empty (for count-based ingredients)
    '': '',
  };
  
  const normalized = unit.toLowerCase().trim();
  
  // Handle standalone t, T, g, c with exact matching
  if (normalized === 't') return 'tsp';
  if (normalized === 'T') return 'tbsp';
  if (normalized === 'g') return 'g';
  if (normalized === 'c') return 'cup';
  
  return unitMap[normalized] || normalized;
};

// Helper function to check if two ingredients should be combined
export const shouldCombineIngredients = (name1: string, name2: string): boolean => {
  const norm1 = normalizeIngredientName(name1);
  const norm2 = normalizeIngredientName(name2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // Define ingredient groups that should be combined
  const ingredientGroups = [
    // Bread variations
    ['bread', 'breadcrumbs'],
    
    // Cherry tomato variations
    ['cherry tomato', 'cherry tomatoes'],
    
    // Chicken stock/broth variations
    ['chicken broth', 'chicken stock', 'chicken bouillon', 'chicken bullion'],
    ['beef broth', 'beef stock', 'beef bouillon', 'beef bullion'],
    ['vegetable broth', 'vegetable stock', 'vegetable bouillon'],
    
    // Parsley variations
    ['parsley', 'flat leaf parsley', 'italian parsley'],
    
    // Bay leaf variations
    ['bay leaf', 'bay leaves'],
    
    // Chicken variations - ENHANCED
    ['chicken breast', 'chicken breasts', 'chicken breast halves', 'chicken pieces', 'chicken'],
    
    // Shrimp variations - ENHANCED
    ['shrimp', 'shrimps', 'large shrimp', 'medium shrimp', 'small shrimp', 'tiger shrimp'],
    
    // Fish variations - NEW
    ['white fish', 'fish', 'salmon', 'fish fillets', 'white fish fillets', 'salmon fillets'],
    
    // Crab variations - NEW
    ['crab sticks', 'surimi crab sticks'],
    
    // Olive oil variations
    ['olive oil', 'extra virgin olive oil'],
    
    // Sesame oil variations - NEW
    ['sesame oil', 'toasted sesame oil'],
    
    // Egg variations - ENHANCED
    ['egg', 'eggs', 'egg beaten'],
    ['egg white', 'egg whites'],
    ['egg yolk', 'egg yolks'],
    
    // Lemon variations
    ['lemon', 'lemon juice', 'lemon wedges'],
    
    // Mushroom variations
    ['mushroom', 'mushrooms', 'mixed wild mushrooms'],
    
    // Onion variations
    ['onion', 'onions', 'yellow onion', 'white onion'],
    ['shallot', 'shallots'],
    
    // Feta cheese variations
    ['feta', 'feta cheese'],
    
    // Parmesan variations - ENHANCED
    ['parmesan', 'parmesan cheese', 'parmigiano reggiano', 'parmigiano-reggiano'],
    
    // Garlic variations
    ['garlic', 'garlic clove', 'garlic cloves'],
    
    // Ginger variations
    ['ginger'],
    
    // Salt and pepper variations - ENHANCED
    ['salt', 'kosher salt', 'sea salt', 'himalayan salt'],
    ['salt and pepper', 'salt & pepper', 'salt and black pepper', 'salt and freshly ground pepper'],
    ['black pepper', 'freshly ground pepper', 'fresh ground black pepper', 'ground black pepper'],
    
    // Hot sauce variations - ENHANCED
    ['hot sauce', 'sriracha', 'tabasco'],
    
    // Corn variations - NEW
    ['corn', 'sweet corn'],
    
    // Pineapple variations - NEW
    ['pineapple', 'fresh pineapple'],
    
    // Almond variations - NEW
    ['almonds', 'almond flakes'],
    
    // Pasta variations - NEW
    ['pasta'],
    
    // Leek variations
    ['leek', 'leeks'],
    
    // Butter variations
    ['butter', 'unsalted butter', 'salted butter'],
    
    // Bell pepper variations
    ['green pepper', 'green bell pepper'],
    ['red pepper', 'red bell pepper'],
    ['bell pepper', 'pepper'],
    
    // Basil variations
    ['basil', 'fresh basil', 'basil leaves'],
    
    // Pasta variations
    ['penne', 'penne pasta'],
    
    // Common ingredient variations
    ['carrot', 'carrots'],
    ['celery', 'celery stalk', 'celery stalks'],
    ['tomato', 'tomatoes', 'plum tomato', 'plum tomatoes'],
    ['broccoli florets', 'broccoli flowerets'],
    
    // Cheese variations
    ['mozzarella', 'mozzarella cheese'],
    ['cheddar', 'cheddar cheese'],
  ];
  
  // Check if both ingredients belong to the same group
  for (const group of ingredientGroups) {
    const inGroup1 = group.some(item => {
      // Check for exact matches and partial matches
      return norm1 === item || norm1.includes(item) || item.includes(norm1);
    });
    const inGroup2 = group.some(item => {
      return norm2 === item || norm2.includes(item) || item.includes(norm2);
    });
    if (inGroup1 && inGroup2) return true;
  }
  
  // Check for partial matches (one contains the other) - but be more strict
  if (norm1.length > 4 && norm2.length > 4) {
    // Only combine if one is clearly a subset of the other
    const longer = norm1.length > norm2.length ? norm1 : norm2;
    const shorter = norm1.length > norm2.length ? norm2 : norm1;
    
    // Check if the shorter name is contained in the longer name as a whole word
    const regex = new RegExp(`\\b${shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (regex.test(longer)) return true;
  }
  
  return false;
};

// Helper function to convert units to a common base for addition
export const convertToCommonUnit = (amount: number, unit: string): { amount: number; unit: string } => {
  const normalizedUnit = normalizeUnit(unit);
  
  // Volume conversions (convert to cups as base)
  const volumeConversions: Record<string, number> = {
    'tsp': 1/48,      // 1 tsp = 1/48 cup
    'tbsp': 1/16,     // 1 tbsp = 1/16 cup
    'cup': 1,         // base unit
    'fl oz': 1/8,     // 1 fl oz = 1/8 cup
    'ml': 1/236.588,  // 1 ml ≈ 1/236.588 cup
    'l': 4.22675,     // 1 liter ≈ 4.22675 cups
  };
  
  // Weight conversions (convert to ounces as base)
  const weightConversions: Record<string, number> = {
    'oz': 1,          // base unit
    'lb': 16,         // 1 lb = 16 oz
    'g': 0.035274,    // 1 g ≈ 0.035274 oz
    'kg': 35.274,     // 1 kg ≈ 35.274 oz
  };
  
  // Count conversions (keep as count)
  const countUnits = ['piece', 'clove', 'head', 'bunch', 'can', 'block', 'cube', 'bag', 'leaf', 'serving', 'loaf', 'pinch', 'box', 'inch', 'dash', 'drop', 'handful'];
  
  // Try volume conversion first
  if (volumeConversions[normalizedUnit]) {
    const convertedAmount = amount * volumeConversions[normalizedUnit];
    return { amount: convertedAmount, unit: 'cup' };
  }
  
  // Try weight conversion
  if (weightConversions[normalizedUnit]) {
    const convertedAmount = amount * weightConversions[normalizedUnit];
    return { amount: convertedAmount, unit: 'oz' };
  }
  
  // Handle count units
  if (countUnits.includes(normalizedUnit)) {
    return { amount, unit: 'count' };
  }
  
  // Return as-is if no conversion available
  return { amount, unit: normalizedUnit };
};

// Helper function to convert back to a user-friendly unit
export const convertToFriendlyUnit = (amount: number, baseUnit: string): { amount: string; unit: string } => {
  if (baseUnit === 'cup') {
    // Convert cups to more appropriate units
    if (amount >= 1) {
      return { amount: toFraction(amount), unit: 'cup' };
    } else if (amount >= 1/16) {
      const tbsp = amount * 16;
      return { amount: toFraction(tbsp), unit: 'tbsp' };
    } else {
      const tsp = amount * 48;
      return { amount: toFraction(tsp), unit: 'tsp' };
    }
  } else if (baseUnit === 'oz') {
    // Convert ounces to more appropriate units
    if (amount >= 16) {
      const lbs = amount / 16;
      return { amount: toFraction(lbs), unit: 'lb' };
    } else {
      return { amount: toFraction(amount), unit: 'oz' };
    }
  } else if (baseUnit === 'count') {
    // For count items, just return the count
    return { amount: toFraction(amount), unit: '' };
  }
  
  return { amount: toFraction(amount), unit: baseUnit };
};

// Helper function to categorize ingredients for grocery shopping
export const getIngredientCategory = (normalizedName: string): string => {
  const name = normalizedName.toLowerCase();
  
  // Produce
  const produce = [
    'apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'lemon', 'lemons', 'lime', 'limes',
    'onion', 'onions', 'garlic', 'shallot', 'shallots', 'ginger', 'scallion', 'scallions',
    'carrot', 'carrots', 'celery', 'potato', 'potatoes', 'sweet potato', 'sweet potatoes',
    'tomato', 'tomatoes', 'cherry tomato', 'cherry tomatoes', 'bell pepper', 'peppers',
    'green pepper', 'red pepper', 'yellow pepper', 'jalapeño', 'jalapeños',
    'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower',
    'cucumber', 'cucumbers', 'zucchini', 'squash', 'eggplant', 'mushroom', 'mushrooms',
    'avocado', 'avocados', 'corn', 'peas', 'green beans', 'asparagus',
    'basil', 'parsley', 'cilantro', 'thyme', 'rosemary', 'oregano', 'sage', 'mint',
    'dill', 'chives', 'bay leaf', 'bay leaves', 'leek', 'leeks', 'pineapple'
  ];
  
  // Dairy & Refrigerated
  const dairy = [
    'milk', 'cream', 'heavy cream', 'sour cream', 'yogurt', 'greek yogurt',
    'butter', 'margarine', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta',
    'cream cheese', 'cottage cheese', 'ricotta', 'goat cheese', 'swiss cheese',
    'egg', 'eggs', 'egg white', 'egg whites', 'egg yolk', 'egg yolks'
  ];
  
  // Meat & Seafood
  const meatSeafood = [
    'chicken', 'chicken breast', 'chicken thigh', 'chicken wing', 'turkey', 'duck',
    'beef', 'ground beef', 'steak', 'roast', 'pork', 'ham', 'bacon', 'sausage',
    'lamb', 'veal', 'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'crab',
    'lobster', 'scallops', 'mussels', 'clams', 'oysters', 'white fish', 'crab sticks'
  ];
  
  // Pantry & Dry Goods
  const pantry = [
    'flour', 'sugar', 'brown sugar', 'salt', 'pepper', 'black pepper', 'salt and pepper',
    'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'vinegar', 'balsamic vinegar',
    'soy sauce', 'worcestershire sauce', 'hot sauce', 'ketchup', 'mustard', 'mayonnaise',
    'rice', 'pasta', 'penne', 'spaghetti', 'noodles', 'quinoa', 'oats', 'cereal',
    'bread', 'breadcrumbs', 'crackers', 'tortillas', 'pita bread',
    'beans', 'black beans', 'kidney beans', 'chickpeas', 'lentils', 'split peas',
    'nuts', 'almonds', 'walnuts', 'pecans', 'peanuts', 'cashews', 'pine nuts', 'raisins',
    'vanilla', 'vanilla extract', 'baking powder', 'baking soda', 'yeast',
    'cinnamon', 'paprika', 'cumin', 'chili powder', 'garlic powder', 'onion powder',
    'italian seasoning', 'herbs', 'spices', 'honey', 'maple syrup', 'molasses',
    'coconut milk', 'broth', 'stock', 'chicken broth', 'beef broth', 'vegetable broth'
  ];
  
  // Canned & Jarred
  const canned = [
    'tomato sauce', 'tomato paste', 'diced tomatoes', 'crushed tomatoes',
    'coconut milk', 'evaporated milk', 'condensed milk',
    'olives', 'pickles', 'capers', 'sun-dried tomatoes',
    'jam', 'jelly', 'peanut butter', 'almond butter', 'tahini',
    'salsa', 'pasta sauce', 'marinara sauce', 'alfredo sauce'
  ];
  
  // Frozen
  const frozen = [
    'frozen vegetables', 'frozen fruit', 'frozen berries', 'ice cream', 'frozen yogurt',
    'frozen pizza', 'frozen meals', 'frozen fish', 'frozen shrimp'
  ];
  
  // Beverages
  const beverages = [
    'water', 'sparkling water', 'juice', 'orange juice', 'apple juice', 'cranberry juice',
    'soda', 'coffee', 'tea', 'wine', 'beer', 'coconut water', 'almond milk', 'soy milk'
  ];
  
  // Baked Goods
  const bakedGoods = [
    'bagels', 'muffins', 'croissants', 'donuts', 'cake', 'cookies', 'pie', 'pastry'
  ];
  
  // Snacks
  const snacks = [
    'chips', 'pretzels', 'popcorn', 'granola bars', 'trail mix', 'dried fruit',
    'chocolate', 'candy', 'gum'
  ];
  
  // Household (non-food items that might appear)
  const household = [
    'paper towels', 'toilet paper', 'napkins', 'aluminum foil', 'plastic wrap',
    'trash bags', 'dish soap', 'laundry detergent'
  ];
  
  // Check each category
  if (produce.some(item => name.includes(item) || item.includes(name))) return 'Produce';
  if (dairy.some(item => name.includes(item) || item.includes(name))) return 'Dairy & Refrigerated';
  if (meatSeafood.some(item => name.includes(item) || item.includes(name))) return 'Meat & Seafood';
  if (frozen.some(item => name.includes(item) || item.includes(name))) return 'Frozen';
  if (canned.some(item => name.includes(item) || item.includes(name))) return 'Canned & Jarred';
  if (beverages.some(item => name.includes(item) || item.includes(name))) return 'Beverages';
  if (bakedGoods.some(item => name.includes(item) || item.includes(name))) return 'Baked Goods';
  if (snacks.some(item => name.includes(item) || item.includes(name))) return 'Snacks';
  if (household.some(item => name.includes(item) || item.includes(name))) return 'Household';
  if (pantry.some(item => name.includes(item) || item.includes(name))) return 'Pantry & Dry Goods';
  
  // Default category
  return 'Other';
};

// Helper function to get a shortened recipe name for display
export const getShortRecipeName = (recipeName: string): string => {
  // Remove common prefixes and suffixes
  let shortened = recipeName
    .replace(/^(easy|quick|simple|classic|homemade|perfect|best|delicious|amazing)\s+/i, '')
    .replace(/\s+(recipe|dish|meal)$/i, '')
    .trim();
  
  // If still too long, truncate and add ellipsis
  if (shortened.length > 20) {
    shortened = shortened.substring(0, 17) + '...';
  }
  
  return shortened;
};

// Helper function to get meal type color
export const getMealTypeColor = (mealType: string): string => {
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return 'bg-lemon text-gray-800';
    case 'lunch':
      return 'bg-terra-400 text-white';
    case 'dinner':
      return 'bg-primary-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};