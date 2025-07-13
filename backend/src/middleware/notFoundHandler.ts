import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // _next parameter required by Express middleware signature
  void _next;

  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
};
