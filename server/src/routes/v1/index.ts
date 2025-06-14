import { Router } from 'express';
import authRoutes from '../auth';
import sessionRoutes from '../sessions';
import profileRoutes from '../profile';
import healthRoutes from '../health';
import testRoutes from '../test';
import exportRoutes from '../export';
import backupRoutes from '../backup';

const router = Router();

// Mount all v1 routes
router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/profile', profileRoutes);
router.use('/health', healthRoutes);
router.use('/test', testRoutes);
router.use('/', exportRoutes);  // Export routes at /api/v1/export/*
router.use('/backup', backupRoutes);

// Version info endpoint
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    api: 'v1',
    status: 'active',
    deprecated: false,
    features: [
      'authentication',
      'sessions',
      'profile',
      'health',
      'export',
      'backup',
      'ai-models',
      'auto-learning',
      'encryption',
      'gdpr-compliance'
    ]
  });
});

export default router;