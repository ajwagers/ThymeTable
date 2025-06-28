import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { SpoonacularRecipe, Ingredient } from '../types';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: SpoonacularRecipe) => Promise<void>;
  mealType?: string;
  category?: 'main' | 'side';
}

export function AddRecipeModal({ isOpen, onClose, onSave, mealType = 'dinner', category = 'main' }: AddRecipeModalProps) {
  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [calories, setCalories] = useState('300');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [dishTypes, setDishTypes] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setPrepTime('30');
    setServings('4');
    setCalories('300');
    setIngredients([]);
    setInstructions(['']);
    setCuisines([]);
    setDishTypes([]);
    setNewIngredient({ name: '', amount: '', unit: '' });
  };

  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      setIngredients([...ingredients, {
        name: newIngredient.name,
        amount: parseFloat(newIngredient.amount),
        unit: newIngredient.unit || '',
      }]);
      setNewIngredient({ name: '', amount: '', unit: '' });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    setInstructions(instructions.map((inst, i) => i === index ? value : inst));
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setSaving(true);
    
    try {
      const recipe: SpoonacularRecipe = {
        id: -Date.now(), // Negative ID to avoid conflicts with Spoonacular IDs
        title: title.trim(),
        readyInMinutes: parseInt(prepTime) || 30,
        servings: parseInt(servings) || 4,
        calories: parseInt(calories) || 300,
        image: '/No Image.png', // Use custom placeholder image
        cuisines: cuisines.filter(c => c.trim()),
        instructions: instructions.filter(i => i.trim()),
        ingredients,
        dishTypes: dishTypes.filter(d => d.trim()),
        isUserCreated: true
      };

      await onSave(recipe);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const getMealTypeColor = () => {
    switch (mealType) {
      case 'breakfast': return 'bg-lemon text-gray-800';
      case 'lunch': return 'bg-terra-400 text-white';
      case 'dinner': return 'bg-primary-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <form onSubmit={handleSubmit}>
              {/* Form header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMealTypeColor()}`}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)} {category}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Recipe</h2>
                </div>
                <button 
                  type="button" 
                  onClick={handleClose}
                  disabled={saving}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="recipe-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipe Title *
                    </label>
                    <input
                      id="recipe-title"
                      type="text"
                      placeholder="Enter recipe name"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="prep-time" className="block text-sm font-medium text-gray-700 mb-1">
                        Prep Time (min) *
                      </label>
                      <input
                        id="prep-time"
                        type="number"
                        placeholder="30"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                        Servings *
                      </label>
                      <input
                        id="servings"
                        type="number"
                        placeholder="4"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                        Calories *
                      </label>
                      <input
                        id="calories"
                        type="number"
                        placeholder="300"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newIngredient.amount}
                      onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      step="0.1"
                      min="0"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="btn-primary px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {ingredients.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {ingredients.map((ing, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <span className="flex-1 text-sm">
                            {ing.amount} {ing.unit} {ing.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="w-8 h-10 flex items-center justify-center bg-primary-100 text-primary-700 rounded-md text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <textarea
                        value={instruction}
                        onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder={`Step ${index + 1} instructions...`}
                        rows={2}
                      />
                      {instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInstruction(index)}
                          className="text-red-500 hover:text-red-700 p-2 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddInstruction}
                    className="btn-secondary w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </button>
                </div>
              </div>

              {/* Form footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="btn-secondary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Recipe'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}