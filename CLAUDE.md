# Claude Assistant Instructions - CounsellorAI

## ⚠️ CRITICAL SECURITY WARNING
**This application is in DEVELOPMENT ONLY status with remaining critical vulnerabilities:**
- ❌ No database encryption (all therapy data stored in plaintext)
- ❌ No authentication system (anyone can access all data)
- ❌ No session management (sessions never expire)
- ❌ No audit logging (no tracking of data access)

**Recently Fixed (2025-06-13):**
- ✅ SQL injection protection (field whitelisting)
- ✅ Sensitive data redaction in logs
- ✅ Input validation on all endpoints (Zod schemas)
- ✅ CSRF protection (double-submit cookie)
- ✅ Request size limits (1MB DoS protection)

**DO NOT USE FOR REAL THERAPY DATA UNTIL REMAINING SECURITY ISSUES ARE RESOLVED**

## Project Overview
This is an AI-powered therapy companion application that has been rebuilt from scratch with modern architecture. The application supports multiple AI models (OpenAI GPT-4, Anthropic Claude 3, Google Gemini) and provides a complete therapy session experience with persistent user profiles, session history, and AI-generated insights.

## 🚨 Current Priority Tasks (See TODO.md for full list)

### Critical Security Fixes Remaining:
1. ✅ **Add development warning to README.md** - COMPLETED
2. **Implement database encryption** (all data currently plaintext!)
3. **Add authentication system** (no login/security exists)
4. ✅ **Fix SQL injection** - COMPLETED with field whitelisting
5. ✅ **Remove sensitive data from logs** - COMPLETED with redaction utility
6. ✅ **Add Zod validation** - COMPLETED on all API endpoints

### Recently Fixed:
- ✅ Hardcoded AI model - now uses user preferences
- ✅ Memory leak in conversation timer - cleanup on unmount
- ✅ CSRF protection - double-submit cookie pattern
- ✅ Request size limits - 1MB to prevent DoS
- ✅ Streak calculation - working correctly
- ✅ Profile data display - fixed double wrapping
- ✅ AI model dropdown - loads available models

## Key Project Context

### Current Architecture
- **Frontend**: React 18 with TypeScript, Material-UI 5, Vite
- **Backend**: Express.js with TypeScript on Node.js 18+
- **Database**: SQLite (local storage), Firebase support completed
- **AI Models**: OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini 2.0 Flash
- **State Management**: Zustand (client), React Query (server state)
- **Security**: PII redaction in logs, prompt injection protection, input sanitization

### Security Implementation
1. **API Keys**: ✅ Properly managed via environment variables in `.env`
2. **Authentication**: ❌ NO AUTH SYSTEM - critical vulnerability
3. **Input Validation**: ✅ Implemented with Zod schemas on all endpoints
4. **Rate Limiting**: ✅ Request size limits (1MB) to prevent DoS
5. **PII Protection**: ✅ Automatic redaction of sensitive data in logs
6. **Prompt Injection Protection**: ✅ Input sanitization and dangerous pattern detection
7. **Lazy AI Provider Loading**: ✅ Providers only initialized when needed
8. **CSRF Protection**: ✅ Double-submit cookie pattern implemented
9. **SQL Injection**: ✅ Field whitelisting prevents injection attacks
10. **Database Encryption**: ❌ NO ENCRYPTION - all data in plaintext

## When Working on This Project

### Project Structure
```
CounsellorAI/
├── client/          # React frontend with Vite
│   ├── src/
│   │   ├── pages/   # Page components (Dashboard, Conversation, etc.)
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API client and services
│   │   └── stores/      # Zustand state management
├── server/          # Express.js backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic (AI, database)
│   │   └── utils/       # Helper functions
├── shared/          # Shared TypeScript types
├── docs/           # Comprehensive documentation
└── database/       # SQLite database (auto-created)
```

### Common Tasks

#### Adding New Features
1. Review relevant documentation in `/docs/`
2. Check existing implementations for patterns
3. Use TypeScript interfaces in `/shared/types/`
4. Update both frontend and backend as needed
5. Add tests using the test scripts

#### Modifying AI Behavior
1. Edit `/server/src/services/ai/therapyPrompt.ts` for prompt changes
2. Test with all three AI models (GPT-4.5, Claude 4, Gemini 2.5)
3. Use `/server/src/services/ai/index.ts` for model abstraction
4. Always maintain therapeutic best practices

#### Database Changes
1. Update SQLite schema in `/server/src/services/database/sqlite.ts`
2. Delete `database/counsellor.db` to recreate with new schema
3. Test data migration if preserving existing data
4. Update TypeScript interfaces accordingly

### Code Style Guidelines
- TypeScript strict mode enabled
- React functional components with hooks
- Material-UI for consistent UI components
- Async/await for all asynchronous operations
- Comprehensive error handling with try/catch
- No comments in code (per user preference)

### Testing Approach
```bash
# Test all API endpoints
node test-full-api.js

# Test complete application flow
node test-app-flow.js

# Test AI service directly
node test-ai-direct.js

# Test lazy loading of AI providers
node test-lazy-loading.js

# Quick setup for testing
node quick-setup.js

# Manual API testing
curl http://localhost:3001/api/health
```

### Performance Considerations
- Vite provides fast HMR and optimized builds
- React Query handles caching automatically
- SQLite for fast local data access
- Rate limiting prevents API abuse (100 req/15min)
- Lazy loading for routes with React.lazy

## Project-Specific Patterns

### AI Response Generation
```typescript
// Multi-model AI service with automatic fallback
const response = await aiService.generateResponse(
  messages,        // Conversation history
  userProfile,     // User context
  model           // 'gpt-4.5-preview' | 'claude-4-opus' | 'gemini-2.5-pro'
);
```

### Session Management
- Automatic greeting generation based on last session time
- Real-time session timer in UI
- Automatic summary generation on session end
- Session export in JSON format
- Mood tracking (1-10 scale)

### Profile Management
- Multi-step onboarding flow
- Therapist brain stores insights transparently
- Profile data structured in categories:
  - Demographics, therapy goals, preferences
  - Health info, mental health screening
  - Sensitive topics to avoid

## Recent Updates

### Automatic Learning System (NEW)
- **Feature**: AI automatically learns and remembers information from conversations
- **Implementation**:
  - Extracts personal details at session end when ENABLE_AUTO_LEARNING=true
  - Intelligently merges new information with existing knowledge
  - Tracks changes and shows users what was learned
  - Privacy-focused with sensitive data sanitization
- **Files Modified**:
  - `/server/src/routes/sessions.ts` - Added learning trigger in session summary
  - `/server/src/utils/personalDetailsMerger.ts` - New intelligent merging logic
  - `/server/src/services/database/sqlite.ts` - Added learning storage columns
  - `/client/src/pages/History.tsx` - Shows learned information
  - `/client/src/pages/Conversation.tsx` - Learning notification on session end
- **Configuration**: Set ENABLE_AUTO_LEARNING=true in .env to enable

### Updated AI Models (NEW)
- **Default Model**: GPT-4o (OpenAI's latest)
- **Claude**: Claude 3.5 Sonnet (Anthropic's most capable)
- **Gemini**: Gemini 2.0 Flash Experimental (Google's fastest)
- **Model Selection**: Users can change preferred model in preferences
- **Automatic Fallback**: Falls back to GPT-4o if other models fail

### Other Recent Updates
- Firebase configuration check
- Lazy provider initialization to prevent server crashes
- GitHub Actions for CI/CD
- Fixed timestamp format issues
- PII redaction in logs
- Prompt injection protection

## Current Issues and Solutions

1. **Timestamp Display**: Fixed by using ISO format in SQLite
2. **Node.js v24**: Use compiled JS instead of tsx for compatibility
3. **Profile Navigation**: Force page reload after creation
4. **CORS**: Handled by Vite proxy configuration
5. **Database Path**: Auto-created in project root
6. **Security**: Implemented PII redaction and prompt injection protection
7. **Performance**: Lazy loading of AI providers reduces startup time

## Known Limitations

1. **Single User**: Designed for local/personal use (no multi-user support)
2. **No Database Encryption**: ⚠️ CRITICAL - All data stored in plaintext SQLite
3. **No Authentication**: ⚠️ CRITICAL - Anyone with access can read all data
4. **No Offline AI**: Requires internet for AI responses
5. **Limited Export**: Currently only JSON format (PDF/Markdown planned)
6. **No Voice Support**: Text-only interface
7. **Limited Crisis Detection**: Basic keyword matching only
8. **No Session Timeouts**: Sessions never expire automatically

## Completed Features ✓

1. ✓ **Security (Partial)**: API keys in env vars, input validation (Zod), CSRF protection, PII redaction, SQL injection protection
2. ✓ **TypeScript**: Full TypeScript implementation with strict typing
3. ✓ **Core Features**: Profile, sessions, AI chat, history, automatic learning
4. ✓ **UI/UX**: Responsive Material-UI design with improved onboarding
5. ✓ **Multi-Model AI**: GPT-4o, Claude 3.5, Gemini 2.0 support with lazy loading
6. ✓ **Firebase Support**: Full Firebase integration with migration tools
7. ✓ **Logging**: Winston logger with automatic PII redaction
8. ✓ **Session Management**: Auto-greeting, timing precision, summaries
9. ✓ **Automatic Learning**: AI learns from conversations and updates knowledge base

## Next Priorities

1. **Database Encryption**: Encrypt SQLite at rest
2. **Export Formats**: Add PDF and Markdown export
3. **Crisis Resources**: Enhanced detection and emergency protocol system
4. **Progress Charts**: Data visualization for mood and therapy progress
5. **Search Functionality**: Search through conversation history
6. **Session Templates**: CBT exercises and guided therapy tools
7. **Cost Management**: Token usage tracking and cost estimation

## Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp server/.env.example server/.env
# Add your API keys to server/.env

# Start development
npm run dev

# Access the app
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Documentation Files
All documentation is in `/docs/`:

1. **[ARCHITECTURE_OVERVIEW.md](./docs/ARCHITECTURE_OVERVIEW.md)** - System design, tech stack, deployment options
2. **[FEATURES_AND_FUNCTIONALITY.md](./docs/FEATURES_AND_FUNCTIONALITY.md)** - Complete feature list and capabilities
3. **[TECH_STACK_AND_DEPENDENCIES.md](./docs/TECH_STACK_AND_DEPENDENCIES.md)** - All dependencies with versions
4. **[DATA_MODELS_AND_API.md](./docs/DATA_MODELS_AND_API.md)** - Database schemas and API endpoints
5. **[AI_INTEGRATION_AND_PROMPTS.md](./docs/AI_INTEGRATION_AND_PROMPTS.md)** - AI service details, prompting, and model configurations
6. **[UI_UX_PATTERNS.md](./docs/UI_UX_PATTERNS.md)** - Design system and component patterns
7. **[MIGRATION_AND_REBUILD_GUIDE.md](./docs/MIGRATION_AND_REBUILD_GUIDE.md)** - Step-by-step rebuild process
8. **[IMPLEMENTATION_NOTES.md](./docs/IMPLEMENTATION_NOTES.md)** - Critical details, known issues, and workarounds
9. **[LAUNCH_FEATURES_AND_CONSIDERATIONS.md](./docs/LAUNCH_FEATURES_AND_CONSIDERATIONS.md)** - Launch checklist, missing features, and roadmap

**[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting (root directory)

### Quick Reference
- **API Endpoints**: `/server/src/routes/` (profile, sessions)
- **AI Integration**: `/server/src/services/ai/`
- **UI Components**: `/client/src/pages/` and `/client/src/components/`
- **Database Schema**: `/server/src/services/database/sqlite.ts`
- **Environment Config**: `/server/.env.example`

## Important Reminders

This is a mental health support application. Always:
- Maintain therapeutic best practices in AI prompts
- Include crisis resources and disclaimers
- Protect user data with local-first approach
- Test AI responses across all models
- Keep interactions supportive and non-judgmental
- Never replace professional mental health care

## Environment Variables

Required in `server/.env`:
```
# AI API Keys (at least one required)
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GOOGLE_API_KEY=your-key

# Optional
DEFAULT_AI_MODEL=gpt-4.5-preview
DEFAULT_TIMEZONE=UTC
PORT=3001
```