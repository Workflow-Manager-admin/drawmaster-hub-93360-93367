import React, { createContext, useState, useContext } from 'react';
import { get, post, put, del } from '../utils/api';
import AuthContext from './AuthContext';

/**
 * Submission Context
 * 
 * Provides submission state and functions to manage submissions throughout the application.
 * Handles fetching, creating, updating, and deleting submissions, as well as error management.
 */
const SubmissionContext = createContext();

export const SubmissionProvider = ({ children }) => {
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth context to check for user authentication
  const { user, isAuthenticated } = useContext(AuthContext);

  /**
   * Fetch all submissions for the current user or all if admin
   * @returns {Promise<Array>} Array of submissions
   * @PUBLIC_INTERFACE
   */
  const getSubmissions = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to view submissions');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await get('/submissions');
      setSubmissions(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch a single submission by ID
   * @param {string} id - Submission ID
   * @returns {Promise<Object|null>} Submission data or null if not found
   * @PUBLIC_INTERFACE
   */
  const getSubmission = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(`/submissions/${id}`);
      setCurrentSubmission(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch submission details');
      console.error('Error fetching submission details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all approved submissions for a specific contest
   * @param {string} contestId - Contest ID
   * @returns {Promise<Array>} Array of submissions
   * @PUBLIC_INTERFACE
   */
  const getSubmissionsByContest = async (contestId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(`/submissions/contest/${contestId}`);
      return response.data;
    } catch (err) {
      setError(err.message || `Failed to fetch submissions for contest ${contestId}`);
      console.error('Error fetching contest submissions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new submission
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object|null>} Created submission or null if failed
   * @PUBLIC_INTERFACE
   */
  const createSubmission = async (submissionData) => {
    if (!isAuthenticated) {
      setError('You must be logged in to submit');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add text fields to form data
      formData.append('title', submissionData.title);
      formData.append('description', submissionData.description);
      formData.append('contest', submissionData.contestId);
      
      // Add image file if available
      if (submissionData.image) {
        formData.append('image', submissionData.image);
      } else if (submissionData.imageUrl) {
        formData.append('imageUrl', submissionData.imageUrl);
      } else {
        throw new Error('An image is required for submission');
      }

      // Use the uploadSubmission utility instead of regular post
      const response = await post('/submissions', formData, true);
      
      // Update local state
      setSubmissions(prev => [...prev, response.data]);
      setCurrentSubmission(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create submission');
      console.error('Error creating submission:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing submission
   * @param {string} id - Submission ID
   * @param {Object} submissionData - Updated submission data
   * @returns {Promise<Object|null>} Updated submission or null if failed
   * @PUBLIC_INTERFACE
   */
  const updateSubmission = async (id, submissionData) => {
    if (!isAuthenticated) {
      setError('You must be logged in to update a submission');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add text fields to form data
      if (submissionData.title) formData.append('title', submissionData.title);
      if (submissionData.description) formData.append('description', submissionData.description);
      
      // Add image file if changed
      if (submissionData.image) {
        formData.append('image', submissionData.image);
      } else if (submissionData.imageUrl) {
        formData.append('imageUrl', submissionData.imageUrl);
      }

      // Use the uploadSubmission utility for update too
      const response = await put(`/submissions/${id}`, formData, true);
      
      // Update local state
      setSubmissions(prevSubmissions =>
        prevSubmissions.map(submission =>
          submission._id === id ? response.data : submission
        )
      );
      
      if (currentSubmission && currentSubmission._id === id) {
        setCurrentSubmission(response.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update submission');
      console.error('Error updating submission:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a submission
   * @param {string} id - Submission ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @PUBLIC_INTERFACE
   */
  const deleteSubmission = async (id) => {
    if (!isAuthenticated) {
      setError('You must be logged in to delete a submission');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await del(`/submissions/${id}`);
      
      // Remove from local state
      setSubmissions(prev => prev.filter(submission => submission._id !== id));
      
      // Clear current submission if it's the one being deleted
      if (currentSubmission && currentSubmission._id === id) {
        setCurrentSubmission(null);
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete submission');
      console.error('Error deleting submission:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rate a submission
   * @param {string} id - Submission ID
   * @param {number} rating - Rating value (0-10)
   * @returns {Promise<Object|null>} Updated submission or null if failed
   * @PUBLIC_INTERFACE
   */
  const rateSubmission = async (id, rating) => {
    if (!isAuthenticated) {
      setError('You must be logged in to rate a submission');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await put(`/submissions/${id}/rate`, { rating });
      
      // Update local state if needed
      if (currentSubmission && currentSubmission._id === id) {
        setCurrentSubmission(response.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to rate submission');
      console.error('Error rating submission:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error state
   * @PUBLIC_INTERFACE
   */
  const clearError = () => {
    setError(null);
  };

  return (
    <SubmissionContext.Provider
      value={{
        submissions,
        currentSubmission,
        loading,
        error,
        getSubmissions,
        getSubmission,
        getSubmissionsByContest,
        createSubmission,
        updateSubmission,
        deleteSubmission,
        rateSubmission,
        clearError
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
};

export default SubmissionContext;
