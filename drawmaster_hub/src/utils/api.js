import axios from 'axios';

/**
 * API utility module
 * 
 * Provides functions for making authenticated API requests to the backend
 * using axios. Automatically includes JWT token in requests when available.
 */

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = 
      error.response?.data?.error || 
      'An error occurred while making the request';
    
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      
      // Optional: redirect to login page
      // window.location.href = '/login';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Make a GET request
 * @param {string} endpoint - The API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise} The axios promise
 */
export const get = (endpoint, params = {}) => {
  return api.get(endpoint, { params });
};

/**
 * Make a POST request
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} The axios promise
 */
export const post = (endpoint, data = {}) => {
  return api.post(endpoint, data);
};

/**
 * Make a PUT request
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} The axios promise
 */
export const put = (endpoint, data = {}) => {
  return api.put(endpoint, data);
};

/**
 * Make a DELETE request
 * @param {string} endpoint - The API endpoint
 * @returns {Promise} The axios promise
 */
export const del = (endpoint) => {
  return api.delete(endpoint);
};

export default {
  get,
  post,
  put,
  delete: del
};
