import crypto from 'crypto';
import { logger } from '../../utils/logger';
import { DatabaseInterface } from './interface';

export abstract class BaseSQLiteDatabase implements DatabaseInterface {
  protected abstract db: any;
  
  // Abstract methods that must be implemented by subclasses
  protected abstract ensureInitialized(): void;
  abstract initialize(): Promise<void>;
  abstract close(): void;

  // Common methods shared between both implementations
  
  // Profile methods
  async getProfile(): Promise<any> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM profiles WHERE id = ?', ['default'], (err: any, row: any) => {
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

      this.db.run(
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
        (err: any) => {
          if (err) {
            logger.error('Error creating profile:', err);
            reject(err);
          } else {
            logger.info('Profile created/updated successfully');
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
      this.db.run(
        `UPDATE profiles SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`,
        [valueStr, 'default'],
        (err: any) => {
          if (err) {
            logger.error('Error updating profile:', err);
            reject(err);
          } else {
            logger.info(`Profile field ${field} updated`);
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
      this.db.all('SELECT * FROM conversations ORDER BY timestamp DESC', (err: any, rows: any[]) => {
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
      this.db.all(
        'SELECT * FROM conversations ORDER BY timestamp DESC LIMIT ?',
        [limit],
        (err: any, rows: any[]) => {
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
      this.db.get('SELECT * FROM conversations WHERE id = ?', [id], async (err: any, conversation: any) => {
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
    const id = crypto.randomUUID();
    const { session_type, initial_mood, model } = data;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO conversations (id, session_type, initial_mood, model)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(query, [id, session_type, initial_mood, model], (err: any) => {
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
          logger.info('Conversation created:', { id, session_type, model });
          resolve(result);
        }
      });
    });
  }

  async updateConversation(id: string, data: any): Promise<void> {
    this.ensureInitialized();
    
    // Whitelist allowed fields to prevent SQL injection
    const allowedFields = [
      'session_type', 'status', 'initial_mood', 'end_mood',
      'duration', 'model', 'ai_summary', 'identified_patterns',
      'followup_suggestions', 'learned_details', 'learning_changes'
    ];
    
    // Filter and validate fields
    const updateFields = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = ?`);
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = updateFields.join(', ');
    const values = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .map(key => data[key]);
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE conversations SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        values,
        (err: any) => {
          if (err) {
            logger.error('Error updating conversation:', err);
            reject(err);
          } else {
            logger.info('Conversation updated:', { id });
            resolve();
          }
        }
      );
    });
  }

  async deleteConversation(id: string): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM conversations WHERE id = ?', [id], (err: any) => {
        if (err) {
          logger.error('Error deleting conversation:', err);
          reject(err);
        } else {
          logger.info('Conversation deleted:', { id });
          resolve();
        }
      });
    });
  }

  // Message methods
  async getMessages(conversationId: string): Promise<any[]> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [conversationId],
        (err: any, rows: any[]) => {
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
    const id = `msg_${crypto.randomUUID()}`;
    const { role, content } = data;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO messages (id, conversation_id, role, content)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(query, [id, conversationId, role, content], (err: any) => {
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
          logger.info('Message added:', { id, conversationId, role });
          resolve(result);
        }
      });
    });
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM messages WHERE id = ? AND conversation_id = ?',
        [messageId, conversationId],
        (err: any) => {
          if (err) {
            logger.error('Error deleting message:', err);
            reject(err);
          } else {
            logger.info('Message deleted:', { messageId, conversationId });
            resolve();
          }
        }
      );
    });
  }

  // User methods
  async getUserById(id: number): Promise<any> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err: any, row: any) => {
        if (err) {
          logger.error('Error getting user by ID:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserByUsername(username: string): Promise<any> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE username = ?', [username], (err: any, row: any) => {
        if (err) {
          logger.error('Error getting user by username:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async createUser(username: string, passwordHash: string): Promise<number> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash],
        function(this: any, err: any) {
          if (err) {
            logger.error('Error creating user:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, userId],
        (err: any) => {
          if (err) {
            logger.error('Error updating password:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updateLastLogin(userId: number): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET last_login = datetime("now") WHERE id = ?',
        [userId],
        (err: any) => {
          if (err) {
            logger.error('Error updating last login:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteUser(userId: number): Promise<void> {
    this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM users WHERE id = ?', [userId], (err: any) => {
        if (err) {
          logger.error('Error deleting user:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Common migration logic
  protected async runMigrations(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if learned_details column exists
      this.db.all("PRAGMA table_info(conversations)", (err: any, columns: any[]) => {
        if (err) {
          logger.error('Error checking table info:', err);
          reject(err);
          return;
        }
        
        const hasLearnedDetails = columns.some((col: any) => col.name === 'learned_details');
        const hasLearningChanges = columns.some((col: any) => col.name === 'learning_changes');
        
        if (!hasLearnedDetails || !hasLearningChanges) {
          logger.info('Running migration to add learning columns...');
          
          const migrations = [];
          if (!hasLearnedDetails) {
            migrations.push("ALTER TABLE conversations ADD COLUMN learned_details TEXT");
          }
          if (!hasLearningChanges) {
            migrations.push("ALTER TABLE conversations ADD COLUMN learning_changes TEXT");
          }
          
          let completed = 0;
          migrations.forEach(migration => {
            this.db.run(migration, (err: any) => {
              if (err && !err.message.includes('duplicate column')) {
                logger.error('Migration error:', err);
              }
              completed++;
              if (completed === migrations.length) {
                logger.info('Migrations completed');
                resolve();
              }
            });
          });
          
          if (migrations.length === 0) {
            resolve();
          }
        } else {
          resolve();
        }
      });
    });
  }
}