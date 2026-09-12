import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PantryProvider } from './context/PantryContext';

// Layouts & Guards
import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Protected Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Pantry from './pages/Pantry/Pantry';
import Recipes from './pages/Recipes/Recipes';
import RecipeDetails from './pages/Recipes/RecipeDetails';
import ShoppingList from './pages/ShoppingList/ShoppingList';
import MealPlanner from './pages/MealPlanner/MealPlanner';
import Favorites from './pages/Favorites/Favorites';
import Notifications from './pages/Notifications/Notifications';
import Profile from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PantryProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes inside Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pantry" element={<Pantry />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:id" element={<RecipeDetails />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/meal-planner" element={<MealPlanner />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin Only Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PantryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
