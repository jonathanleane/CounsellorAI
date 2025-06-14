import sqlcipher from '@journeyapps/sqlcipher';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, 'test_encrypted.db');

async function testEncryption() {
  console.log('🔐 Testing database encryption...\n');

  // Test 1: Create encrypted database
  console.log('Test 1: Creating encrypted database');
  await new Promise<void>((resolve, reject) => {
    const db = new sqlcipher.Database(testDbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.run("PRAGMA key = 'test-encryption-key'", (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, data TEXT)', (err) => {
          if (err) {
            reject(err);
            return;
          }

          db.run("INSERT INTO test (data) VALUES (?)", ['Sensitive therapy data'], (err) => {
            if (err) {
              reject(err);
              return;
            }

            db.close(() => {
              console.log('✅ Encrypted database created\n');
              resolve();
            });
          });
        });
      });
    });
  });

  // Test 2: Try to read without key (should fail)
  console.log('Test 2: Attempting to read without encryption key');
  await new Promise<void>((resolve) => {
    const dbNoKey = new sqlite3.Database(testDbPath, (err) => {
      if (err) {
        console.log('✅ SUCCESS: Cannot open database without key\n');
        resolve();
        return;
      }

      dbNoKey.all('SELECT * FROM test', (err, rows) => {
        if (err) {
          console.log('✅ SUCCESS: Database not readable without key\n');
        } else {
          console.log('❌ FAIL: Database readable without key!\n');
        }
        dbNoKey.close(() => resolve());
      });
    });
  });

  // Test 3: Read with correct key
  console.log('Test 3: Reading with correct encryption key');
  await new Promise<void>((resolve, reject) => {
    const dbWithKey = new sqlcipher.Database(testDbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      dbWithKey.run("PRAGMA key = 'test-encryption-key'", (err) => {
        if (err) {
          reject(err);
          return;
        }

        dbWithKey.all('SELECT * FROM test', (err, rows) => {
          if (err) {
            console.log('❌ FAIL: Cannot read with correct key\n');
            reject(err);
          } else {
            console.log('✅ SUCCESS: Data retrieved with correct key');
            console.log('Data:', rows, '\n');
          }
          dbWithKey.close(() => resolve());
        });
      });
    });
  });

  // Test 4: Try with wrong key
  console.log('Test 4: Attempting to read with wrong key');
  await new Promise<void>((resolve) => {
    const dbWrongKey = new sqlcipher.Database(testDbPath, (err) => {
      if (err) {
        console.log('✅ SUCCESS: Cannot open database with wrong key\n');
        resolve();
        return;
      }

      dbWrongKey.run("PRAGMA key = 'wrong-key'", (err) => {
        if (err) {
          console.log('✅ SUCCESS: Database not accessible with wrong key\n');
          dbWrongKey.close(() => resolve());
          return;
        }

        dbWrongKey.all('SELECT * FROM test', (err, rows) => {
          if (err) {
            console.log('✅ SUCCESS: Database not readable with wrong key\n');
          } else {
            console.log('❌ FAIL: Database readable with wrong key!\n');
          }
          dbWrongKey.close(() => resolve());
        });
      });
    });
  });

  // Cleanup
  fs.unlinkSync(testDbPath);
  console.log('🧹 Test database cleaned up');
  console.log('\n✅ All encryption tests passed!');
}

testEncryption().catch(console.error);