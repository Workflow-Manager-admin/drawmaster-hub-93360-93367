import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SubmissionContext from '../../context/SubmissionContext';
import AuthContext from '../../context/AuthContext';
import ContestContext from '../../context/ContestContext';
import './SubmissionList.css';

/**
 * Submission List Component
 * 
 * Displays a list of submissions with filtering options.
 * Can show user's submissions or submissions for a specific contest.
 */
const SubmissionList = ({ contestId = null, userOnly = true }) => {
  const { id } = useParams(); // May contain contestId if accessed via /submissions/contest/:id
  const effectiveContestId = contestId || id;
  
  const navigate = useNavigate();
  
  const { 
    submissions, 
    getSubmissions, 
    getSubmissionsByContest,
    loading, 
    error, 
    deleteSubmission 
  } = useContext(SubmissionContext);
  
  const { user, isAuthenticated } = useContext(AuthContext);
  const { getContest, currentContest } = useContext(ContestContext);
  
  const [displayedSubmissions, setDisplayedSubmissions] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState(effectiveContestId ? 'contest' : 'user');

  // Load submissions based on view mode
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated && userOnly) {
        navigate('/login');
        return;
      }
      
      if (viewMode === 'contest' && effectiveContestId) {
        await getContest(effectiveContestId);
        const contestSubmissions = await getSubmissionsByContest(effectiveContestId);
        setDisplayedSubmissions(contestSubmissions.data || []);
      } else {
        await getSubmissions();
        setDisplayedSubmissions(submissions);
      }
    };
    
    loadData();
  }, [
    effectiveContestId, 
    viewMode, 
    getSubmissions, 
    getSubmissionsByContest, 
    isAuthenticated, 
    userOnly, 
    navigate,
    getContest,
    submissions
  ]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (submissionId) => {
    setDeleteConfirm(submissionId);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async (submissionId) => {
    const success = await deleteSubmission(submissionId);
    if (success) {
      setDeleteConfirm(null);
      // Refresh submissions after delete
      if (viewMode === 'contest' && effectiveContestId) {
        const contestSubmissions = await getSubmissionsByContest(effectiveContestId);
        setDisplayedSubmissions(contestSubmissions.data || []);
      } else {
        await getSubmissions();
      }
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending':
      default: return 'status-pending';
    }
  };

  // Render page title
  const renderTitle = () => {
    if (viewMode === 'contest' && currentContest) {
      return `Submissions for ${currentContest.title}`;
    }
    return 'My Submissions';
  };

  // Main render
  return (
    <div className="submission-list-container">
      <div className="submission-list-header">
        <h2>{renderTitle()}</h2>

        {user && (
          <Link to="/submissions/new" className="btn submit-new-btn">
            Create New Submission
          </Link>
        )}
      </div>
      
      {error && (
        <div className="submission-error">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-indicator">
          <p>Loading submissions...</p>
        </div>
      ) : displayedSubmissions.length === 0 ? (
        <div className="no-submissions">
          <p>
            {viewMode === 'contest' 
              ? 'No submissions found for this contest.' 
              : 'You haven\'t made any submissions yet.'}
          </p>
          {viewMode === 'user' && (
            <Link to="/contests" className="btn">
              Browse Contests
            </Link>
          )}
        </div>
      ) : (
        <div className="submission-grid">
          {displayedSubmissions.map(submission => (
            <div key={submission._id} className="submission-card">
              <div className={`submission-status ${getStatusBadgeClass(submission.status)}`}>
                {submission.status}
              </div>
              
              <div className="submission-image">
                <img src={submission.imageUrl} alt={submission.title} />
              </div>

              <div className="submission-details">
                <h3>{submission.title}</h3>
                
                <div className="submission-meta">
                  <span>Submitted: {formatDate(submission.submittedAt)}</span>
                  {submission.contest && viewMode !== 'contest' && (
                    <span>
                      Contest: {typeof submission.contest === 'object' 
                        ? submission.contest.title
                        : 'Loading...'}
                    </span>
                  )}
                </div>
                
                {submission.description && (
                  <p className="submission-desc">{submission.description}</p>
                )}
              </div>
              
              <div className="submission-actions">
                <button 
                  className="btn view-btn" 
                  onClick={() => navigate(`/submissions/${submission._id}`)}
                >
                  View Details
                </button>

                {user && (user._id === submission.user || user.role === 'admin') && (
                  <>
                    {deleteConfirm === submission._id ? (
                      <div className="delete-confirm">
                        <span>Delete this?</span>
                        <button 
                          className="btn delete-btn confirm" 
                          onClick={() => handleConfirmDelete(submission._id)}
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
                      <>
                        <button 
                          className="btn edit-btn" 
                          onClick={() => navigate(`/submissions/edit/${submission._id}`)}
                        >
                          Edit
                        </button>
                        
                        <button 
                          className="btn delete-btn" 
                          onClick={() => handleDeleteClick(submission._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="list-actions">
        {viewMode === 'contest' && (
          <button 
            className="btn back-btn"
            onClick={() => navigate(`/contests/${effectiveContestId}`)}
          >
            Back to Contest
          </button>
        )}
        
        {viewMode === 'user' && (
          <button 
            className="btn back-btn"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
