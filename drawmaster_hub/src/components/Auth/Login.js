import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Auth.css';

/**
 * Login Component
 * 
 * Provides a form for users to log in with their email and password.
 * Uses the AuthContext to authenticate users and handle auth state.
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { login, error, loading, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
    
    // Clear global auth error when user starts typing
    if (error) {
      clearError();
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(email, password);
      
      // If no error after login attempt, redirect to homepage
      if (!error) {
        navigate('/');
      }
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Login</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Your email"
            required
          />
          {formErrors.email && <span className="auth-error">{formErrors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Your password"
            required
          />
          {formErrors.password && <span className="auth-error">{formErrors.password}</span>}
        </div>
        
        <button 
          type="submit" 
          className="auth-btn" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-toggle">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Login;
