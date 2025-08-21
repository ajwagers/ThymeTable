// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedEmail?: string; // Add this prop
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedEmail }) => {
  const { user, loading } = useAuth(); // Get user and loading state
  const navigate = useNavigate(); // Initialize useNavigate

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Add the email check here
  if (user) {
    if (allowedEmail && user.email !== allowedEmail) {
      // If an allowedEmail is specified and the user's email doesn't match, redirect
      navigate('/'); // Redirect to home page
      return null; // Don't render children
    }
    return <>{children}</>;
  }

  return <Navigate to="/login" replace />;
};
