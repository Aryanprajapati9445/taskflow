const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./common/utils/logger');
const mongoose = require('mongoose');

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`API Docs: http://localhost:${env.PORT}/api-docs`);
      logger.info(`Health:   http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ──────────────────────────────────────
// Graceful shutdown
// ──────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  // 1. Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
    });
  }

  // 2. Close database connection
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  } catch (err) {
    logger.error('Error closing MongoDB:', err);
  }

  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  shutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

startServer();
