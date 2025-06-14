import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';
import { backupService } from '../services/backup';
import { initializeDatabase } from '../services/database';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function testBackup() {
  try {
    console.log('Testing backup functionality...\n');
    
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    
    // Test manual backup
    console.log('\nCreating manual backup...');
    const backupPath = await backupService.createManualBackup();
    console.log(`✓ Backup created successfully at: ${backupPath}`);
    
    // List backups
    console.log('\nListing all backups:');
    const backups = backupService.listBackups();
    console.log(`Found ${backups.length} backup(s):`);
    backups.forEach(backup => {
      console.log(`  - ${backup.name} (${(backup.size / 1024).toFixed(2)} KB) - Created: ${backup.created.toISOString()}`);
    });
    
    // Test backup path retrieval
    if (backups.length > 0) {
      const testBackup = backups[0];
      const retrievedPath = backupService.getBackupPath(testBackup.name);
      console.log(`\n✓ Successfully retrieved path for ${testBackup.name}: ${retrievedPath}`);
    }
    
    console.log('\n✅ All backup tests passed!');
    
  } catch (error) {
    console.error('\n❌ Backup test failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run test
testBackup();