import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContestContext from '../../context/ContestContext';
import './ContestList.css';

/**
 * ContestList Component
 * 
 * Displays a list of contests with filtering options and management controls.
 * Includes admin functionality for contest management.
 */
const ContestList = ({ isAdminView = false }) => {
  const { 
    contests, 
    loading, 
    error, 
    getContests,
    deleteContest,
    isAdmin 
  } = useContext(ContestContext);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [displayedContests, setDisplayedContests] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const navigate = useNavigate();
  
  // Apply filters to contests
  useEffect(() => {
    let filtered = [...contests];
    
    // Filter by status if not "all"
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contest => contest.status === statusFilter);
    }
    
    setDisplayedContests(filtered);
  }, [contests, statusFilter]);
  
  // Load contests on component mount or when filters change
  useEffect(() => {
    const loadContests = async () => {
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      await getContests(filters);
    };
    
    loadContests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Handle delete confirmation
  const handleDeleteClick = (contestId) => {
    setDeleteConfirm(contestId);
  };
  
  // Handle confirmed delete
  const handleConfirmDelete = async (contestId) => {
    const success = await deleteContest(contestId);
    if (success) {
      setDeleteConfirm(null);
    }
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };
  
  return (
    <div className="contest-list-container">
      <div className="contest-list-header">
        <h2>{isAdminView ? 'Contest Management' : 'Contests'}</h2>
        
        <div className="contest-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select 
              id="status-filter" 
              value={statusFilter} 
              onChange={handleStatusChange}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {isAdmin && isAdminView && (
            <Link to="/contests/new" className="btn contest-create-btn">
              Create New Contest
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="auth-error">
          Error loading contests: {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-indicator">
          <p>Loading contests...</p>
        </div>
      ) : displayedContests.length === 0 ? (
        <div className="no-contests">
          <p>No contests found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <div className="contest-grid">
          {displayedContests.map(contest => (
            <div key={contest._id} className={`contest-card ${contest.status}`}>
              <div className="contest-status-badge">{contest.status}</div>
              <h3>{contest.title}</h3>
              
              <div className="contest-dates">
                <span>
                  <strong>Start:</strong> {formatDate(contest.startDate)}
                </span>
                <span>
                  <strong>Deadline:</strong> {formatDate(contest.deadline)}
                </span>
              </div>
              
              <p className="contest-description">
                {contest.description.length > 120
                  ? `${contest.description.substring(0, 120)}...`
                  : contest.description
                }
              </p>
              
              <div className="contest-actions">
                <button 
                  className="btn" 
                  onClick={() => navigate(`/contests/${contest._id}`)}
                >
                  View Details
                </button>
                
                {isAdmin && isAdminView && (
                  <>
                    <button 
                      className="btn edit-btn" 
                      onClick={() => navigate(`/contests/edit/${contest._id}`)}
                    >
                      Edit
                    </button>
                    
                    {deleteConfirm === contest._id ? (
                      <div className="delete-confirm">
                        <span>Are you sure?</span>
                        <button 
                          className="btn delete-btn" 
                          onClick={() => handleConfirmDelete(contest._id)}
                        >
                          Yes
                        </button>
                        <button 
                          className="btn cancel-btn" 
                          onClick={handleCancelDelete}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn delete-btn" 
                        onClick={() => handleDeleteClick(contest._id)}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestList;
