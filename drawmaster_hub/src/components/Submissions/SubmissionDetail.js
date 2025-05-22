import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SubmissionContext from '../../context/SubmissionContext';
import AuthContext from '../../context/AuthContext';
import './SubmissionDetail.css';

/**
 * SubmissionDetail Component
 * 
 * Displays detailed information for a single submission.
 * Shows different options based on ownership and contest status.
 */
const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    getSubmission, 
    currentSubmission, 
    loading, 
    error, 
    deleteSubmission,
    rateSubmission 
  } = useContext(SubmissionContext);
  
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  
  // Load submission data
  useEffect(() => {
    const loadSubmission = async () => {
      await getSubmission(id);
    };
    
    loadSubmission();
  }, [id, getSubmission]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if user can edit this submission
  const canEdit = () => {
    if (!isAuthenticated || !currentSubmission || !user) return false;
    
    // User can edit if they are the owner
    const isOwner = user._id === (currentSubmission.user._id || currentSubmission.user);
    
    // Admin can edit any submission
    const isAdmin = user.role === 'admin';
    
    // Check if contest is still active (if we have that info)
    const contestIsActive = currentSubmission.contest?.status === 'active';
    
    return (isOwner && contestIsActive) || isAdmin;
  };
  
  // Check if user can delete this submission
  const canDelete = () => {
    if (!isAuthenticated || !currentSubmission || !user) return false;
    
    // User can delete if they are the owner
    const isOwner = user._id === (currentSubmission.user._id || currentSubmission.user);
    
    // Admin can delete any submission
    const isAdmin = user.role === 'admin';
    
    return isOwner || isAdmin;
  };
  
  // Check if user can rate this submission
  const canRate = () => {
    if (!isAuthenticated || !currentSubmission || !user) return false;
    
    // Can't rate own submission
    const isOwner = user._id === (currentSubmission.user._id || currentSubmission.user);
    if (isOwner) return false;
    
    // Can only rate if contest is completed
    return currentSubmission.contest?.status === 'completed';
  };
  
  // Handle submission deletion
  const handleDelete = async () => {
    const success = await deleteSubmission(id);
    if (success) {
      navigate('/submissions');
    }
  };
  
  // Handle rating change
  const handleRatingChange = (value) => {
    setUserRating(value);
  };
  
  // Handle rating submission
  const handleSubmitRating = async () => {
    if (userRating === 0) return;
    
    try {
      await rateSubmission(id, userRating);
      setRatingSubmitted(true);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };
  
  // Render rating stars
  const renderRatingStars = (interactive = false) => {
    const currentRating = interactive ? userRating : (currentSubmission?.rating || 0);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      let starClass = 'star';
      
      if (i <= currentRating / 2) {
        starClass += ' filled';
      } else if (i - 0.5 <= currentRating / 2) {
        starClass += ' half-filled';
      }
      
      stars.push(
        <span 
          key={i} 
          className={starClass}
          onClick={interactive ? () => handleRatingChange(i * 2) : undefined}
          role={interactive ? 'button' : undefined}
        >
          ★
        </span>
      );
    }
    
    return <div className="rating-stars">{stars}</div>;
  };
  
  if (loading) {
    return (
      <div className="loading-indicator">
        <p>Loading submission details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          className="btn"
          onClick={() => navigate('/submissions')}
        >
          Back to Submissions
        </button>
      </div>
    );
  }
  
  if (!currentSubmission) {
    return (
      <div className="error-container">
        <h2>Submission Not Found</h2>
        <p>The submission you are looking for does not exist or has been removed.</p>
        <button 
          className="btn"
          onClick={() => navigate('/submissions')}
        >
          Back to Submissions
        </button>
      </div>
    );
  }
  
  return (
    <div className="submission-detail-container">
      <div className="submission-detail-header">
        <h2>{currentSubmission.title}</h2>
        <div className={`status-badge ${currentSubmission.status}`}>
          {currentSubmission.status}
        </div>
      </div>
      
      <div className="submission-showcase">
        <div className="submission-image-large">
          <img 
            src={currentSubmission.imageUrl} 
            alt={currentSubmission.title}
          />
        </div>
      </div>
      
      <div className="submission-meta">
        <div className="submission-info">
          <div className="info-item">
            <span className="info-label">Submitted by:</span>
            <span className="info-value">
              {currentSubmission.user.name || 'Anonymous User'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Submitted on:</span>
            <span className="info-value">
              {formatDate(currentSubmission.submittedAt)}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Contest:</span>
            <span className="info-value">
              {currentSubmission.contest?.title || 'Unknown Contest'}
              {currentSubmission.contest?._id && (
                <Link to={`/contests/${currentSubmission.contest._id}`} className="contest-link">
                  View Contest
                </Link>
              )}
            </span>
          </div>
          
          {currentSubmission.rating > 0 && (
            <div className="info-item">
              <span className="info-label">Rating:</span>
              <div className="info-value rating-container">
                {renderRatingStars(false)}
                <span className="rating-value">
                  {Math.round(currentSubmission.rating * 10) / 10}/10
                </span>
                <span className="review-count">
                  ({currentSubmission.reviewCount} {currentSubmission.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          )}
        </div>
        
        {canEdit() && (
          <div className="admin-actions">
            <Link 
              to={`/submissions/edit/${currentSubmission._id}`} 
              className="btn edit-btn"
            >
              Edit Submission
            </Link>
          </div>
        )}
      </div>
      
      {currentSubmission.description && (
        <section className="submission-section">
          <h3>Description</h3>
          <div className="submission-section-content">
            <p>{currentSubmission.description}</p>
          </div>
        </section>
      )}
      
      {canRate() && !ratingSubmitted && (
        <section className="submission-section rating-section">
          <h3>Rate This Submission</h3>
          <div className="rating-input">
            {renderRatingStars(true)}
            <button 
              className="btn rate-btn" 
              onClick={handleSubmitRating}
              disabled={userRating === 0}
            >
              Submit Rating
            </button>
          </div>
        </section>
      )}
      
      {ratingSubmitted && (
        <div className="rating-thanks">
          <p>Thank you for rating this submission!</p>
        </div>
      )}
      
      <div className="submission-actions">
        <button 
          className="btn back-btn"
          onClick={() => navigate('/submissions')}
        >
          Back to Submissions
        </button>
        
        {canDelete() && (
          <>
            {showDeleteConfirm ? (
              <div className="delete-confirm">
                <p>Are you sure you want to delete this submission?</p>
                <div className="confirm-actions">
                  <button 
                    className="btn delete-btn" 
                    onClick={handleDelete}
                  >
                    Yes, Delete
                  </button>
                  <button 
                    className="btn cancel-btn" 
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Submission
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetail;
