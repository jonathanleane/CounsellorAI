# Security Fixes Plan for CounsellorAI

> ⚠️ **STATUS UPDATE (2025-06-13)**: Many of these issues have been addressed, but critical ones remain. See [TODO.md](./TODO.md) for current status.

## Critical Issues Still Outstanding

### 1. **No Encryption at Rest** (CRITICAL - NOT FIXED)
- **Current State**: SQLite database STILL stores all therapy data in plaintext
- **Risk**: Anyone with filesystem access can read sensitive mental health data
- **Location**: `/database/counsellor.db`
- **Status**: ❌ NOT IMPLEMENTED despite documentation claiming otherwise

### 2. **JSON String Storage Anti-Pattern** (HIGH)
- **Current State**: Structured data stored as JSON strings in SQLite
- **Locations**:
  - Profile fields: demographics, spirituality, therapy_goals, preferences, health, mental_health_screening, sensitive_topics, personal_details
  - All use `JSON.stringify()` for storage and `JSON.parse()` for retrieval
- **Issues**:
  - No query capability on nested data
  - Performance overhead from constant parsing
  - Risk of JSON injection/malformed data

### 3. **Documentation Inconsistencies** (MEDIUM)
- **SECURITY.md**: Claims "Optional database encryption" exists
- **CLAUDE.md**: States "No Encryption: Data stored in plain SQLite"
- **Reality**: No encryption implementation found

## Recommended Solutions

### Phase 1: Implement SQLite Encryption (Immediate)

#### Option A: SQLCipher (Recommended)
- **Package**: `@journeyapps/sqlcipher`
- **Pros**: 
  - Drop-in replacement for sqlite3
  - AES-256 encryption
  - Minimal code changes
- **Implementation**:
  ```typescript
  // Replace sqlite3 with sqlcipher
  import sqlite3 from '@journeyapps/sqlcipher';
  
  // Set encryption key
  db.run("PRAGMA key = ?", [encryptionKey]);
  ```

#### Option B: better-sqlite3-multiple-ciphers
- **Package**: `better-sqlite3-multiple-ciphers`
- **Pros**: 
  - Better performance than sqlite3
  - Multiple cipher support
  - Synchronous API
- **Cons**: Requires more refactoring

#### Option C: Manual Encryption Layer
- **Packages**: `crypto` (built-in) + current sqlite3
- **Approach**: Encrypt/decrypt data before storage
- **Pros**: Works with existing sqlite3
- **Cons**: More complex, performance overhead

### Phase 2: Fix JSON Storage Pattern

#### Short-term Fix (Week 1)
1. Add validation using Zod schemas before JSON.stringify
2. Implement try-catch around all JSON.parse operations
3. Add data sanitization layer

#### Long-term Fix (Month 1)
1. Migrate to proper relational schema:
   - Create separate tables for each data category
   - Use foreign keys for relationships
   - Enable proper querying
2. Create migration script for existing data

### Phase 3: Secure Key Management

1. **Encryption Key Storage**:
   - Never hardcode keys
   - Use environment variable: `DATABASE_ENCRYPTION_KEY`
   - Consider key derivation from user passphrase
   
2. **Key Rotation Strategy**:
   - Implement re-encryption capability
   - Version tracking for key changes

## Implementation Priority

### Week 1 (Critical):
1. Implement SQLCipher encryption
2. Add encryption key to environment variables
3. Create encrypted database migration script
4. Update documentation

### Week 2 (High):
1. Add Zod validation for all JSON data
2. Implement error handling for JSON operations
3. Create data sanitization utilities

### Month 1 (Medium):
1. Design proper relational schema
2. Create migration to normalized tables
3. Remove JSON string storage pattern

## Files to Modify

### For Encryption:
1. `/server/src/services/database/sqlite.ts` - Core database connection
2. `/server/package.json` - Add SQLCipher dependency
3. `/server/.env.example` - Add DATABASE_ENCRYPTION_KEY
4. `/server/src/config/index.ts` - Add encryption config

### For JSON Fix:
1. `/server/src/services/database/sqlite.ts` - All JSON.stringify calls
2. `/server/src/routes/profile.ts` - All JSON.parse calls
3. `/server/src/utils/validation.ts` - New validation layer
4. `/shared/types/` - Add Zod schemas

## Testing Requirements

1. **Encryption Tests**:
   - Verify database file is encrypted
   - Test key rotation
   - Performance benchmarks

2. **Data Integrity Tests**:
   - Migration from unencrypted to encrypted
   - JSON data validation
   - Error handling for malformed data

## Security Considerations

1. **Backup Strategy**: Encrypted backups only
2. **Key Recovery**: Document recovery process
3. **Performance Impact**: ~15% overhead with SQLCipher
4. **Compliance**: Meets HIPAA encryption requirements

## Next Steps

1. Review and approve this plan
2. Choose encryption option (A, B, or C)
3. Create feature branch: `security/database-encryption`
4. Implement Phase 1 with tests
5. Update all documentation