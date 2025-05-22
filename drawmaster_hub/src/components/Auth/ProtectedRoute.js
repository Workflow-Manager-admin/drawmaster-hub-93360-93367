import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

/**
 * Protected Route Component
 * 
 * Wraps routes that should only be accessible to authenticated users.
 * Redirects to login if the user is not authenticated.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} The protected route or a redirect
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Optional: Show a loading spinner or message
    return (
      <div className="loading-indicator">
        <p>Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the children components
  return children;
};

export default ProtectedRoute;
