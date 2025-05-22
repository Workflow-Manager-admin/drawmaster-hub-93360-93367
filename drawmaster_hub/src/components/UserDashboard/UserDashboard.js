import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './UserDashboard.css';

/**
 * User Dashboard Component
 * 
 * A protected page that displays user-specific information and actions.
 * This component demonstrates the authentication and authorization flow.
 */
const UserDashboard = () => {
  const { user } = useContext(AuthContext);

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
            <span className="activity-count">0</span>
            <span className="activity-label">Submissions</span>
          </div>
          <div className="activity-item">
            <span className="activity-count">0</span>
            <span className="activity-label">Contests Entered</span>
          </div>
          <div className="activity-item">
            <span className="activity-count">0</span>
            <span className="activity-label">Wins</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Your Submissions</h3>
        <div className="submission-list">
          <p className="no-items">You haven't made any submissions yet.</p>
          <button className="btn">Create New Submission</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
