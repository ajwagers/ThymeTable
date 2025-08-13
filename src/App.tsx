import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <DietaryProvider>
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
                        {/* Publicly accessible blog routes */}
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<ArticlePage />} />
                        {/* Private routes */}
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
                    
                    {/* SEO-Enhanced Footer */}
                    <footer className="py-6 bg-white border-t border-gray-200">
                      <div className="px-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left text-gray-500 text-sm">
                          © {new Date().getFullYear()} Weekly Diet Planner App - Meal Planning for Restrictive Diets. All rights reserved.
                        </div>
                        
                        {/* SEO-friendly links section */}
                        <div className="hidden lg:flex items-center gap-4 text-xs text-gray-500">
                          <span>Specializing in:</span>
                          <span className="text-primary-600">Celiac Meal Planning</span>
                          <span>•</span>
                          <span className="text-primary-600">Food Allergy Safe Recipes</span>
                          <span>•</span>
                          <span className="text-primary-600">Keto Weekly Plans</span>
                        </div>
                        
                        {/* Powered by logos */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          {/* Bolt Logo */}
                          <a
                            href="https://bolt.new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                            title="Built with Bolt.new - Rapid Web Development"
                            aria-label="Made with Bolt.new development platform"
                          >
                            <img
                              src="/black_circle_360x360.png"
                              alt="Bolt.new Logo"
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
                            title="Database powered by Supabase"
                            aria-label="Powered by Supabase database platform"
                          >
                            <img
                              src="/supabase-logo-wordmark--light.png"
                              alt="Supabase Logo"
                              className="h-4 w-auto"
                            />
                            <span className="text-xs text-gray-600 group-hover:text-gray-800">
                              Powered by Supabase
                            </span>
                          </a>
                        </div>
                      </div>
                      
                      {/* Additional SEO footer content */}
                      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-500 max-w-4xl mx-auto">
                          Weekly Diet Planner App is the leading meal planning software for families managing restrictive diets, 
                          food allergies, and medical dietary requirements. Our specialized platform helps users create safe, 
                          compliant weekly meal plans for celiac disease, multiple food allergies, keto, gluten-free, AIP, 
                          low FODMAP, and other challenging dietary restrictions.
                        </p>
                      </div>
                    </footer>
                  </div>
                </ServingsProvider>
              </MeasurementProvider>
            </FavoritesProvider>
          </DietaryProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;