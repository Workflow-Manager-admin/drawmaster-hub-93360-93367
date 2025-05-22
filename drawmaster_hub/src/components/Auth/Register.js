import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Auth.css';

/**
 * Register Component
 * 
 * Provides a form for new users to create an account.
 * Uses the AuthContext to register users and handle auth state.
 */
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { register, error, loading, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { name, email, password, confirmPassword } = formData;
  
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
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
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
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const userData = {
        name,
        email,
        password
      };
      
      await register(userData);
      
      // If no error after registration, redirect to homepage
      if (!error) {
        navigate('/');
      }
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Register</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
          {formErrors.name && <span className="auth-error">{formErrors.name}</span>}
        </div>
        
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
          {formErrors.confirmPassword && (
            <span className="auth-error">{formErrors.confirmPassword}</span>
          )}
        </div>
        
        <button 
          type="submit" 
          className="auth-btn" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-toggle">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Register;
