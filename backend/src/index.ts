/* eslint-disable no-console */
import { app } from './app';
import { config } from './config/config';
import { connectRedis, disconnectRedis } from './lib/redis';

const startServer = async (): Promise<void> => {
  try {
    // Start the server immediately
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📱 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base URL: ${config.api.baseUrl}`);
      console.log(`✅ Health check: http://localhost:${config.port}/health`);
      console.log(
        `📚 API v1: http://localhost:${config.port}${config.api.baseUrl}/v1`
      );
    });

    // Initialize Redis connection asynchronously (non-blocking)
    console.log('🔄 Connecting to Redis in background...');
    connectRedis()
      .then(() => {
        console.log('✅ Redis connected successfully');
      })
      .catch(redisError => {
        console.warn(
          '⚠️ Redis connection failed, continuing without Redis:',
          redisError instanceof Error ? redisError.message : String(redisError)
        );
        console.log(
          '🚀 Server will continue without Redis caching functionality'
        );
      });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed.');

        // Disconnect from Redis if connected
        console.log('🔄 Disconnecting from Redis...');
        try {
          await disconnectRedis();
          console.log('✅ Redis disconnected');
        } catch (redisError) {
          console.warn(
            '⚠️ Redis disconnect failed:',
            redisError instanceof Error
              ? redisError.message
              : String(redisError)
          );
        }

        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forcing server shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
