# Claude Assistant Instructions - CounsellorAI

## ⚠️ CRITICAL SECURITY WARNING
**This application is in DEVELOPMENT ONLY status. It has critical security vulnerabilities:**
- ❌ No database encryption (all therapy data stored in plaintext)
- ❌ No authentication system (anyone can access all data)
- ❌ SQL injection vulnerabilities
- ❌ Sensitive data exposed in logs
- ❌ No input validation on critical endpoints

**DO NOT USE FOR REAL THERAPY DATA UNTIL SECURITY ISSUES ARE RESOLVED**

## Project Overview
This is an AI-powered therapy companion application that has been rebuilt from scratch with modern architecture. The application supports multiple AI models (OpenAI GPT-4, Anthropic Claude 3, Google Gemini) and provides a complete therapy session experience with persistent user profiles, session history, and AI-generated insights.

## 🚨 Current Priority Tasks (See TODO.md for full list)

### Critical Security Fixes (Work on these FIRST):
1. **Add development warning to README.md**
2. **Implement database encryption** (all data currently plaintext!)
3. **Add authentication system** (no login/security exists)
4. **Fix SQL injection** in sqlite.ts:207
5. **Remove sensitive data from logs** (use redactSensitiveData)
6. **Add Zod validation** to all API endpoints

### High Priority Bugs:
- ~~Hardcoded AI model ignoring user preferences~~ ✓ Fixed
- Memory leak in conversation timer
- ~~Environment variable mismatch~~ ✓ Already correct (GOOGLE_AI_API_KEY)
- Race conditions in profile loading

## Key Project Context

### Current Architecture
- **Frontend**: React 18 with TypeScript, Material-UI 5, Vite
- **Backend**: Express.js with TypeScript on Node.js 18+
- **Database**: SQLite (local storage), Firebase support completed
- **AI Models**: OpenAI GPT-4.5, Anthropic Claude 4, Google Gemini 2.5
- **State Management**: Zustand (client), React Query (server state)
- **Security**: PII redaction in logs, prompt injection protection, input sanitization

### Security Implementation
1. **API Keys**: Properly managed via environment variables in `.env`
2. **Authentication**: Local-first design (no auth needed for personal use)
3. **Input Validation**: Implemented with Joi/Zod schemas
4. **Rate Limiting**: API endpoints protected with express-rate-limit
5. **PII Protection**: Automatic redaction of sensitive data in logs
6. **Prompt Injection Protection**: Input sanitization and dangerous pattern detection
7. **Lazy AI Provider Loading**: Providers only initialized when needed, improving security and performance

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
- **Default Model**: Now uses GPT-4.5 Preview (from GPT-4 Turbo)
- **Claude 4**: Updated to Claude 4 Opus/Sonnet (latest Anthropic models)
- **Gemini 2.5**: Updated to Gemini 2.5 Pro/Flash (latest Google models)
- **Model Enums**: Added new models, reordered to show latest first
- **Automatic Fallback**: Falls back to GPT-4.5 Preview if other models fail

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

1. **Single User**: Designed for local/personal use
2. **No Database Encryption**: Data stored in plain SQLite (encryption planned)
3. **No Offline AI**: Requires internet for AI responses
4. **Limited Export**: Currently only JSON format
5. **No Voice Support**: Text-only interface
6. **Limited Crisis Detection**: Basic keyword matching only

## Completed Features ✓

1. ✓ **Security**: API keys in env vars, input validation, rate limiting, PII redaction, prompt injection protection
2. ✓ **TypeScript**: Full TypeScript implementation
3. ✓ **Core Features**: Profile, sessions, AI chat, history
4. ✓ **UI/UX**: Responsive Material-UI design
5. ✓ **Multi-Model AI**: GPT-4.5, Claude 4, Gemini 2.5 support with lazy loading
6. ✓ **Firebase Support**: Full Firebase integration with migration tools
7. ✓ **Logging**: Winston logger with automatic PII redaction
8. ✓ **Session Management**: Auto-greeting, timing precision, summaries

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