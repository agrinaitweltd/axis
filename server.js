const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Use different port to avoid conflict with Vite

// Middleware
app.use(cors());
app.use(express.json());

// API route for form submission
app.post('/api/send-form', async (req, res) => {
  try {
    console.log('API request received');
    // Dynamic import of the send-form handler
    const handler = await import('./api/send-form.js');
    await handler.default(req, res);
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/send-form`);
});