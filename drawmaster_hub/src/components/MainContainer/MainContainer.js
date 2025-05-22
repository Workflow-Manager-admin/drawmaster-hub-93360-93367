import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import './MainContainer.css';
import AuthContext from '../../context/AuthContext';
import ContestContext from '../../context/ContestContext';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import ProtectedRoute from '../Auth/ProtectedRoute';
import UserDashboard from '../UserDashboard/UserDashboard';
import ContestList from '../ContestList/ContestList';
import ContestDetail from '../ContestList/ContestDetail';
import ContestForm from '../ContestList/ContestForm';
import '../ContestList/ContestDetail.css';
import '../ContestList/ContestForm.css';

// Import Submission components
import SubmissionForm from '../Submissions/SubmissionForm';
import SubmissionList from '../Submissions/SubmissionList';
import SubmissionDetail from '../Submissions/SubmissionDetail';
import '../Submissions/SubmissionForm.css';
import '../Submissions/SubmissionList.css';
import '../Submissions/SubmissionDetail.css';

/**
 * MainContainer - Main structural component for DrawMaster Hub application
 * 
 * This component serves as the central layout container for the application,
 * housing contest management, submissions, and winner announcement sections.
 * It provides the routing structure and integrates with backend APIs through context.
 * It includes authentication-related routes and UI elements.
 */
const MainContainer = () => {
  // Loading state for initial UI render
  const [isLoading, setIsLoading] = useState(false);
  
  // Authentication context
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  
  // Contest context
  const { contests, loading: contestsLoading, getContests } = useContext(ContestContext);
  
  // Navigation hook for programmatic navigation
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get active contests for winners gallery
  const getCompletedContestsWithWinners = () => {
    return contests.filter(
      contest => contest.status === 'completed' && 
                contest.winnerAnnounced && 
                contest.winningSubmissions?.length > 0
    );
  };

  return (
    <div className="main-container">
      {/* Header Section */}
      <header className="main-header">
        <div className="container">
          <h1>DrawMaster Hub</h1>
          <p className="subtitle">Manage and participate in drawing contests</p>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="main-nav">
        <ul className="nav-links">
          <li><Link to="/contests" className="nav-link">Contests</Link></li>
          <li><Link to="/submissions" className="nav-link">Submissions</Link></li>
          <li><Link to="/winners" className="nav-link">Winners Gallery</Link></li>
          <li><Link to="/about" className="nav-link">About</Link></li>
          
          {/* Admin Link */}
          {isAuthenticated && user?.role === 'admin' && (
            <li><Link to="/admin/contests" className="nav-link">Manage Contests</Link></li>
          )}
          
          {/* Authentication Links */}
          {isAuthenticated ? (
            <>
              <li>
                <span className="nav-link">Welcome, {user?.name}</span>
              </li>
              <li>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }} 
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/register" className="nav-link">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
      
      {/* Main Content Area */}
      <main className="content-area">
        <div className="container">
          {isLoading || contestsLoading ? (
            <div className="loading-indicator">
              <p>Loading content...</p>
            </div>
          ) : (
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Contest Routes */}
              <Route path="/contests" element={<ContestList />} />
              <Route path="/contests/:id" element={<ContestDetail />} />
              
              {/* Admin Contest Management Routes */}
              <Route path="/admin/contests" element={
                <ProtectedRoute>
                  <ContestList isAdminView={true} />
                </ProtectedRoute>
              } />
              <Route path="/contests/new" element={
                <ProtectedRoute>
                  <ContestForm />
                </ProtectedRoute>
              } />
              <Route path="/contests/edit/:id" element={
                <ProtectedRoute>
                  <ContestForm />
                </ProtectedRoute>
              } />
              
              {/* User Dashboard - Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="loading-indicator"><p>Loading dashboard...</p></div>}>
                    <UserDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              
              {/* Submissions Route - Protected */}
              <Route path="/submissions" element={
                <ProtectedRoute>
                  <div className="submissions-section">
                    <h2>Submission Management</h2>
                    <p>This section will allow users to submit their artwork and view their submissions.</p>
                    {/* Placeholder for submission management features */}
                    <div className="placeholder-content">
                      <p>Submission functionality coming soon!</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Winners Gallery Route */}
              <Route path="/winners" element={
                <div className="winners-section">
                  <h2>Winners Gallery</h2>
                  {getCompletedContestsWithWinners().length > 0 ? (
                    <div className="winners-gallery">
                      {/* This is a placeholder until submission integration is complete */}
                      {getCompletedContestsWithWinners().map(contest => (
                        <div key={contest._id} className="winner-card">
                          <h3>{contest.title}</h3>
                          <p>Contest completed on: {formatDate(contest.deadline)}</p>
                          <div className="winner-image-placeholder">
                            <span>Winner Announcement</span>
                          </div>
                          <button 
                            className="btn" 
                            onClick={() => navigate(`/contests/${contest._id}`)}
                          >
                            View Contest Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No winners announced yet.</p>
                  )}
                </div>
              } />
              
              {/* About Route */}
              <Route path="/about" element={
                <div className="about-section">
                  <h2>About DrawMaster Hub</h2>
                  <p>
                    DrawMaster Hub is a platform for artists to participate in drawing
                    contests, showcase their work, and get recognition for their talent.
                  </p>
                </div>
              } />
              
              {/* Default/Home Route */}
              <Route path="/" element={
                <div className="home-section">
                  <div className="welcome-banner">
                    <h2>Welcome to DrawMaster Hub</h2>
                    <p>
                      Join our vibrant community of artists, participate in exciting
                      drawing contests, and showcase your talent to the world.
                    </p>
                    <button 
                      className="btn btn-large" 
                      onClick={() => navigate('/contests')}
                    >
                      Explore Contests
                    </button>
                  </div>
                  
                  <div className="featured-section">
                    <h2>Featured Contests</h2>
                    <div className="contest-list featured">
                      {contests
                        .filter(contest => contest.status === 'active')
                        .slice(0, 2)
                        .map(contest => (
                          <div key={contest._id} className="contest-card">
                            <h3>{contest.title}</h3>
                            <p>Deadline: {formatDate(contest.deadline)}</p>
                            <button 
                              className="btn" 
                              onClick={() => navigate(`/contests/${contest._id}`)}
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                        
                      {contests.filter(contest => contest.status === 'active').length === 0 && (
                        <div className="no-contests">
                          <p>No active contests at the moment.</p>
                          <p>Check back soon for new contests!</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {getCompletedContestsWithWinners().length > 0 && (
                    <div className="recent-winners">
                      <h2>Recent Winners</h2>
                      <div className="winners-preview">
                        {getCompletedContestsWithWinners().slice(0, 1).map(contest => (
                          <div key={contest._id} className="winner-preview-card">
                            <h3>{contest.title}</h3>
                            <p>Contest Winner Announced!</p>
                            <button 
                              className="btn" 
                              onClick={() => navigate(`/contests/${contest._id}`)}
                            >
                              View Winners
                            </button>
                          </div>
                        ))}
                        <button 
                          className="btn" 
                          onClick={() => navigate('/winners')}
                        >
                          View All Winners
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              } />
            </Routes>
          )}
        </div>
      </main>
      
      {/* Outlet for nested routes */}
      <Outlet />
      
      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} DrawMaster Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainContainer;
