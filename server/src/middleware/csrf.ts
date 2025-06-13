import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { logger } from '../utils/logger';

// Configure CSRF protection
const { invalidCsrfTokenError, generateToken, validateRequest, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

// Middleware to generate and attach CSRF token
export const csrfProtection = doubleCsrfProtection;

// Middleware to generate token for client
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  const token = generateToken(req, res);
  res.locals.csrfToken = token;
  next();
};

// Error handler for CSRF failures
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err === invalidCsrfTokenError) {
    logger.warn('CSRF token validation failed:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
    });
    res.status(403).json({
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED',
      },
    });
  } else {
    next(err);
  }
};

// Endpoint to get CSRF token
export const getCsrfToken = (req: Request, res: Response) => {
  const token = generateToken(req, res);
  res.json({ csrfToken: token });
};