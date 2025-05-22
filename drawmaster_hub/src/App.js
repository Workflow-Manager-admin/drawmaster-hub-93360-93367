import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import MainContainer from './components/MainContainer/MainContainer';
import { AuthProvider } from './context/AuthContext';
import { ContestProvider } from './context/ContestContext';
import { SubmissionProvider } from './context/SubmissionContext';

/**
 * App Component - Root component of the DrawMaster Hub application
 * 
 * This component serves as the entry point of the application and sets up
 * the router for navigation between different sections of the application.
 * It wraps the application with the AuthProvider, ContestProvider, and
 * SubmissionProvider to make authentication, contest, and submission
 * state/functions available throughout the app.
 */
function App() {
  return (
    <div className="app">
      <AuthProvider>
        <ContestProvider>
          <SubmissionProvider>
            <Router>
              <MainContainer />
            </Router>
          </SubmissionProvider>
        </ContestProvider>
      </AuthProvider>
    </div>
  );
}

export default App;