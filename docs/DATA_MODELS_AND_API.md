# Data Models and API Documentation

## ⚠️ SECURITY WARNING

**Critical Security Issues:**
- ❌ **NO AUTHENTICATION**: No login system or access control
- ❌ **NO DATABASE ENCRYPTION**: All data stored in plaintext SQLite
- ❌ **JSON STRING STORAGE**: Structured data stored as strings (parse errors possible)
- ✅ **Input Validation**: Now using Zod schemas (recently added)
- ✅ **CSRF Protection**: Double-submit cookie pattern implemented

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
- **Security**: ❌ No authentication required
- **Validation**: None

#### POST /api/profile
Create or update user profile
- **Body**: Profile data (all fields)
- **Response**: Saved profile object
- **Security**: ✅ CSRF protection, ❌ No authentication
- **Validation**: ✅ Full Zod schema validation

#### GET /api/profile/brain
Get therapist's brain data (personal_details)
- **Response**: `{ personalDetails: Object }`
- **Security**: ❌ No authentication required
- **Note**: Returns parsed JSON from SQLite string storage

#### POST /api/profile/brain
Update a specific field in therapist's brain
- **Body**: `{ category: String, field: String, value: Any }`
- **Response**: `{ success: true, personalDetails: Object }`
- **Security**: ✅ CSRF protection, ❌ No authentication
- **Validation**: ✅ Zod schema for request body

### Session Endpoints

#### GET /api/sessions
Get all sessions
- **Response**: Array of conversation objects
- **Security**: ❌ No authentication required
- **Note**: Patterns/suggestions parsed from JSON strings

#### GET /api/sessions/recent
Get recent sessions
- **Query**: `limit` (default: 5)
- **Response**: Array of recent conversations
- **Security**: ❌ No authentication required

#### GET /api/sessions/:id
Get a specific session with messages
- **Response**: Conversation object with messages array
- **Security**: ❌ No authentication required
- **Validation**: Basic ID format check

#### POST /api/sessions
Create a new session
- **Body**: `{ session_type: String, initial_mood: Number, model: String }`
- **Response**: New conversation object with initial AI greeting
- **Security**: ✅ CSRF protection, ❌ No authentication
- **Validation**: ✅ Zod schema validation

#### DELETE /api/sessions/:id
Delete a session
- **Response**: `{ message: 'Conversation deleted successfully' }`
- **Security**: ✅ CSRF protection, ❌ No authentication
- **Warning**: No confirmation required

#### POST /api/sessions/:id/messages
Add a message to a session
- **Body**: `{ content: String }`
- **Response**: Updated conversation with AI response
- **Security**: ✅ CSRF protection, ❌ No authentication
- **Validation**: ✅ Zod schema, ✅ 1MB size limit
- **Features**: Automatic learning extraction for intake sessions

#### POST /api/sessions/:id/end
End a session (triggers async summary generation)
- **Body**: `{ duration: Number }`
- **Response**: Success acknowledgment
- **Security**: ✅ CSRF protection, ❌ No authentication
- **Validation**: ✅ Zod schema validation
- **Side Effects**: Triggers AI summary, updates intake_completed

## Database Structure

### SQLite Tables (Primary Storage)

⚠️ **WARNING: NO ENCRYPTION - All data stored in plaintext**

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
1. **API Key Protection**: Stored in environment variables
2. **Input Validation**: Zod schemas on all POST endpoints
3. **CSRF Protection**: Double-submit cookie pattern
4. **Request Size Limits**: 1MB limit to prevent DoS
5. **Field Whitelisting**: SQL injection protection for updateProfile

### ❌ NOT Implemented (CRITICAL)
1. **Authentication**: No login system or access control
2. **Database Encryption**: All data stored in plaintext
3. **Session Management**: No session timeouts
4. **Audit Logging**: No access logs
5. **Data Export**: No GDPR compliance features

### ⚠️ Known Vulnerabilities
1. **JSON String Storage**: Risk of parse errors and injection
2. **No Rate Limiting**: Beyond basic request size
3. **No API Versioning**: Breaking changes affect all clients
4. **Single User Design**: Cannot scale to multi-user