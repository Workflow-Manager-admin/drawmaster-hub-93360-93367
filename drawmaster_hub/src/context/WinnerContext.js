import React, { createContext, useState, useContext } from 'react';
import { get, post } from '../utils/api';
import AuthContext from './AuthContext';

/**
 * Winner Context
 * 
 * Provides winner state and functions to manage winners throughout the application.
 * Handles selecting winners and retrieving winner data for contests.
 */
const WinnerContext = createContext();

export const WinnerProvider = ({ children }) => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get auth context to check for admin permissions
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  /**
   * Select a winner for a contest (admin only)
   * @param {Object} winnerData - Winner data including contestId, submissionId, rank
   * @returns {Promise<Object|null>} Created winner or null if failed
   * @PUBLIC_INTERFACE
   */
  const selectWinner = async (winnerData) => {
    if (!isAdmin) {
      setError('Only administrators can select winners');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await post('/winners', winnerData);
      
      // Update local state
      setWinners(prevWinners => [...prevWinners, response.data]);
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to select winner');
      console.error('Error selecting winner:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all winners for a specific contest
   * @param {string} contestId - Contest ID
   * @returns {Promise<Array>} Array of winners
   * @PUBLIC_INTERFACE
   */
  const getWinnersByContest = async (contestId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await get(`/winners/${contestId}`);
      
      // Sort winners by rank
      const sortedWinners = response.data.sort((a, b) => a.rank - b.rank);
      setWinners(sortedWinners);
      
      return sortedWinners;
    } catch (err) {
      setError(err.message || `Failed to fetch winners for contest ${contestId}`);
      console.error('Error fetching contest winners:', err);
      return [];
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
    <WinnerContext.Provider
      value={{
        winners,
        loading,
        error,
        selectWinner,
        getWinnersByContest,
        clearError,
        isAdmin
      }}
    >
      {children}
    </WinnerContext.Provider>
  );
};

export default WinnerContext;
