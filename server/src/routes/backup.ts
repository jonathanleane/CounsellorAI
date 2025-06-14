import { Router, Request, Response } from 'express';
import { backupService } from '../services/backup';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { csrfProtection } from '../middleware/csrf';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all backup routes
router.use(authenticateToken);

// List all backups
router.get('/list', async (req: Request, res: Response) => {
  try {
    const backups = backupService.listBackups();
    res.json({
      backups,
      enabled: process.env.AUTO_BACKUP === 'true',
      interval: process.env.BACKUP_INTERVAL || 'daily',
      maxBackups: parseInt(process.env.MAX_BACKUPS || '7', 10)
    });
  } catch (error) {
    logger.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Create manual backup
router.post('/create', csrfProtection, async (req: Request, res: Response) => {
  try {
    const backupPath = await backupService.createManualBackup();
    const backupName = path.basename(backupPath);
    
    logger.info(`Manual backup created: ${backupName}`);
    
    res.json({
      message: 'Backup created successfully',
      backup: {
        name: backupName,
        path: backupPath,
        created: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Download backup
router.get('/download/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename.match(/^counsellor-backup-\d{4}-\d{2}-\d{2}-\d{6}\.zip$/)) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }
    
    const backupPath = backupService.getBackupPath(filename);
    
    if (!backupPath) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const stream = fs.createReadStream(backupPath);
    stream.pipe(res);
    
    stream.on('error', (error) => {
      logger.error('Error streaming backup:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download backup' });
      }
    });
    
  } catch (error) {
    logger.error('Error downloading backup:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Delete backup
router.delete('/:filename', csrfProtection, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename.match(/^counsellor-backup-\d{4}-\d{2}-\d{2}-\d{6}\.zip$/)) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }
    
    const backupPath = backupService.getBackupPath(filename);
    
    if (!backupPath) {
      return res.status(404).json({ error: 'Backup not found' });
    }
    
    fs.unlinkSync(backupPath);
    logger.info(`Backup deleted: ${filename}`);
    
    res.json({ message: 'Backup deleted successfully' });
    
  } catch (error) {
    logger.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

export default router;