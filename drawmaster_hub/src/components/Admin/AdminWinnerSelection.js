import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContestContext from '../../context/ContestContext';
import SubmissionContext from '../../context/SubmissionContext';
import WinnerContext from '../../context/WinnerContext';
import AuthContext from '../../context/AuthContext';
import './AdminWinnerSelection.css';

/**
 * AdminWinnerSelection Component
 * 
 * Admin interface for selecting winners for a completed contest.
 * Allows ranking of submissions and announcing winners.
 */
const AdminWinnerSelection = ({ contestId, onClose }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const resolvedContestId = contestId || id;
  
  // Contexts
  const { user } = useContext(AuthContext);
  const { getContest, currentContest } = useContext(ContestContext);
  const { getSubmissionsByContest } = useContext(SubmissionContext);
  const { selectWinner, error: winnerError, clearError } = useContext(WinnerContext);
  
  // State
  const [approvedSubmissions, setApprovedSubmissions] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Load contest and submissions
  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setIsAuthorized(false);
      return;
    }
    
    const loadContestData = async () => {
      setLoading(true);
      try {
        // Get contest details if not already loaded
        if (!currentContest || currentContest._id !== resolvedContestId) {
          await getContest(resolvedContestId);
        }
        
        // Get approved submissions for the contest
        const submissionsData = await getSubmissionsByContest(resolvedContestId);
        setApprovedSubmissions(submissionsData);
      } catch (err) {
        setError(err.message || 'Failed to load contest data');
      } finally {
        setLoading(false);
      }
    };
    
    if (resolvedContestId) {
      loadContestData();
    }
  }, [resolvedContestId, getContest, getSubmissionsByContest, currentContest]);

  // Reset error when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handler for adding a submission as a winner
  const handleAddWinner = (submissionId) => {
    // Check if submission is already selected
    const existingWinner = selectedWinners.find(w => w.submissionId === submissionId);
    if (existingWinner) {
      setError('This submission is already selected as a winner');
      return;
    }
    
    // Add winner with next available rank
    const nextRank = selectedWinners.length > 0 
      ? Math.max(...selectedWinners.map(w => w.rank)) + 1 
      : 1;
    
    setSelectedWinners([
      ...selectedWinners, 
      { 
        submissionId, 
        rank: nextRank,
        submission: approvedSubmissions.find(s => s._id === submissionId)
      }
    ]);
    
    setError(null);
    setSuccess('Winner added successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handler for changing rank of a winner
  const handleRankChange = (submissionId, newRank) => {
    // Validate rank is a positive integer
    const rankNum = parseInt(newRank);
    if (isNaN(rankNum) || rankNum < 1) {
      setError('Rank must be a positive number');
      return;
    }
    
    // Check if rank is already assigned
    const existingWithRank = selectedWinners.find(
      w => w.submissionId !== submissionId && w.rank === rankNum
    );
    
    if (existingWithRank) {
      setError(`Rank ${rankNum} is already assigned to another submission`);
      return;
    }
    
    // Update rank
    setSelectedWinners(
      selectedWinners.map(w => 
        w.submissionId === submissionId 
          ? { ...w, rank: rankNum } 
          : w
      )
    );
    
    setError(null);
  };

  // Handler for removing a winner
  const handleRemoveWinner = (submissionId) => {
    setSelectedWinners(selectedWinners.filter(w => w.submissionId !== submissionId));
    setError(null);
  };

  // Save winners to the server
  const handleSubmitWinners = async () => {
    if (selectedWinners.length === 0) {
      setError('Please select at least one winner');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Save each winner
      for (const winner of selectedWinners) {
        await selectWinner({
          contestId: resolvedContestId,
          submissionId: winner.submissionId,
          rank: winner.rank
        });
        
        if (winnerError) {
          throw new Error(winnerError);
        }
      }
      
      setSuccess('Winners saved successfully!');
      
      // Navigate back to contest detail after 2 seconds
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate(`/contests/${resolvedContestId}`);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to save winners');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="winner-selection-loading">
        <p>Loading contest submissions...</p>
      </div>
    );
  }

  if (!currentContest) {
    return (
      <div className="winner-selection-error">
        <h3>Contest Not Found</h3>
        <p>Unable to find the specified contest.</p>
        <button className="btn" onClick={() => navigate('/contests')}>
          Back to Contests
        </button>
      </div>
    );
  }

  if (currentContest.status !== 'completed') {
    return (
      <div className="winner-selection-error">
        <h3>Contest Not Completed</h3>
        <p>Winners can only be selected for completed contests.</p>
        <button className="btn" onClick={() => navigate(`/contests/${resolvedContestId}`)}>
          Back to Contest
        </button>
      </div>
    );
  }

  return (
    <div className="admin-winner-selection">
      <div className="winner-selection-header">
        <h2>Select Winners for {currentContest.title}</h2>
        <p className="winner-selection-subtitle">
          Choose submissions and assign ranks to announce winners
        </p>
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="winner-selection-message error">
          <p>{error}</p>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {success && (
        <div className="winner-selection-message success">
          <p>{success}</p>
          <button className="close-btn" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}
      
      <div className="winner-selection-content">
        {/* Selected Winners List */}
        <div className="selected-winners">
          <h3>Selected Winners</h3>
          
          {selectedWinners.length === 0 ? (
            <p className="no-winners">No winners selected yet</p>
          ) : (
            <ul className="selected-winners-list">
              {selectedWinners
                .sort((a, b) => a.rank - b.rank)
                .map(winner => (
                  <li key={winner.submissionId} className="selected-winner-item">
                    <div className="winner-rank">
                      <label htmlFor={`rank-${winner.submissionId}`}>Rank:</label>
                      <input
                        id={`rank-${winner.submissionId}`}
                        type="number"
                        min="1"
                        value={winner.rank}
                        onChange={(e) => handleRankChange(winner.submissionId, e.target.value)}
                        className="rank-input"
                      />
                    </div>
                    
                    <div className="winner-info">
                      <p className="winner-title">{winner.submission.title}</p>
                      <p className="winner-author">
                        By: {winner.submission.user ? winner.submission.user.name : 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="winner-actions">
                      <button
                        className="btn remove-btn"
                        onClick={() => handleRemoveWinner(winner.submissionId)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
          
          <div className="winner-selection-actions">
            <button 
              className="btn save-btn"
              onClick={handleSubmitWinners}
              disabled={selectedWinners.length === 0 || loading}
            >
              {loading ? 'Saving...' : 'Save Winners'}
            </button>
            
            <button 
              className="btn cancel-btn"
              onClick={() => onClose ? onClose() : navigate(`/contests/${resolvedContestId}`)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
        
        {/* Available Submissions List */}
        <div className="available-submissions">
          <h3>Available Submissions</h3>
          
          {approvedSubmissions.length === 0 ? (
            <p className="no-submissions">No approved submissions found for this contest</p>
          ) : (
            <ul className="submissions-list">
              {approvedSubmissions.map(submission => {
                // Check if submission is already selected
                const isSelected = selectedWinners.some(w => w.submissionId === submission._id);
                
                return (
                  <li 
                    key={submission._id} 
                    className={`submission-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="submission-preview">
                      {submission.imageUrl && (
                        <img 
                          src={submission.imageUrl} 
                          alt={submission.title}
                          className="submission-thumbnail"
                        />
                      )}
                    </div>
                    
                    <div className="submission-info">
                      <h4>{submission.title}</h4>
                      <p>By: {submission.user ? submission.user.name : 'Unknown'}</p>
                      <p className="submission-rating">
                        Rating: {submission.rating ? submission.rating.toFixed(1) : 'Not rated'}
                        {submission.reviewCount > 0 && ` (${submission.reviewCount} reviews)`}
                      </p>
                    </div>
                    
                    <div className="submission-actions">
                      <button
                        className="btn add-winner-btn"
                        onClick={() => handleAddWinner(submission._id)}
                        disabled={isSelected}
                      >
                        {isSelected ? 'Already Selected' : 'Select as Winner'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWinnerSelection;
