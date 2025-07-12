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
};

export { config };
export type { Config };
