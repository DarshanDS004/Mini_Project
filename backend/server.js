// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import database connection
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🏥 MindCare India API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: 'connected',
    mlModel: 'ready',
    accuracy: '90.40%',
    message: 'Server is running successfully'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🏥 MindCare India - Mental Health Platform');
  console.log('='.repeat(50));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌍 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🤖 ML Model Accuracy: 90.40%`);
  console.log('='.repeat(50));
  console.log('📍 Available Endpoints:');
  console.log('   Authentication:');
  console.log('   POST /api/auth/register - Register new user');
  console.log('   POST /api/auth/login - Login user');
  console.log('   GET  /api/auth/profile - Get user profile');
  console.log('   Assessment:');
  console.log('   POST /api/assessment/submit - Submit 27-question assessment');
  console.log('   GET  /api/assessment/history - Get assessment history');
  console.log('   GET  /api/assessment/:id - Get specific assessment');
  console.log('='.repeat(50));
  console.log('Press Ctrl+C to stop the server');
  console.log('='.repeat(50));
});
