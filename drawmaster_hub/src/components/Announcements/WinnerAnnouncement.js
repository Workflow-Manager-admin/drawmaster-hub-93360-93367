import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ContestContext from '../../context/ContestContext';
import WinnerContext from '../../context/WinnerContext';
import './WinnerAnnouncement.css';

/**
 * WinnerAnnouncement Component
 * 
 * Displays winner announcements for a specific contest.
 * Shows winners ranked by their position with visual emphasis on top winners.
 */
const WinnerAnnouncement = ({ contestId, displayMode = 'full' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const resolvedContestId = contestId || id;
  
  // Contexts
  const { getContest, currentContest } = useContext(ContestContext);
  const { getWinnersByContest, winners, loading, error } = useContext(WinnerContext);
  
  // State
  const [loadingData, setLoadingData] = useState(true);
  const [localError, setLocalError] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load contest and winner data
  useEffect(() => {
    const loadContestWinners = async () => {
      setLoadingData(true);
      try {
        // Get contest details if not already loaded
        if (!currentContest || currentContest._id !== resolvedContestId) {
          await getContest(resolvedContestId);
        }
        
        // Get winners for the contest
        await getWinnersByContest(resolvedContestId);
      } catch (err) {
        setLocalError(err.message || 'Failed to load winners data');
      } finally {
        setLoadingData(false);
      }
    };
    
    if (resolvedContestId) {
      loadContestWinners();
    }
  }, [resolvedContestId, getContest, getWinnersByContest, currentContest]);

  if (loadingData || loading) {
    return (
      <div className="winner-announcement-loading">
        <p>Loading winner announcements...</p>
      </div>
    );
  }

  if (localError || error) {
    return (
      <div className="winner-announcement-error">
        <h3>Error Loading Winners</h3>
        <p>{localError || error}</p>
        <button className="btn" onClick={() => navigate('/contests')}>
          Back to Contests
        </button>
      </div>
    );
  }

  if (!currentContest) {
    return (
      <div className="winner-announcement-error">
        <h3>Contest Not Found</h3>
        <p>Unable to find the specified contest.</p>
        <button className="btn" onClick={() => navigate('/contests')}>
          Back to Contests
        </button>
      </div>
    );
  }

  if (!currentContest.winnerAnnounced) {
    return (
      <div className="winner-announcement-pending">
        <h3>Winners Not Yet Announced</h3>
        <p>The winners for this contest have not been announced yet.</p>
        <p>Check back later!</p>
        <button className="btn" onClick={() => navigate(`/contests/${resolvedContestId}`)}>
          View Contest Details
        </button>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="winner-announcement-pending">
        <h3>No Winners Found</h3>
        <p>No winners have been selected for this contest yet.</p>
        <button className="btn" onClick={() => navigate(`/contests/${resolvedContestId}`)}>
          View Contest Details
        </button>
      </div>
    );
  }

  // Sort winners by rank
  const sortedWinners = [...winners].sort((a, b) => a.rank - b.rank);
  
  // For compact mode, limit to top 3
  const displayWinners = displayMode === 'compact' ? sortedWinners.slice(0, 3) : sortedWinners;

  return (
    <div className={`winner-announcement ${displayMode}`}>
      {displayMode === 'full' && (
        <div className="winner-announcement-header">
          <h2>Winners Announcement</h2>
          <h3>{currentContest.title}</h3>
          <p className="winner-announcement-date">
            Contest completed on {formatDate(currentContest.deadline)}
          </p>
        </div>
      )}
      
      <div className="winners-podium">
        {/* Display the top 3 winners in a special podium layout */}
        {sortedWinners.length >= 2 && sortedWinners[1] && sortedWinners[1].submission && (
          <div className="podium-position second-place">
            <div className="winner-medal silver">2</div>
            <div className="winner-artwork">
              {sortedWinners[1].submission.imageUrl ? (
                <img 
                  src={sortedWinners[1].submission.imageUrl} 
                  alt={`Second Place: ${sortedWinners[1].submission.title}`} 
                  className="winner-image"
                />
              ) : (
                <div className="winner-image-placeholder">
                  <span>2nd Place</span>
                </div>
              )}
            </div>
            <h4 className="winner-title">{sortedWinners[1].submission.title || "Untitled"}</h4>
            <p className="winner-artist">
              By: {sortedWinners[1].submission.user && sortedWinners[1].submission.user.name 
                ? sortedWinners[1].submission.user.name 
                : 'Unknown'}
            </p>
          </div>
        )}
        
        {sortedWinners.length >= 1 && sortedWinners[0] && sortedWinners[0].submission && (
          <div className="podium-position first-place">
            <div className="winner-medal gold">1</div>
            <div className="winner-artwork">
              {sortedWinners[0].submission.imageUrl ? (
                <img 
                  src={sortedWinners[0].submission.imageUrl} 
                  alt={`First Place: ${sortedWinners[0].submission.title}`} 
                  className="winner-image"
                />
              ) : (
                <div className="winner-image-placeholder">
                  <span>1st Place</span>
                </div>
              )}
            </div>
            <h4 className="winner-title">{sortedWinners[0].submission.title || "Untitled"}</h4>
            <p className="winner-artist">
              By: {sortedWinners[0].submission.user && sortedWinners[0].submission.user.name 
                ? sortedWinners[0].submission.user.name 
                : 'Unknown'}
            </p>
            {displayMode === 'full' && (
              <div className="winner-badge">
                <span>Grand Prize Winner</span>
              </div>
            )}
          </div>
        )}
        
        {sortedWinners.length >= 3 && sortedWinners[2] && sortedWinners[2].submission && (
          <div className="podium-position third-place">
            <div className="winner-medal bronze">3</div>
            <div className="winner-artwork">
              {sortedWinners[2].submission.imageUrl ? (
                <img 
                  src={sortedWinners[2].submission.imageUrl} 
                  alt={`Third Place: ${sortedWinners[2].submission.title}`} 
                  className="winner-image"
                />
              ) : (
                <div className="winner-image-placeholder">
                  <span>3rd Place</span>
                </div>
              )}
            </div>
            <h4 className="winner-title">{sortedWinners[2].submission.title || "Untitled"}</h4>
            <p className="winner-artist">
              By: {sortedWinners[2].submission.user && sortedWinners[2].submission.user.name 
                ? sortedWinners[2].submission.user.name 
                : 'Unknown'}
            </p>
          </div>
        )}
      </div>
      
      {/* Display any additional winners (beyond top 3) */}
      {displayMode === 'full' && sortedWinners.length > 3 && (
        <div className="additional-winners">
          <h3>Honorable Mentions</h3>
          <ul className="honorable-mention-list">
            {sortedWinners.slice(3).map(winner => {
              // Skip if submission data is missing
              if (!winner.submission) return null;
              
              return (
                <li key={winner._id} className="honorable-mention-item">
                  <div className="winner-rank">#{winner.rank}</div>
                  <div className="honorable-mention-content">
                    <div className="honorable-artwork">
                      {winner.submission.imageUrl ? (
                        <img 
                          src={winner.submission.imageUrl} 
                          alt={winner.submission.title || "Winner submission"}
                          className="honorable-image"
                        />
                      ) : (
                        <div className="honorable-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="honorable-info">
                      <h4>{winner.submission.title || "Untitled"}</h4>
                      <p>
                        By: {winner.submission.user && winner.submission.user.name 
                          ? winner.submission.user.name 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {displayMode === 'full' && (
        <div className="announcement-actions">
          <Link to={`/contests/${resolvedContestId}`} className="btn view-contest-btn">
            View Contest Details
          </Link>
          <Link to="/winners" className="btn all-winners-btn">
            View All Winners
          </Link>
        </div>
      )}
      
      {displayMode === 'compact' && (
        <div className="compact-view-more">
          <Link to={`/contests/${resolvedContestId}`} className="btn view-winners-btn">
            View All Winners
          </Link>
        </div>
      )}
    </div>
  );
};

export default WinnerAnnouncement;
