import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import './MainContainer.css';
import AuthContext from '../../context/AuthContext';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import ProtectedRoute from '../Auth/ProtectedRoute';
import UserDashboard from '../UserDashboard/UserDashboard';

/**
 * MainContainer - Main structural component for DrawMaster Hub application
 * 
 * This component serves as the central layout container for the application,
 * housing contest management, submissions, and winner announcement sections.
 * It provides the routing structure and will integrate with backend APIs.
 * It now includes authentication-related routes and UI elements.
 */
const MainContainer = () => {
  // State for contests and winners
  const [contests, setContests] = useState([]);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Authentication context
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  
  // Navigation hook for programmatic navigation
  const navigate = useNavigate();

  // Mock API call - to be replaced with actual API integration
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // In the future, these will be actual API calls
        // const contestResponse = await fetch('/api/contests');
        // const contestData = await contestResponse.json();
        
        // For now, use mock data
        const mockContests = [
          { id: 1, title: 'Character Design Challenge', deadline: '2023-06-30', status: 'active' },
          { id: 2, title: 'Landscape Illustration Contest', deadline: '2023-07-15', status: 'active' },
          { id: 3, title: 'Animation Short', deadline: '2023-05-10', status: 'completed' }
        ];
        
        const mockWinners = [
          { id: 1, contestId: 3, artist: 'Jane Doe', title: 'Urban Dream', imageUrl: 'placeholder.jpg' }
        ];
        
        setContests(mockContests);
        setWinners(mockWinners);
      } catch (error) {
        console.error('Error fetching data:', error);
        // In the future, implement proper error handling
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

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
          {isLoading ? (
            <div className="loading-indicator">
              <p>Loading content...</p>
            </div>
          ) : (
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Contest Management Route */}
              <Route path="/contests" element={
                <div className="contests-section">
                  <h2>Active Contests</h2>
                  <div className="contest-list">
                    {contests
                      .filter(contest => contest.status === 'active')
                      .map(contest => (
                        <div key={contest.id} className="contest-card">
                          <h3>{contest.title}</h3>
                          <p>Deadline: {contest.deadline}</p>
                          <button 
                            className="btn" 
                            onClick={() => navigate(`/contests/${contest.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              } />
              
              {/* Contest Detail Route - Protected */}
              <Route path="/contests/:id" element={
                <ProtectedRoute>
                  <div className="contest-detail-section">
                    <h2>Contest Details</h2>
                    <p>This page would show contest details and allow authenticated users to submit entries.</p>
                  </div>
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
                  {winners.length > 0 ? (
                    <div className="winners-gallery">
                      {winners.map(winner => (
                        <div key={winner.id} className="winner-card">
                          <h3>{winner.title}</h3>
                          <p>Artist: {winner.artist}</p>
                          <div className="winner-image-placeholder">
                            <span>Winner Artwork</span>
                          </div>
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
                      {contests.slice(0, 2).map(contest => (
                        <div key={contest.id} className="contest-card">
                          <h3>{contest.title}</h3>
                          <p>Deadline: {contest.deadline}</p>
                          <button 
                            className="btn" 
                            onClick={() => navigate(`/contests/${contest.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {winners.length > 0 && (
                    <div className="recent-winners">
                      <h2>Recent Winners</h2>
                      <div className="winners-preview">
                        {winners.slice(0, 1).map(winner => (
                          <div key={winner.id} className="winner-preview-card">
                            <h3>{winner.title}</h3>
                            <p>Artist: {winner.artist}</p>
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
