const app = require('../src/app');
const connectDB = require('../src/config/db');

// Vercel serverless function entrypoint
// We connect to the database, then export the Express app for Vercel to handle
connectDB();

module.exports = app;
