import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SubmissionContext from '../../context/SubmissionContext';
import './UserDashboard.css';

/**
 * User Dashboard Component
 * 
 * A protected page that displays user-specific information and actions.
 * Shows profile information, activity summary, and submission list.
 */
const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const { submissions, getSubmissions, loading } = useContext(SubmissionContext);
  
  const [userStats, setUserStats] = useState({
    submissionCount: 0,
    contestsEntered: 0,
    wins: 0
  });
  
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  // Fetch user's submissions
  useEffect(() => {
    const loadSubmissions = async () => {
      await getSubmissions();
    };
    
    if (user) {
      loadSubmissions();
    }
  }, [user, getSubmissions]);
  
  // Calculate statistics when submissions change
  useEffect(() => {
    if (!submissions) return;
    
    // Count unique contests
    const contestIds = new Set();
    let winCount = 0;
    
    submissions.forEach(submission => {
      if (submission.contest) {
        contestIds.add(submission.contest._id || submission.contest);
      }
      
      // Check if submission is part of a winning submission
      if (submission.isWinner) {
        winCount++;
      }
    });
    
    setUserStats({
      submissionCount: submissions.length,
      contestsEntered: contestIds.size,
      wins: winCount
    });
    
    // Get recent submissions (up to 3)
    setRecentSubmissions(submissions.slice(0, 3));
  }, [submissions]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Your Dashboard</h2>
        <p className="dashboard-welcome">Welcome back, {user.name}!</p>
      </div>

      <div className="dashboard-section">
        <h3>Your Profile</h3>
        <div className="profile-info">
          <div className="profile-field">
            <span className="field-label">Name:</span>
            <span className="field-value">{user.name}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Email:</span>
            <span className="field-value">{user.email}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Account Type:</span>
            <span className="field-value">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Your Activity</h3>
        <div className="activity-summary">
          <div className="activity-item">
            <span className="activity-count">{userStats.submissionCount}</span>
            <span className="activity-label">Submissions</span>
          </div>
          <div className="activity-item">
            <span className="activity-count">{userStats.contestsEntered}</span>
            <span className="activity-label">Contests Entered</span>
          </div>
          <div className="activity-item">
            <span className="activity-count">{userStats.wins}</span>
            <span className="activity-label">Wins</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Your Submissions</h3>
        {loading ? (
          <div className="submissions-loading">Loading submissions...</div>
        ) : recentSubmissions.length === 0 ? (
          <div className="submission-list">
            <p className="no-items">You haven't made any submissions yet.</p>
            <Link to="/submissions/new" className="btn">Create New Submission</Link>
          </div>
        ) : (
          <div className="dashboard-submissions">
            <div className="recent-submission-grid">
              {recentSubmissions.map(submission => (
                <div key={submission._id} className="dashboard-submission-card">
                  <div className={`submission-status-badge ${submission.status}`}>
                    {submission.status}
                  </div>
                  <div className="submission-preview">
                    <img 
                      src={submission.imageUrl} 
                      alt={submission.title} 
                    />
                  </div>
                  <div className="submission-info">
                    <h4>{submission.title}</h4>
                    <p>
                      {submission.contest && typeof submission.contest === 'object' ? 
                        `Contest: ${submission.contest.title}` : 
                        'Loading contest...'
                      }
                    </p>
                  </div>
                  <Link to={`/submissions/${submission._id}`} className="view-submission-link">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="view-all-link">
              <Link to="/submissions" className="btn">
                View All Submissions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
