import React, { createContext, useState, useEffect, useContext } from 'react';
import { get, post, put, del } from '../utils/api';
import AuthContext from './AuthContext';

/**
 * Contest Context
 * 
 * Provides contest state and functions to manage contests throughout the application.
 * Handles fetching, creating, updating, and deleting contests, as well as error management.
 */
const ContestContext = createContext();

export const ContestProvider = ({ children }) => {
  const [contests, setContests] = useState([]);
  const [currentContest, setCurrentContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get auth context to check for admin permissions
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  /**
   * Fetch all contests from API
   * @param {Object} filters - Filter parameters (e.g., status)
   * @PUBLIC_INTERFACE
   */
  const getContests = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get('/contests', filters);
      setContests(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch contests');
      console.error('Error fetching contests:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch a single contest by ID
   * @param {string} id - Contest ID
   * @returns {Promise<Object|null>} Contest data or null if not found
   * @PUBLIC_INTERFACE
   */
  const getContest = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(`/contests/${id}`);
      setCurrentContest(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch contest details');
      console.error('Error fetching contest details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new contest (admin only)
   * @param {Object} contestData - Contest data
   * @returns {Promise<Object|null>} Created contest or null if failed
   * @PUBLIC_INTERFACE
   */
  const createContest = async (contestData) => {
    if (!isAdmin) {
      setError('Only administrators can create contests');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post('/contests', contestData);
      setContests(prevContests => [...prevContests, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create contest');
      console.error('Error creating contest:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing contest (admin only)
   * @param {string} id - Contest ID
   * @param {Object} contestData - Updated contest data
   * @returns {Promise<Object|null>} Updated contest or null if failed
   * @PUBLIC_INTERFACE
   */
  const updateContest = async (id, contestData) => {
    if (!isAdmin) {
      setError('Only administrators can update contests');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await put(`/contests/${id}`, contestData);
      
      // Update contests array with the updated contest
      setContests(prevContests =>
        prevContests.map(contest =>
          contest._id === id ? response.data : contest
        )
      );
      
      // Update current contest if it's the one being edited
      if (currentContest && currentContest._id === id) {
        setCurrentContest(response.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update contest');
      console.error('Error updating contest:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a contest (admin only)
   * @param {string} id - Contest ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @PUBLIC_INTERFACE
   */
  const deleteContest = async (id) => {
    if (!isAdmin) {
      setError('Only administrators can delete contests');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await del(`/contests/${id}`);
      
      // Remove contest from state
      setContests(prevContests =>
        prevContests.filter(contest => contest._id !== id)
      );
      
      // Clear current contest if it's the one being deleted
      if (currentContest && currentContest._id === id) {
        setCurrentContest(null);
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete contest');
      console.error('Error deleting contest:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Announce winners for a contest (admin only)
   * @param {string} id - Contest ID
   * @param {Array} winners - Array of winners with submission IDs and ranks
   * @returns {Promise<Object|null>} Updated contest or null if failed
   * @PUBLIC_INTERFACE
   */
  const announceWinners = async (id, winners) => {
    if (!isAdmin) {
      setError('Only administrators can announce winners');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await put(`/contests/${id}/announce-winners`, { winners });
      
      // Update the contest in state
      setContests(prevContests =>
        prevContests.map(contest =>
          contest._id === id ? response.data : contest
        )
      );
      
      // Update current contest if it's the one being updated
      if (currentContest && currentContest._id === id) {
        setCurrentContest(response.data);
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to announce winners');
      console.error('Error announcing winners:', err);
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

  // Initial contest loading when context is created
  useEffect(() => {
    getContests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContestContext.Provider
      value={{
        contests,
        currentContest,
        loading,
        error,
        getContests,
        getContest,
        createContest,
        updateContest,
        deleteContest,
        announceWinners,
        clearError,
        isAdmin
      }}
    >
      {children}
    </ContestContext.Provider>
  );
};

export default ContestContext;
