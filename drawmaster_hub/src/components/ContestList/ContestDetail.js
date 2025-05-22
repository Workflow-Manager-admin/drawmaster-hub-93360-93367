import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ContestContext from '../../context/ContestContext';
import AuthContext from '../../context/AuthContext';

/**
 * ContestDetail Component
 * 
 * Displays detailed information for a specific contest.
 * Shows different options based on contest status and user role.
 */
const ContestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { getContest, currentContest, loading, error, isAdmin } = useContext(ContestContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  const [formattedDates, setFormattedDates] = useState({
    startDate: '',
    deadline: '',
    createdAt: ''
  });

  // Load contest data
  useEffect(() => {
    const loadContest = async () => {
      await getContest(id);
    };
    
    loadContest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Format dates when contest data loads
  useEffect(() => {
    if (currentContest) {
      setFormattedDates({
        startDate: formatDate(currentContest.startDate),
        deadline: formatDate(currentContest.deadline),
        createdAt: formatDate(currentContest.createdAt)
      });
    }
  }, [currentContest]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate time remaining for active contests
  const getTimeRemaining = () => {
    if (!currentContest || currentContest.status !== 'active') return null;
    
    const now = new Date();
    const deadline = new Date(currentContest.deadline);
    const timeRemaining = deadline - now;
    
    if (timeRemaining <= 0) return 'Contest has ended';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours remaining`;
  };

  // Determine if submissions are allowed
  const canSubmit = () => {
    if (!currentContest || !isAuthenticated) return false;
    return currentContest.status === 'active';
  };
  
  if (loading) {
    return (
      <div className="loading-indicator">
        <p>Loading contest details...</p>
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
          onClick={() => navigate('/contests')}
        >
          Back to Contests
        </button>
      </div>
    );
  }
  
  if (!currentContest) {
    return (
      <div className="error-container">
        <h2>Contest Not Found</h2>
        <p>The contest you are looking for does not exist or has been removed.</p>
        <button 
          className="btn"
          onClick={() => navigate('/contests')}
        >
          Back to Contests
        </button>
      </div>
    );
  }
  
  return (
    <div className="contest-detail-container">
      <div className="contest-detail-header">
        <h2>{currentContest.title}</h2>
        <div className={`status-badge ${currentContest.status}`}>
          {currentContest.status}
        </div>
      </div>
      
      <div className="contest-meta">
        <div className="contest-date-info">
          <div className="date-group">
            <span className="date-label">Start Date:</span>
            <span className="date-value">{formattedDates.startDate}</span>
          </div>
          <div className="date-group">
            <span className="date-label">Deadline:</span>
            <span className="date-value">{formattedDates.deadline}</span>
          </div>
          {currentContest.status === 'active' && (
            <div className="time-remaining">
              {getTimeRemaining()}
            </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="admin-actions">
            <Link 
              to={`/contests/edit/${currentContest._id}`} 
              className="btn edit-btn"
            >
              Edit Contest
            </Link>
          </div>
        )}
      </div>
      
      <section className="contest-section">
        <h3>Description</h3>
        <div className="contest-section-content">
          <p>{currentContest.description}</p>
        </div>
      </section>
      
      <section className="contest-section">
        <h3>Rules</h3>
        <div className="contest-section-content">
          <p>{currentContest.rules}</p>
        </div>
      </section>
      
      <section className="contest-section">
        <h3>Prizes</h3>
        <div className="prize-list">
          {currentContest.prizes.map((prize, index) => (
            <div key={index} className="prize-item">
              <div className="prize-rank">#{prize.rank}</div>
              <div className="prize-description">{prize.description}</div>
            </div>
          ))}
        </div>
      </section>
      
      {currentContest.categories && currentContest.categories.length > 0 && (
        <section className="contest-section">
          <h3>Categories</h3>
          <div className="category-tags">
            {currentContest.categories.map((category, index) => (
              <span key={index} className="category-tag">{category}</span>
            ))}
          </div>
        </section>
      )}
      
      {canSubmit() && (
        <div className="submission-cta">
          <p>Ready to participate? Submit your artwork now!</p>
          <Link to={`/submissions/new/${currentContest._id}`} className="btn submit-btn">
            Make Submission
          </Link>
        </div>
      )}
      
      {currentContest.status === 'completed' && currentContest.winnerAnnounced && (
        <section className="contest-section winners-section">
          <h3>Winners</h3>
          {currentContest.winningSubmissions && 
           currentContest.winningSubmissions.length > 0 ? (
            <div className="winner-list">
              {currentContest.winningSubmissions.map((winner, index) => (
                <div key={index} className="winner-item">
                  <div className="winner-rank">#{winner.rank}</div>
                  <div className="winner-details">
                    {/* In a real app, we would fetch submission details and display them here */}
                    <p>Submission ID: {winner.submission}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No winners have been announced yet.</p>
          )}
        </section>
      )}
      
      <div className="contest-actions">
        <button 
          className="btn back-btn"
          onClick={() => navigate('/contests')}
        >
          Back to Contests
        </button>
        
        {isAuthenticated && currentContest.status === 'active' && (
          <Link to={`/submissions/new/${currentContest._id}`} className="btn">
            Submit Entry
          </Link>
        )}
      </div>
    </div>
  );
};

export default ContestDetail;
