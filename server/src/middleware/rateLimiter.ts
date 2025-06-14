import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'), // 100 requests default
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'],
      retryAfter: res.getHeader('Retry-After')
    });
    
    res.status(429).json({
      error: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: res.getHeader('Retry-After')
      }
    });
  },
  skip: (req: Request) => {
    // Log skipped requests in development
    if (process.env.NODE_ENV === 'development' && req.path === '/csrf-token') {
      logger.debug('Skipping rate limit for CSRF token endpoint');
    }
    return false;
  }
});

// Stricter rate limit for AI endpoints
export const aiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
  max: 30, // 30 AI requests per window
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});