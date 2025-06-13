# Claude Assistant Instructions - CounsellorAI

## Project Overview
This is an AI-powered therapy companion application that has been rebuilt from scratch with modern architecture. The application supports multiple AI models (OpenAI GPT-4, Anthropic Claude 3, Google Gemini) and provides a complete therapy session experience with persistent user profiles, session history, and AI-generated insights.

## Key Project Context

### Current Architecture
- **Frontend**: React 18 with TypeScript, Material-UI 5, Vite
- **Backend**: Express.js with TypeScript on Node.js 18+
- **Database**: SQLite (local storage), Firebase support planned
- **AI Models**: OpenAI GPT-4, Anthropic Claude 3, Google Gemini 1.5
- **State Management**: Zustand (client), React Query (server state)

### Security Implementation
1. **API Keys**: Properly managed via environment variables in `.env`
2. **Authentication**: Local-first design (no auth needed for personal use)
3. **Input Validation**: Implemented with Joi/Zod schemas
4. **Rate Limiting**: API endpoints protected with express-rate-limit

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
2. Test with all three AI models (GPT-4, Claude 3, Gemini)
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
  model           // 'gpt-4-turbo-preview' | 'claude-3-sonnet-20240229' | 'gemini-1.5-flash'
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

## Current Issues and Solutions

1. **Timestamp Display**: Fixed by using ISO format in SQLite
2. **Node.js v24**: Use compiled JS instead of tsx for compatibility
3. **Profile Navigation**: Force page reload after creation
4. **CORS**: Handled by Vite proxy configuration
5. **Database Path**: Auto-created in project root

## Known Limitations

1. **Single User**: Designed for local/personal use
2. **No Encryption**: Data stored in plain SQLite
3. **No Offline AI**: Requires internet for AI responses
4. **Limited Export**: Currently only JSON format

## Completed Features ✓

1. ✓ **Security**: API keys in env vars, input validation, rate limiting
2. ✓ **TypeScript**: Full TypeScript implementation
3. ✓ **Core Features**: Profile, sessions, AI chat, history
4. ✓ **UI/UX**: Responsive Material-UI design
5. ✓ **Multi-Model AI**: GPT-4, Claude 3, Gemini support

## Next Priorities

1. **Firebase Integration**: Cloud sync option
2. **Data Encryption**: Secure local storage
3. **Export Formats**: Add PDF and Markdown
4. **Crisis Resources**: Emergency protocol system
5. **Progress Charts**: Data visualization

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
5. **[AI_INTEGRATION_AND_PROMPTS.md](./docs/AI_INTEGRATION_AND_PROMPTS.md)** - AI service details and prompting
6. **[UI_UX_PATTERNS.md](./docs/UI_UX_PATTERNS.md)** - Design system and component patterns
7. **[MIGRATION_AND_REBUILD_GUIDE.md](./docs/MIGRATION_AND_REBUILD_GUIDE.md)** - Step-by-step rebuild process
8. **[IMPLEMENTATION_NOTES.md](./docs/IMPLEMENTATION_NOTES.md)** - Critical details and known issues
9. **[LAUNCH_FEATURES_AND_CONSIDERATIONS.md](./docs/LAUNCH_FEATURES_AND_CONSIDERATIONS.md)** - Launch features, checklist, and missing items

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
DEFAULT_AI_MODEL=gpt-4-turbo-preview
DEFAULT_TIMEZONE=UTC
PORT=3001
```