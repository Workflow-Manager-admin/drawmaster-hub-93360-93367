import React, { createContext, useState, useEffect } from 'react';
import { get, post } from '../utils/api';

/**
 * Authentication Context
 * 
 * Provides authentication state and functions to the entire application.
 * Handles user login, registration, and token management.
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if the user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          const data = await get('/users/me');
          setUser(data.data);
          setIsAuthenticated(true);
        } catch (err) {
          // If token is invalid, clear it
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          console.error('Error verifying authentication:', err);
        }
      } else {
        // Make sure we reset authentication state if no token
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, [token]);
  
  // Register user
  const register = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await post('/users/register', userData);
      
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Get user data after successful registration
      await loadUser(data.token);
    } catch (err) {
      setError(err.message || 'Registration failed');
      setIsAuthenticated(false);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const data = await post('/users/login', { email, password });
      
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      setIsAuthenticated(false);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load user data
  const loadUser = async (currentToken = token) => {
    if (!currentToken) return;
    
    try {
      // Token is automatically included in the request by the API utility
      const data = await get('/users/me');
      setUser(data.data);
    } catch (err) {
      // If token is invalid, clear it
      logout();
      console.error('Error loading user data:', err);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Clear error state
  const clearError = () => {
    setError(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
