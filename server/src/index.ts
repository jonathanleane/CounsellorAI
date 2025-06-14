import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { csrfProtection, csrfErrorHandler, getCsrfToken } from './middleware/csrf';
import { validateEnv } from './config/validateEnv';
import { logger } from './utils/logger';
import { initializeDatabase } from './services/database';
import { aiService } from './services/ai';
import { backupService } from './services/backup';

// Routes
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import profileRoutes from './routes/profile';
import healthRoutes from './routes/health';
import testRoutes from './routes/test';
import exportRoutes from './routes/export';
import backupRoutes from './routes/backup';
import v1Routes from './routes/v1';

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate IP addresses in development
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
}));

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Cookie parser for CSRF
app.use(cookieParser());

// Add request size limits to prevent DoS attacks
app.use(express.json({ 
  limit: '1mb',  // Limit JSON payloads to 1MB (reduced from 10mb for security)
  strict: true   // Only accept arrays and objects
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb'   // Limit URL-encoded payloads to 1MB (reduced from 10mb for security)
}));

// Serve test page in development
if (process.env.NODE_ENV === 'development') {
  app.get('/test-models.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../test-models.html'));
  });
}

// CSRF token endpoint (must be before rate limiting and CSRF protection)
app.get('/api/csrf-token', getCsrfToken);

// Rate limiting (exclude csrf-token endpoint)
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for CSRF token endpoint
  if (req.path === '/csrf-token' && req.method === 'GET') {
    return next();
  }
  return rateLimiter(req, res, next);
});

// Auth routes (no CSRF for login/register)
app.use('/api/auth', authRoutes);

// Apply CSRF protection to all state-changing routes
app.use('/api/', csrfProtection);

// API Routes - Version 1 (with /api/v1 prefix)
app.use('/api/v1', v1Routes);

// Legacy routes (maintain backward compatibility)
// These will be deprecated in the future
app.use('/api/sessions', sessionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/test', testRoutes);
app.use('/api', exportRoutes);  // Export routes at /api/export/*
app.use('/api/backup', backupRoutes);

// API version redirect for root
app.get('/api', (req, res) => {
  res.json({
    message: 'CounsellorAI API',
    versions: {
      v1: {
        status: 'active',
        base_url: '/api/v1',
        docs: '/api/v1/version'
      },
      legacy: {
        status: 'deprecated',
        base_url: '/api',
        note: 'Will be removed in future versions. Please use /api/v1'
      }
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Error handling
app.use(csrfErrorHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // Start backup service
    backupService.start();
    
    // Check available AI providers
    const availableModels = aiService.getAvailableModels();
    const availableProviders = new Set(
      availableModels
        .filter(model => model.available)
        .map(model => model.provider)
    );
    
    if (availableProviders.size === 0) {
      logger.error('No AI providers available. Please configure at least one API key.');
      logger.error('Set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_API_KEY');
      process.exit(1);
    }
    
    logger.info(`Available AI providers: ${Array.from(availableProviders).join(', ')}`);
    logger.info(`Available models: ${availableModels.filter(m => m.available).map(m => m.name).join(', ')}`);
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  backupService.stop();
  process.exit(0);
});

export default app;