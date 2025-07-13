import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line unused-imports/no-unused-vars
export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // _next parameter required by Express error middleware signature
  void _next;
  
  const { statusCode = 500, message, stack } = err;

  // Log error in development mode
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(`Error ${statusCode}: ${message}`);
    if (stack) {
      // eslint-disable-next-line no-console
      console.error(stack);
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? 'Internal Server Error' : message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: stack?.split('\n'),
      }),
    },
    timestamp: new Date().toISOString(),
    path: _req.path,
    method: _req.method,
  });
};
