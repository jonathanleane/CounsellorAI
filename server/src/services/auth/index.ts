import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database';
import { logger } from '../../utils/logger';

interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  last_login?: string;
}

interface TokenPayload {
  userId: number;
  username: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly saltRounds: number = 10;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'change_this_secret_key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (this.jwtSecret === 'change_this_secret_key') {
      logger.warn('⚠️  Using default JWT secret - CHANGE THIS IN PRODUCTION');
    }
  }

  async createUser(username: string, password: string): Promise<{ id: number; username: string }> {
    try {
      const db = getDatabase();
      
      // Check if user already exists
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.saltRounds);

      // Create user
      const userId = await db.createUser(username, passwordHash);
      
      logger.info(`New user created: ${username} (ID: ${userId})`);
      
      return { id: userId, username };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<{ token: string; user: { id: number; username: string } }> {
    try {
      const db = getDatabase();
      
      // Get user
      const user = await db.getUserByUsername(username);
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid username or password');
      }

      // Update last login
      await db.updateLastLogin(user.id);

      // Generate token
      const token = this.generateToken({ userId: user.id, username: user.username });

      logger.info(`User logged in: ${username} (ID: ${user.id})`);

      return {
        token,
        user: {
          id: user.id,
          username: user.username
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const db = getDatabase();
      
      // Get user
      const user = await db.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await db.updatePassword(userId, newPasswordHash);

      logger.info(`Password changed for user ID: ${userId}`);
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      const db = getDatabase();
      await db.deleteUser(userId);
      logger.info(`User deleted: ID ${userId}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();