console.log('🚀 Starting server...  ');
console.log('📁 Working directory:', process.cwd());
console.log('📝 Loading environment variables...');

import dotenv from 'dotenv';
dotenv.config();

console.log('✅ Environment loaded');
console.log('   PORT:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');

import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error: Error) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', error);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
