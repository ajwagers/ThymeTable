import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { DietaryProvider } from './contexts/DietaryContext';
import { ServingsProvider } from './contexts/ServingsContext';
import { MeasurementProvider } from './contexts/MeasurementContext';
import { PrivateRoute } from './components/PrivateRoute';
import Header from './components/Header';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import GroceryListPage from './pages/GroceryListPage';
import FavoritesPage from './pages/FavoritesPage';
import SavedMealPlansPage from './pages/SavedMealPlansPage';
import LoginPage from './pages/LoginPage';
import SubscriptionPage from './pages/SubscriptionPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';

function App() {
  return (
    <AuthProvider>
      <DietaryProvider>
        <SubscriptionProvider>
          <FavoritesProvider>
            <MeasurementProvider>
              <ServingsProvider>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                  <Header />
                  <main className="flex-1 px-2 py-4">
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                      <Route
                        path="/"
                        element={
                          <PrivateRoute>
                            <WeeklyPlannerPage />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/recipe/:id"
                        element={
                          <PrivateRoute>
                            <RecipeDetailsPage />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/grocery-list"
                        element={
                          <PrivateRoute>
                            <GroceryListPage />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/favorites"
                        element={
                          <PrivateRoute>
                            <FavoritesPage />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/saved-plans"
                        element={
                          <PrivateRoute>
                            <SavedMealPlansPage />
                          </PrivateRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <footer className="py-6 bg-white border-t border-gray-200">
                    <div className="px-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left text-gray-500 text-sm">
                        © {new Date().getFullYear()} Weekly Diet Planner App. All rights reserved.
                      </div>
                      
                      {/* Powered by logos */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Bolt Logo */}
                        <a
                          href="https://bolt.new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Made with Bolt.new"
                        >
                          <img
                            src="/black_circle_360x360.png"
                            alt="Powered by Bolt"
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-xs text-gray-600 group-hover:text-gray-800">
                            Made with Bolt.new
                          </span>
                        </a>
                        
                        {/* Supabase Logo */}
                        <a
                          href="https://supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Powered by Supabase"
                        >
                          <img
                            src="/supabase-logo-wordmark--light.png"
                            alt="Powered by Supabase"
                            className="h-4 w-auto"
                          />
                          <span className="text-xs text-gray-600 group-hover:text-gray-800">
                            Powered by Supabase
                          </span>
                        </a>
                      </div>
                    </div>
                  </footer>
                </div>
              </ServingsProvider>
            </MeasurementProvider>
          </FavoritesProvider>
        </SubscriptionProvider>
      </DietaryProvider>
    </AuthProvider>
  );
}

export default App;