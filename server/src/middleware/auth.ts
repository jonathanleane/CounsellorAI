import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt');
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = authService.verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we don't fail the request
      logger.debug('Invalid token in optional auth');
    }
  }

  next();
};