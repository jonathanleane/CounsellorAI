# Claude Assistant Instructions - CounsellorAI

## Project Overview
This is an AI therapist application being rebuilt from scratch. The original implementation is in `aitherapist-main/` (to be deleted after rebuild). Comprehensive documentation exists in `/docs/`.

## Key Project Context

### Architecture
- **Frontend**: React with TypeScript (planned)
- **Backend**: Express.js with Node.js 18+
- **Database**: Firebase Firestore (primary), SQLite (legacy)
- **AI Models**: OpenAI GPT-4.5 and Anthropic Claude 3.7

### Critical Security Issues
1. **API Keys**: Currently hardcoded in `fetch-ai.js` - MUST use environment variables
2. **No Authentication**: Single-user system - needs multi-user support
3. **Input Validation**: Missing - add comprehensive validation

## When Working on This Project

### Always Check
1. Review `/docs/` for architectural decisions
2. Maintain feature parity with original
3. Follow TypeScript best practices
4. Ensure API keys are NEVER hardcoded
5. Test AI integrations thoroughly

### Common Tasks

#### Adding New Features
1. Check if feature exists in original implementation
2. Review relevant documentation in `/docs/`
3. Follow existing patterns for consistency
4. Update tests and documentation

#### Modifying AI Behavior
1. Review `AI_INTEGRATION_AND_PROMPTS.md`
2. Test with both GPT-4.5 and Claude 3.7
3. Maintain therapeutic best practices
4. Never compromise user safety

#### Database Changes
1. Update both Firebase and model definitions
2. Create migration scripts if needed
3. Test data integrity thoroughly
4. Document schema changes

### Code Style Guidelines
- Use TypeScript for type safety
- Follow React hooks best practices
- Implement proper error boundaries
- Use async/await over promises
- Comment complex AI prompt logic

### Testing Approach
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# AI response testing
npm run test:ai
```

### Performance Considerations
- Implement message pagination for long conversations
- Cache AI responses where appropriate
- Use React.memo for expensive components
- Optimize bundle size with code splitting

## Project-Specific Patterns

### AI Response Generation
```typescript
// Always structure AI calls with proper error handling
try {
  const response = await aiService.generateResponse(messages, profile, model);
  // Handle response
} catch (error) {
  // Fallback to safe response
  return getFallbackResponse();
}
```

### Session Management
- Sessions must track timing precisely
- Empty sessions should be cleanable
- Always generate appropriate greetings
- End sessions gracefully with summaries

### Personal Details Tracking
- 8 categories of information
- Deep merge updates
- Respect user privacy
- Allow transparent editing

## Gotchas and Known Issues

1. **Claude Temperature**: Must be exactly 1.0 for thinking mode
2. **Session Timing**: Uses Australia/Sydney timezone (make configurable)
3. **Firebase Rules**: Currently too permissive
4. **Message Ordering**: Ensure timestamp consistency

## Rebuild Priorities

1. **Phase 1**: Security fixes (API keys, validation)
2. **Phase 2**: TypeScript migration
3. **Phase 3**: Authentication system
4. **Phase 4**: Performance optimization
5. **Phase 5**: Feature enhancements

## Resources

### Original Implementation
- Source code: `/aitherapist-main/`
- API examples: `/aitherapist-main/test-api.html`

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
- For API design: See DATA_MODELS_AND_API.md
- For AI changes: See AI_INTEGRATION_AND_PROMPTS.md
- For UI work: See UI_UX_PATTERNS.md
- For deployment: See ARCHITECTURE_OVERVIEW.md and MIGRATION_AND_REBUILD_GUIDE.md

## Remember

This is a mental health application. User safety and data privacy are paramount. Always:
- Preserve therapeutic best practices
- Maintain crisis intervention protocols
- Protect user data
- Test thoroughly before deployment
- Keep responses supportive and non-judgmental