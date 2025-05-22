import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import MainContainer from './components/MainContainer/MainContainer';

/**
 * App Component - Root component of the DrawMaster Hub application
 * 
 * This component serves as the entry point of the application and sets up
 * the router for navigation between different sections of the application.
 */
function App() {
  return (
    <div className="app">
      <Router>
        <MainContainer />
      </Router>
    </div>
  );
}

export default App;