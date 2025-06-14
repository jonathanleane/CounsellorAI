import { logger } from '../../utils/logger';
import { IDatabase } from './interface';
import { sqliteDb } from './sqlite';
import { encryptedDb } from './encryptedSqlite';
// import { firebaseDb } from './firebase'; // TODO: Implement Firebase

let database: IDatabase;

export async function initializeDatabase(): Promise<void> {
  const useFirebase = process.env.USE_FIREBASE === 'true';
  const useEncryption = process.env.DATABASE_ENCRYPTION_KEY ? true : false;
  
  if (useFirebase) {
    logger.info('Initializing Firebase database...');
    // TODO: Initialize Firebase
    // database = firebaseDb;
    throw new Error('Firebase not yet implemented');
  } else if (useEncryption) {
    logger.info('Initializing encrypted SQLite database...');
    try {
      database = encryptedDb;
      await database.initialize();
      logger.info('✅ Using encrypted database for enhanced security');
    } catch (error) {
      logger.error('Failed to initialize encrypted database:', error);
      
      // In production, fail immediately if encryption setup fails
      if (process.env.NODE_ENV === 'production' || process.env.USE_ENCRYPTED_DB === 'true') {
        throw new Error('DATABASE_ENCRYPTION_KEY is set but encryption initialization failed. Refusing to start with unencrypted database in production.');
      }
      
      logger.warn('⚠️  Falling back to unencrypted database (development mode only)');
      database = sqliteDb;
      await database.initialize();
    }
  } else {
    // In production, require encryption
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_ENCRYPTION_KEY is required in production. Refusing to start with unencrypted database.');
    }
    
    logger.warn('⚠️  DATABASE_ENCRYPTION_KEY not set - using UNENCRYPTED database');
    logger.warn('⚠️  This is NOT secure for production use!');
    database = sqliteDb;
    await database.initialize();
  }
  
  logger.info('Database initialized successfully');
}

export function getDatabase(): IDatabase {
  if (!database) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
}

export { IDatabase, Profile, Conversation, Message } from './interface';