import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { body, query, params, headers } = schema;

    try {
      if (body) {
        const { error, value } = body.validate(req.body);
        if (error) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Validation error in request body',
              details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
              })),
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        req.body = value;
      }

      if (query) {
        const { error, value } = query.validate(req.query);
        if (error) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Validation error in query parameters',
              details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
              })),
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        req.query = value;
      }

      if (params) {
        const { error, value } = params.validate(req.params);
        if (error) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Validation error in route parameters',
              details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
              })),
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        req.params = value;
      }

      if (headers) {
        const { error, value } = headers.validate(req.headers);
        if (error) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Validation error in headers',
              details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
              })),
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        req.headers = { ...req.headers, ...value };
      }

      next();
    } catch (err) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal validation error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Basic request validator middleware (can be extended)
export const requestValidator = (req: Request, res: Response, next: NextFunction): void => {
  // Set default content-type validation for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (contentType && !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Content-Type must be application/json',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }
  
  next();
};
