# Data Models and API Documentation

## Data Models

### Profile Model

The user profile stores personal information and preferences:

```javascript
{
  id: 'default',  // Single profile system
  name: String,
  demographics: {
    age: String,
    gender: String
  },
  spirituality: {
    beliefs: String,
    importance: String
  },
  therapy_goals: {
    primary_goal: String,
    secondary_goals: String
  },
  preferences: {
    communication_style: String,
    approach: String
  },
  health: {
    physical_conditions: String,
    medications: String
  },
  mental_health_screening: {
    previous_therapy: String,
    current_challenges: String
  },
  sensitive_topics: {
    avoid_topics: String
  },
  personal_details: {
    // Dynamically accumulated data organized by category
    personalProfile: {},
    relationships: {},
    workPurpose: {},
    healthWellbeing: {},
    lifestyleHabits: {},
    goalsPlans: {},
    patternsInsights: {},
    preferencesBoundaries: {}
  },
  intake_completed: Boolean,
  created_at: ISOString,
  updated_at: ISOString
}
```

### Conversation Model

Represents a therapy session:

```javascript
{
  id: String,  // Timestamp-based ID
  session_type: 'intake' | 'standard',
  status: 'active' | 'completed' | 'ending',
  initial_mood: Number (1-10),
  end_mood: Number (1-10),  // Optional
  timestamp: ISOString,
  duration: Number,  // In seconds
  model: 'gpt-4.5-preview' | 'claude-3-7-sonnet-20250219',
  ai_summary: String,
  identified_patterns: Array<String>,
  followup_suggestions: Array<String>,
  updated_at: ISOString,
  messages: Array<Message>  // Populated when fetched
}
```

### Message Model

Individual messages within a conversation:

```javascript
{
  id: String,
  role: 'user' | 'assistant' | 'system',
  content: String,
  timestamp: ISOString,
  isThinking: Boolean  // UI state only
}
```

## API Endpoints

### Profile Endpoints

#### GET /api/profile
Get the current user profile
- **Response**: Profile object or 404

#### POST /api/profile
Create or update user profile
- **Body**: Profile data (all fields)
- **Response**: Saved profile object

#### GET /api/profile/brain
Get therapist's brain data (personal_details)
- **Response**: `{ personalDetails: Object }`

#### POST /api/profile/brain
Update a specific field in therapist's brain
- **Body**: `{ category: String, field: String, value: Any }`
- **Response**: `{ success: true, personalDetails: Object }`

### Session Endpoints

#### GET /api/sessions
Get all sessions
- **Response**: Array of conversation objects

#### GET /api/sessions/recent
Get recent sessions
- **Query**: `limit` (default: 5)
- **Response**: Array of recent conversations

#### GET /api/sessions/:id
Get a specific session with messages
- **Response**: Conversation object with messages array

#### POST /api/sessions
Create a new session
- **Body**: `{ session_type: String, initial_mood: Number, model: String }`
- **Response**: New conversation object with initial AI greeting

#### DELETE /api/sessions/:id
Delete a session
- **Response**: `{ message: 'Conversation deleted successfully' }`

#### POST /api/sessions/:id/messages
Add a message to a session
- **Body**: `{ content: String }`
- **Response**: Updated conversation with AI response

#### POST /api/sessions/:id/end
End a session (triggers async summary generation)
- **Body**: `{ duration: Number }`
- **Response**: Success acknowledgment

## Database Structure

### Firebase Firestore Collections

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

## Security Considerations

1. **Single User System**: No authentication required (local use)
2. **API Key Protection**: Stored in environment variables
3. **Input Validation**: Required fields checked
4. **Firebase Rules**: Configured for appropriate access
5. **CORS**: Restricted to specific origins