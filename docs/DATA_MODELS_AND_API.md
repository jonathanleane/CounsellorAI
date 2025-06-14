# Data Models and API Documentation

## 🔒 Security Status

**Implemented Security Features:**
- ✅ **Authentication**: JWT-based authentication with bcrypt
- ✅ **Database Encryption**: SQLCipher with AES-256 encryption
- ✅ **Input Validation**: Zod schemas on all endpoints
- ✅ **CSRF Protection**: Double-submit cookie pattern
- ✅ **SQL Injection Protection**: Field whitelisting
- ✅ **Request Size Limits**: 1MB limit prevents DoS
- ✅ **Sensitive Data Redaction**: PII removed from logs
- ✅ **API Versioning**: Future-proof /api/v1 endpoints

**Design Considerations:**
- **JSON String Storage**: Some complex data stored as JSON strings for flexibility
- **Single Profile System**: Designed for personal use

## Data Models

### Profile Model

The user profile stores personal information and preferences:

```typescript
{
  id: 'default',  // Single profile system (NO MULTI-USER SUPPORT)
  name: string,
  demographics: {
    age: string,
    gender: string
  },
  spirituality: {
    beliefs: string,
    importance: string
  },
  therapy_goals: {
    primary_goal: string,
    secondary_goals: string,
    specific_goals?: string[]  // Checkbox selections
  },
  preferences: {
    communication_style: string,
    approach: string,
    ai_model?: string  // User's preferred AI model
  },
  health: {
    physical_conditions: string,
    medications: string,
    health_concerns?: string[]  // Checkbox selections
  },
  mental_health_screening: {
    previous_therapy: string,
    current_challenges: string,
    mental_health_concerns?: string[]  // Checkbox selections
  },
  sensitive_topics: {
    avoid_topics: string
  },
  personal_details: {
    // ⚠️ STORED AS JSON STRING IN SQLITE (NOT QUERYABLE)
    // Dynamically accumulated data organized by category
    personalProfile: Record<string, any>,
    relationships: Record<string, any>,
    workPurpose: Record<string, any>,
    healthWellbeing: Record<string, any>,
    lifestyleHabits: Record<string, any>,
    goalsPlans: Record<string, any>,
    patternsInsights: Record<string, any>,
    preferencesBoundaries: Record<string, any>
  },
  intake_completed: 0 | 1,  // SQLite boolean (0=false, 1=true)
  created_at: string,  // ISO timestamp
  updated_at: string   // ISO timestamp
}
```

### Conversation Model

Represents a therapy session:

```typescript
{
  id: string,  // Timestamp-based ID
  session_type: 'intake' | 'standard',
  status: 'active' | 'completed' | 'ending',
  initial_mood: number | null,  // 1-10, not automatically set
  end_mood: number | null,  // Optional
  timestamp: string,  // ISO timestamp
  duration: number,  // In seconds
  model: 'gpt-4o' | 'claude-3-5-sonnet-20241022' | 'gemini-2.0-flash-exp',  // Updated models
  ai_summary: string | null,
  identified_patterns: string[],  // ⚠️ STORED AS JSON STRING IN SQLITE
  followup_suggestions: string[],  // ⚠️ STORED AS JSON STRING IN SQLITE
  updated_at: string,
  messages: Message[]  // Populated when fetched
}
```

### Message Model

Individual messages within a conversation:

```typescript
{
  id: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  timestamp: string,  // ISO timestamp
  isThinking?: boolean  // UI state only, not persisted
}
```

## API Endpoints

### Profile Endpoints

#### GET /api/profile
Get the current user profile
- **Response**: Profile object or 404
- **Security**: ✅ JWT authentication required
- **Validation**: None needed (read-only)

#### POST /api/profile
Create or update user profile
- **Body**: Profile data (all fields)
- **Response**: Saved profile object
- **Security**: ✅ JWT authentication, ✅ CSRF protection
- **Validation**: ✅ Full Zod schema validation

#### GET /api/profile/brain
Get therapist's brain data (personal_details)
- **Response**: `{ personalDetails: Object }`
- **Security**: ✅ JWT authentication required
- **Note**: Returns parsed JSON from SQLite string storage

#### POST /api/profile/brain
Update a specific field in therapist's brain
- **Body**: `{ category: String, field: String, value: Any }`
- **Response**: `{ success: true, personalDetails: Object }`
- **Security**: ✅ JWT authentication, ✅ CSRF protection
- **Validation**: ✅ Zod schema for request body

### Session Endpoints

#### GET /api/sessions
Get all sessions
- **Response**: Array of conversation objects
- **Security**: ✅ JWT authentication required
- **Note**: Patterns/suggestions parsed from JSON strings

#### GET /api/sessions/recent
Get recent sessions
- **Query**: `limit` (default: 5)
- **Response**: Array of recent conversations
- **Security**: ✅ JWT authentication required

#### GET /api/sessions/:id
Get a specific session with messages
- **Response**: Conversation object with messages array
- **Security**: ✅ JWT authentication required
- **Validation**: Basic ID format check

#### POST /api/sessions
Create a new session
- **Body**: `{ session_type: String, initial_mood: Number, model: String }`
- **Response**: New conversation object with initial AI greeting
- **Security**: ✅ JWT authentication, ✅ CSRF protection
- **Validation**: ✅ Zod schema validation

#### DELETE /api/sessions/:id
Delete a session
- **Response**: `{ message: 'Conversation deleted successfully' }`
- **Security**: ✅ JWT authentication, ✅ CSRF protection
- **Warning**: No confirmation required

#### POST /api/sessions/:id/messages
Add a message to a session
- **Body**: `{ content: String }`
- **Response**: Updated conversation with AI response
- **Security**: ✅ JWT authentication, ✅ CSRF protection
- **Validation**: ✅ Zod schema, ✅ 1MB size limit
- **Features**: Automatic learning extraction for intake sessions

#### POST /api/sessions/:id/end
End a session (triggers async summary generation)
- **Body**: `{ duration: Number }`
- **Response**: Success acknowledgment
- **Security**: ✅ JWT authentication, ✅ CSRF protection
- **Validation**: ✅ Zod schema validation
- **Side Effects**: Triggers AI summary, updates intake_completed

## Database Structure

### SQLite Tables (Primary Storage)

✅ **Database encryption enabled when DATABASE_ENCRYPTION_KEY is set**

```sql
-- profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  demographics TEXT,        -- JSON string
  spirituality TEXT,        -- JSON string
  therapy_goals TEXT,       -- JSON string
  preferences TEXT,         -- JSON string
  health TEXT,             -- JSON string
  mental_health_screening TEXT,  -- JSON string
  sensitive_topics TEXT,    -- JSON string
  personal_details TEXT,    -- JSON string
  intake_completed INTEGER DEFAULT 0,  -- 0 or 1
  created_at TEXT,
  updated_at TEXT
);

-- conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  session_type TEXT,
  status TEXT,
  initial_mood INTEGER,
  end_mood INTEGER,
  timestamp TEXT,
  duration INTEGER,
  model TEXT,
  ai_summary TEXT,
  identified_patterns TEXT,    -- JSON array as string
  followup_suggestions TEXT,   -- JSON array as string
  updated_at TEXT
);

-- messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  role TEXT,
  content TEXT,
  timestamp TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

### Firebase Firestore Collections (Optional)

```
profiles/
  └── default (document)
      └── [profile fields]

conversations/
  └── {conversationId} (document)
      └── [conversation fields]
      └── messages/ (subcollection)
          └── {messageId} (document)
              └── [message fields]
```

### Data Flow

1. **Profile Creation**: Onboarding → POST /api/profile → Profile document
2. **Session Start**: Dashboard → POST /api/sessions → New conversation
3. **Message Flow**: User input → POST /api/sessions/:id/messages → AI response
4. **Session End**: End button → POST /api/sessions/:id/end → Async summary
5. **Brain Update**: Edit field → POST /api/profile/brain → Updated personal_details

## AI Integration Points

### Message Generation
- User message → Extract context → Generate prompt → AI API → Store response

### Personal Detail Extraction
- Intake session → AI analysis → Update profile.personal_details

### Session Summary
- Session end → Compile messages → AI summarization → Update conversation

## Security Status

### ✅ Implemented
1. **Authentication**: JWT-based with bcrypt password hashing
2. **Database Encryption**: SQLCipher with AES-256
3. **API Key Protection**: Stored in environment variables
4. **Input Validation**: Zod schemas on all endpoints
5. **CSRF Protection**: Double-submit cookie pattern
6. **Request Size Limits**: 1MB limit to prevent DoS
7. **SQL Injection Protection**: Field whitelisting and parameterized queries
8. **Data Export**: Full GDPR compliance with export/delete
9. **Backup System**: Automatic encrypted backups
10. **API Versioning**: /api/v1 endpoints

### Future Enhancements
1. **Session Timeouts**: Beyond JWT expiry
2. **Audit Logging**: Detailed access logs
3. **Two-Factor Authentication**: Additional security layer
4. **Password Reset**: Email-based recovery

### Design Considerations
1. **JSON String Storage**: Flexible data structure for evolving schemas
2. **Rate Limiting**: Configurable limits (100 req/15min general, 20 req/15min AI)
3. **API Versioning**: Implemented with /api/v1 prefix
4. **Single User Focus**: Optimized for personal use

### Additional Endpoints

#### Authentication Endpoints
- **POST /api/auth/register**: Create new account
- **POST /api/auth/login**: Login with credentials
- **POST /api/auth/logout**: Logout and invalidate token
- **POST /api/auth/change-password**: Update password

#### Export Endpoints
- **GET /api/export/all**: Export all data (JSON/Text/ZIP)
- **DELETE /api/export/delete-account**: Delete all user data

#### Backup Endpoints  
- **POST /api/backup/create**: Create manual backup
- **GET /api/backup/list**: List available backups