#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { backupService } from '../services/backup';
import { initializeDatabase } from '../services/database';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function createBackup() {
  try {
    console.log('CounsellorAI Backup Utility\n');
    console.log('Initializing...');
    
    // Initialize database
    await initializeDatabase();
    
    // Create backup
    console.log('Creating backup...');
    const backupPath = await backupService.createManualBackup();
    const backupName = path.basename(backupPath);
    
    console.log(`\n✅ Backup created successfully!`);
    console.log(`📦 File: ${backupName}`);
    console.log(`📍 Location: ${backupPath}`);
    
    // List current backups
    const backups = backupService.listBackups();
    console.log(`\n📋 Total backups: ${backups.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createBackup();
}