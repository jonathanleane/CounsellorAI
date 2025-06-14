# CounsellorAI - Security & Bug Fix TODO List

Last Updated: 2025-06-14

## 🔴 CRITICAL Security Issues (Fix Immediately)

### 1. ⚠️ Add Development Warning to README.md
- [✓] Add prominent warning: "⚠️ DEVELOPMENT ONLY - DO NOT USE FOR REAL THERAPY DATA"
- [✓] Explain security limitations
- **Priority**: HIGH
- **Files**: README.md
- **Status**: ✅ COMPLETED (2025-06-13)

### 2. 🔐 Implement Database Encryption
- [✓] Encrypt all therapy sessions and personal data
- [✓] Use SQLCipher for encryption
- [✓] Implement key management
- **Priority**: CRITICAL
- **Files**: server/src/services/database/encryptedSqlite.ts
- **Status**: ✅ COMPLETED (2025-06-14)
- **Solution**: Implemented SQLCipher with AES-256 encryption

### 3. 🔑 Add Authentication System
- [ ] Implement JWT or session-based auth
- [ ] Add login/logout functionality
- [ ] Protect all API endpoints
- [ ] Add user management
- **Priority**: CRITICAL
- **Files**: New auth routes, middleware, frontend components

### 4. 💉 Fix SQL Injection Vulnerability
- [✓] Sanitize field names in updateProfile
- [✓] Use field whitelisting for safety
- **Priority**: CRITICAL
- **Files**: server/src/services/database/sqlite.ts:207
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Implemented field whitelisting with allowedFields array

### 5. 🚫 Remove Sensitive Data from Logs
- [✓] Use redactSensitiveData utility
- [✓] Remove full profile logging
- [✓] Implement log levels
- **Priority**: HIGH
- **Files**: server/src/routes/profile.ts:14,40,58
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Created redactSensitiveData utility and applied throughout

### 6. ✅ Add Input Validation
- [✓] Implement Zod schemas for all endpoints
- [✓] Validate profile data structure
- [✓] Validate session creation
- [✓] Add request sanitization
- **Priority**: HIGH
- **Files**: server/src/routes/profile.ts, server/src/routes/sessions.ts
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Added comprehensive Zod validation to all POST endpoints

### 7. 🛡️ Add CSRF Protection
- [✓] Implement CSRF tokens
- [✓] Add middleware protection
- **Priority**: HIGH
- **Files**: Server middleware configuration
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Implemented double-submit cookie pattern with csrf-csrf package

## 🟠 HIGH Priority Bugs

### 8. 🤖 Fix Hardcoded AI Model
- [✓] Remove hardcoded 'gpt-4.5-preview'
- [✓] Use user preference from profile
- **Priority**: MEDIUM
- **Files**: client/src/pages/Conversation.tsx:123
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Now uses profile.preferences?.ai_model || DEFAULT_AI_MODEL

### 9. 🔧 Fix Environment Variable Mismatch
- [✓] Keep GOOGLE_AI_API_KEY (it was correct)
- [✓] Verify validateEnv.ts is correct
- [✓] Update .env.example
- **Priority**: MEDIUM
- **Files**: server/src/config/validateEnv.ts
- **Status**: ✅ COMPLETED (2025-06-13)
- **Note**: The variable was already correct as GOOGLE_AI_API_KEY

### 10. 💾 Fix Memory Leak in Conversation Timer
- [✓] Properly cleanup timer on unmount
- [✓] Handle navigation during active session
- **Priority**: MEDIUM
- **Files**: client/src/pages/Conversation.tsx:49-56
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Added cleanup in useEffect return function

### 11. 🏃 Fix Race Condition in Profile Loading
- [✓] Ensure profile loads before render
- [✓] Add proper loading states
- [✓] Fix "Not set" appearing incorrectly
- **Priority**: MEDIUM
- **Files**: client/src/pages/Dashboard.tsx, Profile.tsx
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Added loading checks and fixed double data wrapping

### 12. 📊 Fix intake_completed Type Issue
- [✓] Use 1 instead of true for SQLite
- [✓] Update type definitions
- **Priority**: MEDIUM
- **Files**: server/src/routes/sessions.ts:392
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Changed to use 1 for SQLite boolean storage

### 13. 📄 Update Security Documentation
- [✓] Remove false encryption claims
- [✓] Add accurate security status
- [✓] Document current limitations
- **Priority**: MEDIUM
- **Files**: SECURITY.md
- **Status**: ✅ COMPLETED (2025-06-14)
- **Solution**: Updated all .md files with accurate security status

### 14. 💾 Implement Backup Functionality
- [ ] Implement AUTO_BACKUP feature
- [ ] Add restore capability
- [ ] Document backup process
- **Priority**: MEDIUM
- **Files**: New backup service

### 15. 📤 Add Data Export (GDPR)
- [✓] Export user data as JSON
- [✓] Export therapy sessions
- [✓] Add delete account option
- **Priority**: MEDIUM
- **Files**: server/src/routes/export.ts, client/src/pages/DataExport.tsx
- **Status**: ✅ COMPLETED (2025-06-14)
- **Solution**: Full GDPR compliance with JSON/Text/ZIP export and deletion

## 🟡 MEDIUM Priority Features

### 16. 📈 Implement Streak Calculation
- [✓] Calculate consecutive day usage
- [✓] Store last session date
- [✓] Display accurate streak
- **Priority**: LOW
- **Files**: server/src/routes/profile.ts:51
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Added calculateStreak function using session timestamps

### 17. 🔒 Add Request Size Limits
- [✓] Configure body-parser limits
- [✓] Prevent DoS attacks
- **Priority**: MEDIUM
- **Files**: Server middleware
- **Status**: ✅ COMPLETED (2025-06-13)
- **Solution**: Set 1MB limit on express.json() middleware

### 18. 🏷️ Add API Versioning
- [ ] Prefix routes with /api/v1/
- [ ] Plan versioning strategy
- **Priority**: LOW
- **Files**: All API routes

### 19. 📝 Enable TypeScript Strict Mode
- [ ] Enable strict in tsconfig.json
- [ ] Fix resulting type errors
- **Priority**: LOW
- **Files**: tsconfig.json files

### 20. 🔍 Professional Security Audit
- [ ] Schedule external audit
- [ ] Document findings
- [ ] Implement recommendations
- **Priority**: HIGH (before production)

## 🛠️ Quick Fixes Needed

```typescript
// 1. Fix Google API key
process.env.GOOGLE_AI_API_KEY → process.env.GOOGLE_API_KEY

// 2. Add validation example
const profileSchema = z.object({
  name: z.string().min(1).max(100),
  demographics: z.object({
    age: z.string().optional(),
    gender: z.enum(['male', 'female', 'non-binary', 'other', '']).optional()
  })
});

// 3. Fix logging
logger.info('Profile updated for user:', redactSensitiveData({ name: profile.name }));
```

## 📋 Implementation Order

1. **Week 1**: Critical security fixes (1-7)
2. **Week 2**: High priority bugs (8-15)
3. **Week 3**: Medium priority features (16-19)
4. **Before Production**: Professional security audit (20)

## 🚀 Progress Tracking

- Total Issues: 20
- Completed: 15 ✅
- In Progress: 0
- Remaining: 5

### Completed Items:
1. ✅ Add Development Warning to README.md
2. ✅ Implement Database Encryption (SQLCipher)
4. ✅ Fix SQL Injection Vulnerability
5. ✅ Remove Sensitive Data from Logs
6. ✅ Add Input Validation (Zod schemas)
7. ✅ Add CSRF Protection
8. ✅ Fix Hardcoded AI Model
9. ✅ Fix Environment Variable (was already correct)
10. ✅ Fix Memory Leak in Conversation Timer
11. ✅ Fix Race Condition in Profile Loading
12. ✅ Fix intake_completed Type Issue
13. ✅ Update Security Documentation
15. ✅ Add Data Export (GDPR Compliance)
16. ✅ Implement Streak Calculation
17. ✅ Add Request Size Limits

### Remaining Critical Items:
3. ❌ Add Authentication System
14. ❌ Implement Backup Functionality  
18. ❌ Add API Versioning
19. ❌ Enable TypeScript Strict Mode
20. ❌ Professional Security Audit

---

**Note**: This application is currently in development and should NOT be used for real therapy data until all critical security issues are resolved.