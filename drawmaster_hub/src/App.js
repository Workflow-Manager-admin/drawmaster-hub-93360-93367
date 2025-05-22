import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import MainContainer from './components/MainContainer/MainContainer';
import { AuthProvider } from './context/AuthContext';

/**
 * App Component - Root component of the DrawMaster Hub application
 * 
 * This component serves as the entry point of the application and sets up
 * the router for navigation between different sections of the application.
 * It wraps the application with the AuthProvider to make authentication
 * state and functions available throughout the app.
 */
function App() {
  return (
    <div className="app">
      <AuthProvider>
        <Router>
          <MainContainer />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;