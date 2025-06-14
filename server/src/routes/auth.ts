import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth';
import { authenticateToken } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { logger } from '../utils/logger';
import { redactSensitiveData } from '../utils/redactSensitiveData';

// Define AuthRequest interface
interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100)
});

// Register new user (no CSRF protection needed for registration)
router.post('/register', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, password } = registerSchema.parse(req.body);

    const user = await authService.createUser(username, password);
    
    logger.info('User registered:', redactSensitiveData({ username }));
    
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    if (error.message === 'Username already exists') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    logger.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login (no CSRF protection needed for login)
router.post('/login', async (req: Request, res: Response): Promise<Response> => {
  try {
    logger.info('Login attempt for user:', { username: req.body.username });
    const { username, password } = loginSchema.parse(req.body);

    const result = await authService.login(username, password);
    
    return res.json({
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    if (error.message === 'Invalid username or password') {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    logger.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    return res.json({
      user: {
        id: req.user.userId,
        username: req.user.username
      }
    });
  } catch (error) {
    logger.error('Error getting user info:', error);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Change password
router.post('/change-password', authenticateToken, csrfProtection, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    
    return res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    logger.error('Password change error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete account
router.delete('/account', authenticateToken, csrfProtection, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { confirmation } = req.body;
    
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({ 
        error: 'Invalid confirmation. Send { "confirmation": "DELETE_MY_ACCOUNT" }' 
      });
    }

    await authService.deleteUser(req.user.userId);
    
    return res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Account deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Health check (no auth required)
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', authenticated: false });
});

export default router;