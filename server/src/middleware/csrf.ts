import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { logger } from '../utils/logger';

// Configure CSRF protection
const csrfInstance = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  getSessionIdentifier: (req: any) => {
    // Use JWT user ID if available for better stability
    if (req.user && req.user.id) {
      return `user-${req.user.id}`;
    }
    // Fall back to IP address
    return req.ip || 'anonymous';
  },
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: any) => req.headers['x-csrf-token'] as string,
});

const { invalidCsrfTokenError, doubleCsrfProtection } = csrfInstance;
const generateToken = csrfInstance.generateCsrfToken;

// Middleware to generate and attach CSRF token
export const csrfProtection = doubleCsrfProtection;

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