import sqlite3 from '@journeyapps/sqlcipher';
import path from 'path';
import { logger } from '../../utils/logger';
import fs from 'fs';
import { DatabaseInterface } from './interface';
import { redactSensitiveData } from '../../utils/redaction';

const dbPath = path.join(__dirname, '../../../../database/counsellor_encrypted.db');

export class EncryptedSQLiteDatabase implements DatabaseInterface {
  private db: sqlite3.Database | null = null;
  private encryptionKey: string;
  private initPromise: Promise<void> | null = null;

  constructor() {
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

        // Set encryption key
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
  }

  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  // Profile methods
  async getProfile(): Promise<any> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.get('SELECT * FROM profiles WHERE id = ?', ['default'], (err, row) => {
        if (err) {
          logger.error('Error getting profile:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async createProfile(data: any): Promise<any> {
    this.ensureInitialized();
    const {
      name, demographics, spirituality, therapy_goals,
      preferences, health, mental_health_screening, sensitive_topics
    } = data;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO profiles (
          id, name, demographics, spirituality, therapy_goals,
          preferences, health, mental_health_screening, sensitive_topics,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      this.db!.run(
        query,
        [
          'default',
          name,
          JSON.stringify(demographics || {}),
          JSON.stringify(spirituality || {}),
          JSON.stringify(therapy_goals || {}),
          JSON.stringify(preferences || {}),
          JSON.stringify(health || {}),
          JSON.stringify(mental_health_screening || {}),
          JSON.stringify(sensitive_topics || {})
        ],
        (err) => {
          if (err) {
            logger.error('Error creating profile:', err);
            reject(err);
          } else {
            logger.info('Profile created/updated successfully', redactSensitiveData({ name }));
            resolve({ id: 'default', ...data });
          }
        }
      );
    });
  }

  async updateProfile(field: string, value: any): Promise<void> {
    this.ensureInitialized();
    
    // Whitelist allowed fields to prevent SQL injection
    const allowedFields = [
      'name', 'demographics', 'spirituality', 'therapy_goals',
      'preferences', 'health', 'mental_health_screening', 'sensitive_topics',
      'personal_details', 'intake_completed'
    ];
    
    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid field name: ${field}`);
    }

    const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
    
    return new Promise((resolve, reject) => {
      this.db!.run(
        `UPDATE profiles SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`,
        [valueStr, 'default'],
        (err) => {
          if (err) {
            logger.error('Error updating profile:', err);
            reject(err);
          } else {
            logger.info(`Profile field ${field} updated`, redactSensitiveData({ field }));
            resolve();
          }
        }
      );
    });
  }

  // Conversation methods
  async getAllConversations(): Promise<any[]> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.all('SELECT * FROM conversations ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
          logger.error('Error getting conversations:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async getRecentConversations(limit: number = 5): Promise<any[]> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.all(
        'SELECT * FROM conversations ORDER BY timestamp DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) {
            logger.error('Error getting recent conversations:', err);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async getConversation(id: string): Promise<any> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.get('SELECT * FROM conversations WHERE id = ?', [id], async (err, conversation) => {
        if (err) {
          logger.error('Error getting conversation:', err);
          reject(err);
        } else if (!conversation) {
          resolve(null);
        } else {
          try {
            const messages = await this.getMessages(id);
            resolve({ ...conversation, messages });
          } catch (msgErr) {
            reject(msgErr);
          }
        }
      });
    });
  }

  async createConversation(data: any): Promise<any> {
    this.ensureInitialized();
    const id = Date.now().toString();
    const { session_type, initial_mood, model } = data;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO conversations (id, session_type, initial_mood, model)
        VALUES (?, ?, ?, ?)
      `;

      this.db!.run(query, [id, session_type, initial_mood, model], (err) => {
        if (err) {
          logger.error('Error creating conversation:', err);
          reject(err);
        } else {
          const result = {
            id,
            session_type,
            initial_mood,
            model,
            status: 'active',
            timestamp: new Date().toISOString(),
            messages: []
          };
          logger.info('Conversation created:', redactSensitiveData({ id, session_type, model }));
          resolve(result);
        }
      });
    });
  }

  async updateConversation(id: string, data: any): Promise<void> {
    this.ensureInitialized();
    const fields = Object.keys(data);
    const values = Object.values(data);
    values.push(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    return new Promise((resolve, reject) => {
      this.db!.run(
        `UPDATE conversations SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        values,
        (err) => {
          if (err) {
            logger.error('Error updating conversation:', err);
            reject(err);
          } else {
            logger.info('Conversation updated:', redactSensitiveData({ id }));
            resolve();
          }
        }
      );
    });
  }

  async deleteConversation(id: string): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.run('DELETE FROM conversations WHERE id = ?', [id], (err) => {
        if (err) {
          logger.error('Error deleting conversation:', err);
          reject(err);
        } else {
          logger.info('Conversation deleted:', redactSensitiveData({ id }));
          resolve();
        }
      });
    });
  }

  // Message methods
  async getMessages(conversationId: string): Promise<any[]> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.all(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [conversationId],
        (err, rows) => {
          if (err) {
            logger.error('Error getting messages:', err);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  async addMessage(conversationId: string, data: any): Promise<any> {
    this.ensureInitialized();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { role, content } = data;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `;

      this.db!.run(query, [id, conversationId, role, content], (err) => {
        if (err) {
          logger.error('Error adding message:', err);
          reject(err);
        } else {
          const result = {
            id,
            conversation_id: conversationId,
            role,
            content,
            timestamp: new Date().toISOString()
          };
          logger.info('Message added:', redactSensitiveData({ id, conversationId, role }));
          resolve(result);
        }
      });
    });
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db!.run(
        'DELETE FROM messages WHERE id = ? AND conversation_id = ?',
        [messageId, conversationId],
        (err) => {
          if (err) {
            logger.error('Error deleting message:', err);
            reject(err);
          } else {
            logger.info('Message deleted:', redactSensitiveData({ messageId, conversationId }));
            resolve();
          }
        }
      );
    });
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