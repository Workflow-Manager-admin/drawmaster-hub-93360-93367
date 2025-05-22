/**
 * API utility module
 * 
 * Provides functions for making authenticated API requests to the backend.
 * Automatically includes JWT token in requests when available.
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The stored token or null if not found
 */
const getToken = () => localStorage.getItem('auth_token');

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint to call (without the base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} The fetch promise
 */
const apiRequest = async (endpoint, options = {}) => {
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authorization header if token exists
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  // Throw error if the response is not ok
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred while making the request');
  }
  
  return data;
};

/**
 * Make a GET request
 * @param {string} endpoint - The API endpoint
 * @returns {Promise} The fetch promise
 */
export const get = (endpoint) => apiRequest(endpoint);

/**
 * Make a POST request
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} The fetch promise
 */
export const post = (endpoint, data) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});

/**
 * Make a PUT request
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} The fetch promise
 */
export const put = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

/**
 * Make a DELETE request
 * @param {string} endpoint - The API endpoint
 * @returns {Promise} The fetch promise
 */
export const del = (endpoint) => apiRequest(endpoint, {
  method: 'DELETE'
});

export default {
  get,
  post,
  put,
  delete: del
};
