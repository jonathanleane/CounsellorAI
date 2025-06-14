import sqlite3 from 'sqlite3';
import sqlcipher from '@journeyapps/sqlcipher';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const oldDbPath = path.join(__dirname, '../../../database/counsellor.db');
const newDbPath = path.join(__dirname, '../../../database/counsellor_encrypted.db');
const backupPath = path.join(__dirname, '../../../database/counsellor_backup.db');

async function migrateToEncryptedDatabase() {
  const encryptionKey = process.env.DATABASE_ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    throw new Error('DATABASE_ENCRYPTION_KEY is required for migration. Add it to your .env file.');
  }

  // Check if old database exists
  if (!fs.existsSync(oldDbPath)) {
    console.log('No existing database found. Nothing to migrate.');
    return;
  }

  // Check if encrypted database already exists
  if (fs.existsSync(newDbPath)) {
    console.log('⚠️  Encrypted database already exists. To re-migrate, delete it first.');
    return;
  }

  // Create backup
  console.log('Creating backup of existing database...');
  fs.copyFileSync(oldDbPath, backupPath);
  console.log(`✅ Backup created at: ${backupPath}`);

  // Open old database
  const oldDb = new sqlite3.Database(oldDbPath);
  const getAsync = promisify(oldDb.get.bind(oldDb));
  const allAsync = promisify(oldDb.all.bind(oldDb));

  // Create new encrypted database
  const newDb = new sqlcipher.Database(newDbPath);
  const runAsync = promisify(newDb.run.bind(newDb));

  try {
    console.log('Starting migration to encrypted database...');

    // Set encryption key on new database
    await runAsync(`PRAGMA key = '${encryptionKey}'`);
    await runAsync('PRAGMA temp_store = MEMORY');

    // Create tables in new database
    await runAsync(`
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
    `);

    await runAsync(`
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
        timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Migrate profiles
    console.log('Migrating profiles...');
    const profiles = await allAsync('SELECT * FROM profiles');
    for (const profile of profiles || []) {
      await runAsync(`
        INSERT INTO profiles (
          id, name, demographics, spirituality, therapy_goals,
          preferences, health, mental_health_screening, sensitive_topics,
          personal_details, intake_completed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        profile.id,
        profile.name,
        profile.demographics,
        profile.spirituality,
        profile.therapy_goals,
        profile.preferences,
        profile.health,
        profile.mental_health_screening,
        profile.sensitive_topics,
        profile.personal_details,
        profile.intake_completed,
        profile.created_at,
        profile.updated_at
      ]);
    }
    console.log(`✅ Migrated ${profiles?.length || 0} profiles`);

    // Migrate conversations
    console.log('Migrating conversations...');
    const conversations = await allAsync('SELECT * FROM conversations');
    for (const conversation of conversations || []) {
      await runAsync(`
        INSERT INTO conversations (
          id, session_type, status, initial_mood, end_mood,
          duration, model, ai_summary, identified_patterns,
          followup_suggestions, timestamp, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        conversation.id,
        conversation.session_type,
        conversation.status,
        conversation.initial_mood,
        conversation.end_mood,
        conversation.duration,
        conversation.model,
        conversation.ai_summary,
        conversation.identified_patterns,
        conversation.followup_suggestions,
        conversation.timestamp,
        conversation.updated_at
      ]);
    }
    console.log(`✅ Migrated ${conversations?.length || 0} conversations`);

    // Migrate messages
    console.log('Migrating messages...');
    const messages = await allAsync('SELECT * FROM messages');
    for (const message of messages || []) {
      await runAsync(`
        INSERT INTO messages (
          id, conversation_id, role, content, timestamp
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        message.id,
        message.conversation_id,
        message.role,
        message.content,
        message.timestamp
      ]);
    }
    console.log(`✅ Migrated ${messages?.length || 0} messages`);

    // Close databases
    await new Promise<void>((resolve) => oldDb.close(() => resolve()));
    await new Promise<void>((resolve) => newDb.close(() => resolve()));

    console.log('\n✅ Migration completed successfully!');
    console.log(`📁 Original database backed up to: ${backupPath}`);
    console.log(`🔐 Encrypted database created at: ${newDbPath}`);
    console.log('\n⚠️  Next steps:');
    console.log('1. Test the encrypted database thoroughly');
    console.log('2. Update the database service to use encryptedSqlite.ts');
    console.log('3. Consider deleting the unencrypted database after verification');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Cleanup on failure
    if (fs.existsSync(newDbPath)) {
      fs.unlinkSync(newDbPath);
    }
    
    await new Promise<void>((resolve) => oldDb.close(() => resolve()));
    await new Promise<void>((resolve) => newDb.close(() => resolve()));
    
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToEncryptedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { migrateToEncryptedDatabase };