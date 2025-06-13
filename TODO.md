# CounsellorAI - Security & Bug Fix TODO List

Last Updated: 2025-06-13

## 🔴 CRITICAL Security Issues (Fix Immediately)

### 1. ⚠️ Add Development Warning to README.md
- [ ] Add prominent warning: "⚠️ DEVELOPMENT ONLY - DO NOT USE FOR REAL THERAPY DATA"
- [ ] Explain security limitations
- **Priority**: HIGH
- **Files**: README.md

### 2. 🔐 Implement Database Encryption
- [ ] Encrypt all therapy sessions and personal data
- [ ] Use better-sqlite3-multiple-ciphers
- [ ] Implement key management
- **Priority**: CRITICAL
- **Files**: server/src/services/database/sqlite.ts
- **Note**: Currently ALL data is in plaintext!

### 3. 🔑 Add Authentication System
- [ ] Implement JWT or session-based auth
- [ ] Add login/logout functionality
- [ ] Protect all API endpoints
- [ ] Add user management
- **Priority**: CRITICAL
- **Files**: New auth routes, middleware, frontend components

### 4. 💉 Fix SQL Injection Vulnerability
- [ ] Sanitize field names in updateProfile
- [ ] Use parameterized queries only
- **Priority**: CRITICAL
- **Files**: server/src/services/database/sqlite.ts:207
```typescript
// DANGEROUS - Current code:
`UPDATE profiles SET ${field} = ?, updated_at = datetime('now') WHERE id = ?`
```

### 5. 🚫 Remove Sensitive Data from Logs
- [ ] Use redactSensitiveData utility
- [ ] Remove full profile logging
- [ ] Implement log levels
- **Priority**: HIGH
- **Files**: server/src/routes/profile.ts:14,40,58

### 6. ✅ Add Input Validation
- [ ] Implement Zod schemas for all endpoints
- [ ] Validate profile data structure
- [ ] Validate session creation
- [ ] Add request sanitization
- **Priority**: HIGH
- **Files**: server/src/routes/profile.ts, server/src/routes/sessions.ts

### 7. 🛡️ Add CSRF Protection
- [ ] Implement CSRF tokens
- [ ] Add middleware protection
- **Priority**: HIGH
- **Files**: Server middleware configuration

## 🟠 HIGH Priority Bugs

### 8. 🤖 Fix Hardcoded AI Model
- [ ] Remove hardcoded 'gpt-4.5-preview'
- [ ] Use user preference from profile
- **Priority**: MEDIUM
- **Files**: client/src/pages/Conversation.tsx:123

### 9. 🔧 Fix Environment Variable Mismatch
- [ ] Rename GOOGLE_API_KEY to GOOGLE_AI_API_KEY
- [ ] Update validateEnv.ts
- [ ] Update .env.example
- **Priority**: MEDIUM
- **Files**: server/src/config/validateEnv.ts

### 10. 💾 Fix Memory Leak in Conversation Timer
- [ ] Properly cleanup timer on unmount
- [ ] Handle navigation during active session
- **Priority**: MEDIUM
- **Files**: client/src/pages/Conversation.tsx:49-56

### 11. 🏃 Fix Race Condition in Profile Loading
- [ ] Ensure profile loads before render
- [ ] Add proper loading states
- [ ] Fix "Not set" appearing incorrectly
- **Priority**: MEDIUM
- **Files**: client/src/pages/Dashboard.tsx, Profile.tsx

### 12. 📊 Fix intake_completed Type Issue
- [ ] Use 1 instead of true for SQLite
- [ ] Update type definitions
- **Priority**: MEDIUM
- **Files**: server/src/routes/sessions.ts:392

### 13. 📄 Update Security Documentation
- [ ] Remove false encryption claims
- [ ] Add accurate security status
- [ ] Document current limitations
- **Priority**: MEDIUM
- **Files**: SECURITY.md

### 14. 💾 Implement Backup Functionality
- [ ] Implement AUTO_BACKUP feature
- [ ] Add restore capability
- [ ] Document backup process
- **Priority**: MEDIUM
- **Files**: New backup service

### 15. 📤 Add Data Export (GDPR)
- [ ] Export user data as JSON
- [ ] Export therapy sessions
- [ ] Add delete account option
- **Priority**: MEDIUM
- **Files**: New export routes

## 🟡 MEDIUM Priority Features

### 16. 📈 Implement Streak Calculation
- [ ] Calculate consecutive day usage
- [ ] Store last session date
- [ ] Display accurate streak
- **Priority**: LOW
- **Files**: server/src/routes/profile.ts:51

### 17. 🔒 Add Request Size Limits
- [ ] Configure body-parser limits
- [ ] Prevent DoS attacks
- **Priority**: MEDIUM
- **Files**: Server middleware

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
- Completed: 0
- In Progress: 0
- Remaining: 20

---

**Note**: This application is currently in development and should NOT be used for real therapy data until all critical security issues are resolved.