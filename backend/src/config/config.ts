interface Config {
  nodeEnv: string;
  port: number;
  api: {
    version: string;
    baseUrl: string;
  };
  cors: {
    origin: string | string[];
  };
  logging: {
    level: string;
  };
  redis: {
    url: string;
    password?: string;
    host: string;
    port: number;
    db: number;
    keyPrefix: string;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
    connectTimeout: number;
    commandTimeout: number;
  };
  session: {
    secret: string;
    name: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  api: {
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || '/api',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'plastic-crack:',
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
  },
  session: {
    secret:
      process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    name: process.env.SESSION_NAME || 'plastic-crack-session',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
};

export { config };
export type { Config };
