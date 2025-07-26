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
  firebase: {
    serviceAccount: {
      projectId: string;
      privateKey: string;
      clientEmail: string;
    };
    storageBucket: string;
    emulator: {
      enabled: boolean;
      host: string;
    };
  };
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    imageCompression: {
      quality: number;
      maxWidth: number;
      maxHeight: number;
    };
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
  firebase: {
    serviceAccount: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    },
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
    emulator: {
      enabled:
        process.env.USE_FIREBASE_EMULATOR === 'true' ||
        process.env.NODE_ENV === 'development',
      host: process.env.FIREBASE_EMULATOR_HOST || '127.0.0.1:9199',
    },
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    imageCompression: {
      quality: parseInt(process.env.IMAGE_QUALITY || '80', 10),
      maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '2048', 10),
      maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT || '2048', 10),
    },
  },
};

export { config };
export type { Config };
