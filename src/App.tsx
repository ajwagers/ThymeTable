import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ServingsProvider } from './contexts/ServingsContext';
import { MeasurementProvider } from './contexts/MeasurementContext';
import { DietaryProvider } from './contexts/DietaryContext';
import { PrivateRoute } from './components/PrivateRoute';
import Header from './components/Header';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import GroceryListPage from './pages/GroceryListPage';
import FavoritesPage from './pages/FavoritesPage';
import SavedMealPlansPage from './pages/SavedMealPlansPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <DietaryProvider>
          <MeasurementProvider>
            <ServingsProvider>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 px-2 py-4">
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
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
                  <div className="px-2 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} ThymeTable. All rights reserved.
                  </div>
                </footer>
              </div>
            </ServingsProvider>
          </MeasurementProvider>
        </DietaryProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;