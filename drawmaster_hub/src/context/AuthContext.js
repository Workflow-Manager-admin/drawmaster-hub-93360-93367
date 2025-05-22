import React, { createContext, useState, useEffect } from 'react';

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
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (response.ok) {
            setUser(data.data);
            setIsAuthenticated(true);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem('auth_token');
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Error verifying authentication:', err);
          setIsAuthenticated(false);
        }
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
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        
        // Get user data after successful registration
        await loadUser(data.token);
      } else {
        setError(data.error || 'Registration failed');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError('An error occurred during registration');
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
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Invalid credentials');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load user data
  const loadUser = async (currentToken = token) => {
    if (!currentToken) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.data);
      } else {
        // If token is invalid, clear it
        logout();
      }
    } catch (err) {
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
