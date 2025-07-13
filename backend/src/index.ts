import { app } from './app';
import { config } from './config/config';
import { connectRedis, disconnectRedis } from './lib/redis';

const startServer = async (): Promise<void> => {
  try {
    // Initialize Redis connection
    console.log('🔄 Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connected successfully');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📱 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base URL: ${config.api.baseUrl}`);
      console.log(`✅ Health check: http://localhost:${config.port}/health`);
      console.log(
        `📚 API v1: http://localhost:${config.port}${config.api.baseUrl}/v1`
      );
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed.');

        // Disconnect from Redis
        console.log('🔄 Disconnecting from Redis...');
        await disconnectRedis();
        console.log('✅ Redis disconnected');

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
