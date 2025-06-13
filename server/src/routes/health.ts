import { Router } from 'express';
import { aiService } from '../services/ai';

const router = Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// AI models availability check
router.get('/models', (req, res) => {
  const models = aiService.getAvailableModels();
  res.json({
    models,
    configured: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      google: !!process.env.GOOGLE_AI_API_KEY
    }
  });
});

export default router;