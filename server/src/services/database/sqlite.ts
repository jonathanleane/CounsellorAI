import sqlite3 from 'sqlite3';
import path from 'path';
import { logger } from '../../utils/logger';
import { BaseSQLiteDatabase } from './baseSqlite';

const dbPath = path.join(__dirname, '../../../../database/counsellor.db');

export class SQLiteDatabase extends BaseSQLiteDatabase {
  protected db: sqlite3.Database;

  constructor() {
    super();
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening SQLite database:', err);
        throw err;
      }
      logger.info(`Connected to SQLite database at ${dbPath}`);
    });
  }

  protected ensureInitialized(): void {
    // SQLiteDatabase is initialized in constructor, so this is a no-op
  }

  async initialize(): Promise<void> {
    await this.createTables();
  }

  private createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            last_login TEXT
          )
        `, (err) => {
          if (err) {
            logger.error('Error creating users table:', err);
            reject(err);
            return;
          }
        });

        // Profiles table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS profiles (
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
          )
        `, (err) => {
          if (err) {
            logger.error('Error creating profiles table:', err);
            reject(err);
            return;
          }
        });

        // Conversations table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS conversations (
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
          )
        `, (err) => {
          if (err) {
            logger.error('Error creating conversations table:', err);
            reject(err);
            return;
          }
        });

        // Messages table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            logger.error('Error creating messages table:', err);
            reject(err);
            return;
          }
          
          logger.info('SQLite tables created successfully');
          
          // Run migrations for existing databases
          this.runMigrations().then(() => {
            resolve();
          }).catch(reject);
        });
      });
    });
  }




















  close(): void {
    this.db.close((err) => {
      if (err) {
        logger.error('Error closing SQLite database:', err);
      } else {
        logger.info('SQLite database connection closed');
      }
    });
  }
}

export const sqliteDb = new SQLiteDatabase();