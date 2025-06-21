import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { SpoonacularRecipe, Ingredient } from '../types';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: SpoonacularRecipe) => Promise<void>;
}

export function AddRecipeModal({ isOpen, onClose, onSave }: AddRecipeModalProps) {
  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [calories, setCalories] = useState('0');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [dishTypes, setDishTypes] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });

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
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipe: SpoonacularRecipe = {
      id: -Date.now(), // Negative ID to avoid conflicts with Spoonacular IDs
      title,
      readyInMinutes: parseInt(prepTime),
      servings: parseInt(servings),
      calories: parseInt(calories),
      image: '', // You might want to add image upload functionality
      cuisines,
      instructions: instructions.filter(i => i.trim()),
      ingredients,
      dishTypes,
      isUserCreated: true
    };

    await onSave(recipe);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <form onSubmit={handleSubmit}>
              {/* Form header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add New Recipe</h2>
                <button type="button" onClick={onClose}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recipe Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Prep Time (minutes)"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Servings"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="p-2 border rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Calories"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div className="space-y-4">
                  <h3 className="font-medium">Ingredients</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newIngredient.amount}
                      onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                      className="w-24 p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="w-24 p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="btn-secondary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1">{ing.amount} {ing.unit} {ing.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="font-medium">Instructions</h3>
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="w-6 text-center">{index + 1}.</span>
                      <input
                        type="text"
                        value={instruction}
                        onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder={`Step ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(index)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddInstruction}
                    className="btn-secondary w-full"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              {/* Form footer */}
              <div className="border-t p-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}