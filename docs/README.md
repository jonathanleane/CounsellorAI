# CounsellorAI Documentation

This documentation provides a comprehensive overview of the CounsellorAI application, its architecture, features, and implementation details.

## ⚠️ CRITICAL SECURITY WARNING

**This application is currently in DEVELOPMENT ONLY status with remaining vulnerabilities:**
- ❌ No authentication system (anyone can access all data)
- ❌ No session management (sessions never expire)
- ❌ No audit logging (no tracking of data access)

**Recently Fixed (2025-06-14):**
- ✅ Database encryption with SQLCipher
- ✅ Data export for GDPR compliance
- ✅ SQL injection protection
- ✅ Sensitive data redaction

**DO NOT USE FOR REAL THERAPY DATA UNTIL ALL SECURITY ISSUES ARE RESOLVED**

## Project Status

CounsellorAI is a development prototype with modern architecture but critical security gaps. The application is designed for both:
- **Online use**: Deploy to cloud services with Firebase support (NOT SECURE)
- **Local use**: Run with SQLite for development only (DATA NOT ENCRYPTED)

Users provide their own API keys for OpenAI, Anthropic, or Google AI services.

## Documentation Structure

1. **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)**
   - System architecture and design patterns
   - Directory structure
   - Technology choices
   - Deployment options

2. **[FEATURES_AND_FUNCTIONALITY.md](./FEATURES_AND_FUNCTIONALITY.md)**
   - Complete feature list
   - User-facing functionality
   - Technical capabilities
   - Implemented enhancements

3. **[TECH_STACK_AND_DEPENDENCIES.md](./TECH_STACK_AND_DEPENDENCIES.md)**
   - Frontend dependencies
   - Backend dependencies
   - Environment variables
   - Version constraints

4. **[DATA_MODELS_AND_API.md](./DATA_MODELS_AND_API.md)**
   - Data model schemas
   - API endpoint documentation
   - Database structure (SQLite & Firebase)
   - Security implementations

5. **[AI_INTEGRATION_AND_PROMPTS.md](./AI_INTEGRATION_AND_PROMPTS.md)**
   - AI service architecture with lazy loading
   - Prompt engineering and safety
   - Model configurations (GPT-4, Claude 3, Gemini)
   - Response generation flow

6. **[UI_UX_PATTERNS.md](./UI_UX_PATTERNS.md)**
   - Design philosophy
   - Component patterns
   - Visual design system
   - Accessibility features

7. **[MIGRATION_AND_REBUILD_GUIDE.md](./MIGRATION_AND_REBUILD_GUIDE.md)**
   - Rebuild process documentation
   - Implementation phases completed
   - Testing strategy
   - Achieved improvements

8. **[IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)**
   - Critical implementation details
   - Resolved issues and remaining work
   - Security implementations
   - Performance optimizations

9. **[LAUNCH_FEATURES_AND_CONSIDERATIONS.md](./LAUNCH_FEATURES_AND_CONSIDERATIONS.md)**
   - Launch checklist
   - Missing features for MVP
   - Roadmap and priorities
   - Community guidelines

## Quick Start for Rebuild

1. Review the architecture overview
2. Set up the project structure per the migration guide
3. Implement backend services following the API documentation
4. Build frontend components using the UI/UX patterns
5. Integrate AI services per the integration guide
6. Test thoroughly using the implementation notes

## Key Improvements Completed

### Security Status ⚠️
1. **API Keys**: ✅ Moved to environment variables
2. **PII Protection**: ❌ NOT IMPLEMENTED - Full profile data logged
3. **Input Sanitization**: ⚠️ Limited - SQL injection risks remain
4. **Rate Limiting**: ✅ Basic rate limiting implemented
5. **Database Encryption**: ❌ NOT IMPLEMENTED
6. **Authentication**: ❌ NOT IMPLEMENTED
7. **CSRF Protection**: ❌ NOT IMPLEMENTED

### Architecture Improvements ✅
1. **TypeScript**: Full type safety throughout
2. **Lazy Loading**: AI providers initialized on demand
3. **Firebase Support**: Complete integration with migration tools
4. **Structured Logging**: Winston with PII filtering

### Critical Security Priorities
1. **Database Encryption**: CRITICAL - All data in plaintext
2. **Authentication System**: CRITICAL - No access control
3. **Fix SQL Injection**: CRITICAL - Dynamic queries vulnerable
4. **Remove Sensitive Logs**: HIGH - PII exposed in logs
5. **Add CSRF Protection**: HIGH - Cross-site vulnerabilities
6. **Input Validation**: HIGH - Missing on many endpoints

### Feature Priorities (AFTER security fixes)
1. **Export Formats**: Add PDF and Markdown
2. **Crisis Management**: Enhanced detection and resources
3. **Search**: Full-text search in conversations
4. **Voice Support**: Speech input/output
5. **Mobile Apps**: Native applications

## Current State

The application has been rebuilt with:
1. ✅ Core backend services with TypeScript
2. ✅ React frontend with Material-UI
3. ✅ Multi-model AI integration (GPT-4, Claude 3, Gemini)
4. ❌ Security features INCOMPLETE (critical vulnerabilities)
5. ⚠️ Firebase and SQLite support (NO ENCRYPTION)
6. ⚠️ Basic testing suite

**NOT READY FOR PRODUCTION USE - Development only until security issues are resolved.**

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/CounsellorAI.git
cd CounsellorAI

# Install dependencies
npm install

# Configure environment
cp server/.env.example server/.env
# Add your API keys to server/.env

# Start development
npm run dev
```

## Contributing

See [SECURITY.md](../SECURITY.md) for security vulnerability reporting. Additional contribution guidelines coming soon.