const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Add basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DrawMaster Hub API' });
});

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/contests', require('./routes/api/contests'));
app.use('/api/submissions', require('./routes/api/submissions'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
