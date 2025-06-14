import sqlite3 from '@journeyapps/sqlcipher';
import path from 'path';
import { logger } from '../../utils/logger';
import fs from 'fs';
import { BaseSQLiteDatabase } from './baseSqlite';
import { redactSensitiveData } from '../../utils/redaction';

const dbPath = path.join(__dirname, '../../../../database/counsellor_encrypted.db');

export class EncryptedSQLiteDatabase extends BaseSQLiteDatabase {
  protected db: sqlite3.Database | null = null;
  private encryptionKey: string;
  private initPromise: Promise<void> | null = null;

  constructor() {
    super();
    const key = process.env.DATABASE_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('DATABASE_ENCRYPTION_KEY environment variable is required for encrypted database');
    }
    this.encryptionKey = key;
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Error opening encrypted SQLite database:', err);
          reject(err);
          return;
        }

        // Set encryption key - PRAGMA doesn't support parameterized queries
        // The key is from environment variable, not user input, so it's safe
        this.db!.run(`PRAGMA key = '${this.encryptionKey}'`, (err) => {
          if (err) {
            logger.error('Error setting encryption key:', err);
            reject(err);
            return;
          }

          // Use memory for temporary storage (security best practice)
          this.db!.run('PRAGMA temp_store = MEMORY', (err) => {
            if (err) {
              logger.error('Error setting temp_store:', err);
              reject(err);
              return;
            }

            // Verify database is accessible
            this.db!.get('SELECT 1', (err) => {
              if (err) {
                logger.error('Error verifying encrypted database access:', err);
                reject(err);
                return;
              }

              logger.info(`Connected to encrypted SQLite database at ${dbPath}`);
              this.createTables().then(resolve).catch(reject);
            });
          });
        });
      });
    });
  }

  private async createTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        last_login TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY DEFAULT 'default',
        name TEXT NOT NULL,
        demographics TEXT,
        spirituality TEXT,
        therapy_goals TEXT,
        preferences TEXT,
        health TEXT,
        mental_health_screening TEXT,
        sensitive_topics TEXT,
        personal_details TEXT,
        intake_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        session_type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        initial_mood INTEGER,
        end_mood INTEGER,
        duration INTEGER,
        model TEXT,
        ai_summary TEXT,
        identified_patterns TEXT,
        followup_suggestions TEXT,
        learned_details TEXT,
        learning_changes TEXT,
        timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )`
    ];

    for (const query of queries) {
      await new Promise<void>((resolve, reject) => {
        this.db!.run(query, (err) => {
          if (err) {
            logger.error('Error creating table:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    logger.info('Encrypted SQLite tables created successfully');
    
    // Run migrations for existing databases
    await this.runMigrations();
  }


  protected ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  // Override createProfile to add redaction
  async createProfile(data: any): Promise<any> {
    const result = await super.createProfile(data);
    logger.info('Profile created/updated successfully', redactSensitiveData({ name: data.name }));
    return result;
  }

  // Override createConversation to add redaction
  async createConversation(data: any): Promise<any> {
    const result = await super.createConversation(data);
    logger.info('Conversation created:', redactSensitiveData({ 
      id: result.id, 
      session_type: data.session_type, 
      model: data.model 
    }));
    return result;
  }

  // Override addMessage to add redaction  
  async addMessage(conversationId: string, data: any): Promise<any> {
    const result = await super.addMessage(conversationId, data);
    logger.info('Message added:', redactSensitiveData({ 
      id: result.id, 
      conversationId, 
      role: data.role 
    }));
    return result;
  }









  close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing encrypted SQLite database:', err);
        } else {
          logger.info('Encrypted SQLite database connection closed');
        }
      });
      this.db = null;
    }
  }
}

export const encryptedDb = new EncryptedSQLiteDatabase();