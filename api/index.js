const cors = require('cors');
require('dotenv').config();

// Create a simple middleware handler for CORS
const corsMiddleware = cors();

// Helper to wrap async functions for better error handling
const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Main API handler
const handler = asyncHandler(async (req, res) => {
  // Handle CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });

  // Basic health check
  res.status(200).json({ status: 'API is running' });
});

module.exports = handler;