import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Check, Filter, Leaf, Wheat, Milk, Zap, Heart, Salad } from 'lucide-react';
import { useDietary, DietaryFilter, CustomDietaryFilter } from '../contexts/DietaryContext';

interface DietaryFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dietaryOptions: Array<{
  id: DietaryFilter;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    id: 'gluten-free',
    name: 'Gluten-Free',
    description: 'Excludes wheat, barley, rye, and other gluten-containing ingredients',
    icon: <Wheat className="w-5 h-5" />,
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  {
    id: 'dairy-free',
    name: 'Dairy-Free',
    description: 'Excludes milk, cheese, butter, and all dairy products',
    icon: <Milk className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'ketogenic',
    name: 'Ketogenic',
    description: 'High-fat, low-carb diet for ketosis',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: 'vegan',
    name: 'Vegan',
    description: 'Plant-based diet excluding all animal products',
    icon: <Leaf className="w-5 h-5" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    description: 'Excludes meat and fish, includes dairy and eggs',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  {
    id: 'lacto-vegetarian',
    name: 'Lacto-Vegetarian',
    description: 'Vegetarian diet that includes dairy but excludes eggs',
    icon: <Salad className="w-5 h-5" />,
    color: 'bg-teal-100 text-teal-700 border-teal-200'
  }
];

const commonIntolerances = [
  'dairy', 'egg', 'gluten', 'grain', 'peanut', 'seafood', 'sesame', 'shellfish', 'soy', 'sulfite', 'tree nut', 'wheat'
];

const commonDiets = [
  'gluten free', 'ketogenic', 'vegetarian', 'lacto-vegetarian', 'ovo-vegetarian', 'vegan', 'pescetarian', 'paleo', 'primal', 'whole30'
];

function DietaryFiltersModal({ isOpen, onClose }: DietaryFiltersModalProps) {
  const { activeDiets, customFilters, toggleDiet, addCustomFilter, removeCustomFilter } = useDietary();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    diet: '',
    intolerances: [] as string[],
    excludeIngredients: [] as string[],
    newIntolerance: '',
    newIngredient: ''
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;

    addCustomFilter({
      name: customForm.name,
      diet: customForm.diet || undefined,
      intolerances: customForm.intolerances,
      excludeIngredients: customForm.excludeIngredients
    });

    // Reset form
    setCustomForm({
      name: '',
      diet: '',
      intolerances: [],
      excludeIngredients: [],
      newIntolerance: '',
      newIngredient: ''
    });
    setShowCustomForm(false);
  };

  const addIntolerance = () => {
    if (customForm.newIntolerance.trim() && !customForm.intolerances.includes(customForm.newIntolerance.trim())) {
      setCustomForm(prev => ({
        ...prev,
        intolerances: [...prev.intolerances, prev.newIntolerance.trim()],
        newIntolerance: ''
      }));
    }
  };

  const addIngredient = () => {
    if (customForm.newIngredient.trim() && !customForm.excludeIngredients.includes(customForm.newIngredient.trim())) {
      setCustomForm(prev => ({
        ...prev,
        excludeIngredients: [...prev.excludeIngredients, prev.newIngredient.trim()],
        newIngredient: ''
      }));
    }
  };

  const removeIntolerance = (intolerance: string) => {
    setCustomForm(prev => ({
      ...prev,
      intolerances: prev.intolerances.filter(i => i !== intolerance)
    }));
  };

  const removeIngredient = (ingredient: string) => {
    setCustomForm(prev => ({
      ...prev,
      excludeIngredients: prev.excludeIngredients.filter(i => i !== ingredient)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Dietary Filters</h2>
                  <p className="text-sm text-gray-600">Customize your meal recommendations</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Standard Dietary Filters */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Standard Diets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dietaryOptions.map((option) => {
                    const isActive = activeDiets.includes(option.id);
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleDiet(option.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isActive 
                            ? `${option.color} border-current shadow-md` 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white'}`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{option.name}</h4>
                              {isActive && <Check className="w-4 h-4" />}
                            </div>
                            <p className="text-sm opacity-75 mt-1">{option.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Filters Section */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Custom Filters</h3>
                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Filter
                  </button>
                </div>

                {/* Custom Filter Form */}
                <AnimatePresence>
                  {showCustomForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <form onSubmit={handleCustomSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter Name *
                          </label>
                          <input
                            type="text"
                            value={customForm.name}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Low Sodium, Nut-Free"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Diet Type (Optional)
                          </label>
                          <select
                            value={customForm.diet}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, diet: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select a diet type...</option>
                            {commonDiets.map(diet => (
                              <option key={diet} value={diet}>{diet}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Intolerances
                          </label>
                          <div className="flex gap-2 mb-2">
                            <select
                              value={customForm.newIntolerance}
                              onChange={(e) => setCustomForm(prev => ({ ...prev, newIntolerance: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="">Select intolerance...</option>
                              {commonIntolerances.map(intolerance => (
                                <option key={intolerance} value={intolerance}>{intolerance}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={addIntolerance}
                              className="btn-secondary"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {customForm.intolerances.map(intolerance => (
                              <span
                                key={intolerance}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                              >
                                {intolerance}
                                <button
                                  type="button"
                                  onClick={() => removeIntolerance(intolerance)}
                                  className="hover:text-red-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exclude Ingredients
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={customForm.newIngredient}
                              onChange={(e) => setCustomForm(prev => ({ ...prev, newIngredient: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              placeholder="e.g., mushrooms, cilantro"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                            />
                            <button
                              type="button"
                              onClick={addIngredient}
                              className="btn-secondary"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {customForm.excludeIngredients.map(ingredient => (
                              <span
                                key={ingredient}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                              >
                                {ingredient}
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(ingredient)}
                                  className="hover:text-orange-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary">
                            Create Filter
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCustomForm(false)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Existing Custom Filters */}
                {customFilters.length > 0 && (
                  <div className="space-y-3">
                    {customFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{filter.name}</h4>
                            {filter.diet && (
                              <p className="text-sm text-gray-600 mt-1">Diet: {filter.diet}</p>
                            )}
                            {filter.intolerances.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Intolerances: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {filter.intolerances.map(intolerance => (
                                    <span
                                      key={intolerance}
                                      className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                                    >
                                      {intolerance}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {filter.excludeIngredients.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Excludes: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {filter.excludeIngredients.map(ingredient => (
                                    <span
                                      key={ingredient}
                                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                                    >
                                      {ingredient}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeCustomFilter(filter.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {customFilters.length === 0 && !showCustomForm && (
                  <div className="text-center py-8 text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No custom filters created yet.</p>
                    <p className="text-sm">Create a custom filter to match your specific dietary needs.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {activeDiets.length > 0 ? (
                    <span>{activeDiets.length} filter{activeDiets.length !== 1 ? 's' : ''} active</span>
                  ) : (
                    <span>No filters active</span>
                  )}
                </div>
                <button onClick={onClose} className="btn-primary">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DietaryFiltersModal;