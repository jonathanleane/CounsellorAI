# Implementation Notes and Important Details

## Critical Implementation Details

### API Keys (Currently Hardcoded - MUST CHANGE)
- OpenAI and Anthropic API keys are hardcoded in `fetch-ai.js`
- **SECURITY RISK**: Move to environment variables immediately
- Keys are exposed in the current implementation

### Database Configuration
- System supports both Firebase and SQLite
- Toggle via `USE_FIREBASE` environment variable
- Firebase is currently the primary database

### Session Management

#### New Session Creation Flow
1. User clicks "New Conversation"
2. Frontend shows loading state immediately
3. Backend creates session and generates AI greeting
4. Session appears with greeting message

#### Session Timing Precision
- System tracks exact time since last session
- Displays in format: "X days and Y hours" or "X hours and Y minutes"
- AI acknowledges specific timing in greetings

#### Empty Session Handling
- Sessions with only AI greeting can be deleted
- Warning prompt before deletion
- Automatic cleanup on navigation

### AI Response Generation

#### Model-Specific Implementation
**GPT-4.5**:
- Uses JSON response format for summaries
- Standard REST API calls
- 16K token limit

**Claude 3.7**:
- Uses streaming API
- Thinking mode enabled (16K budget)
- Manual JSON extraction for summaries
- Temperature must be exactly 1.0

#### Prompt Assembly Order
1. Main therapy instructions
2. User profile context
3. Personal details by category
4. Previous session summaries (system message)
5. Conversation messages

### Personal Details Management

#### Data Structure
```javascript
personal_details: {
  personalProfile: {
    name, age, location, values...
  },
  relationships: {
    partner_name, family_info...
  },
  // ... other categories
}
```

#### Deep Merge Behavior
- New data is merged with existing data
- Arrays and objects are deeply merged
- Null/empty values remove fields

### Frontend Routing

#### Protected Routes
- All routes except `/onboarding` require profile
- Automatic redirect for new users
- Profile check on app load

#### Navigation Guards
```javascript
profile ? <Component /> : <Navigate to="/onboarding" />
```

### Error Handling Patterns

#### AI Service Errors
- Fallback to simple responses
- User-friendly error messages
- Automatic retry for transient failures

#### Database Errors
- Graceful degradation
- Local storage fallback (planned)
- Error logging for debugging

### Performance Considerations

#### Message Rendering
- Virtual scrolling for long conversations
- Optimistic UI updates
- Smooth auto-scroll behavior

#### API Call Optimization
- Debounced typing indicators
- Cached session data
- Lazy loading of history

### Special Features

#### Debug Mode
- Shows full system prompt
- Displays message history
- Available in conversation view
- Toggle with button click

#### Thinking Indicators
- Three animated dots
- Shows while AI processes
- Replaced by actual response

### Firebase Specific

#### Collections Structure
```
profiles/
  └── default
conversations/
  └── {id}
      └── messages/
          └── {messageId}
```

#### Security Rules
- Currently permissive (development)
- Need tightening for production
- Consider user authentication

#### Migration Tools
- `migrateToFirebase.js` - SQLite to Firebase
- `verifyFirebaseMigration.js` - Data verification
- `migrateBrainData.js` - Personal details migration

### Known Issues and Workarounds

1. **Claude JSON Parsing**: Manual extraction required
2. **Session Greeting Placeholder**: Hidden message deleted after greeting
3. **Timezone Handling**: Australia/Sydney hardcoded
4. **Single User System**: No multi-tenancy support

### Testing Considerations

#### Manual Test Points
1. Onboarding flow completion
2. Session creation and greeting
3. Message send/receive
4. Session end and summary
5. Brain data editing
6. Profile updates

#### API Testing
- `test-api.html` - Direct API testing
- `test-openai.js` - Backend AI testing

### Deployment Notes

#### Environment Setup
```bash
# Required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=production

# Firebase (if using)
USE_FIREBASE=true
# Firebase config as JSON string
```

#### Build Process
1. Frontend: `npm run build` creates optimized bundle
2. Backend: Direct Node.js execution
3. Static assets served from build folder

#### Monitoring Points
- AI API usage and costs
- Response generation time
- Session duration metrics
- Error rates by type

## Code Smells to Address

1. **Hardcoded API Keys**: Critical security issue
2. **Single Profile System**: Limits scalability
3. **Timezone Hardcoding**: Not user-friendly
4. **No Request Validation**: Security risk
5. **Missing TypeScript**: Type safety needed
6. **Limited Error Recovery**: Needs improvement

## Future Architecture Considerations

1. **Authentication System**: Multi-user support
2. **Queue System**: Async AI processing
3. **Caching Layer**: Response caching
4. **Audit Logging**: Compliance needs
5. **Backup System**: Data redundancy
6. **Rate Limiting**: API protection