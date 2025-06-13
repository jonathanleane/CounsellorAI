# AI Integration and Prompting System

> **Note**: This document reflects the current implementation as of June 2025. For the most up-to-date information, see the actual implementation in `/server/src/services/ai/`.

## AI Service Architecture

### Supported Models (Implemented)

1. **OpenAI GPT-4** (`gpt-4-turbo-preview`)
   - Primary therapy model
   - Default model for new sessions
   - 128,000 token context window
   - JSON response format support

2. **Anthropic Claude 3 Sonnet** (`claude-3-sonnet-20240229`)
   - Alternative therapy model
   - 200,000 token context window
   - Lower cost than GPT-4
   - Good balance of capability and speed

3. **Google Gemini 1.5 Flash** (`gemini-1.5-flash`)
   - Cost-effective option
   - 1 million token context window
   - Fast response times
   - Good for longer conversations

### AI Service Implementation

Location: `/server/src/services/ai/index.ts`

The AI service provides a unified interface for all models:

```typescript
class AIService {
  async generateResponse(messages, userProfile, model?: AIModel): Promise<AIResponse>
  async generateSummary(messages, sessionData, model?: AIModel): Promise<SummaryResponse>
  async generateTherapistGreeting(context, userProfile, model?: AIModel): Promise<string>
}
```

Key features:
- Automatic model fallback on errors
- Cost estimation for each response
- Token usage tracking
- Consistent error handling

## Core Therapy Prompt

Location: `/server/src/services/ai/therapyPrompt.ts`

The therapy prompt is carefully crafted to ensure therapeutic best practices:

### Key Instructions:
1. Provide a non-judgmental, supportive space
2. Leave ample space for user expression
3. Periodically check understanding
4. Avoid physical descriptions or third-person language
5. Analyze patterns in moods, mindsets, and behaviors
6. Adapt communication style to user preferences
7. Remember previous sessions for continuity
8. Generate appropriate greetings based on time since last session
6. Offer evidence-based techniques (CBT, mindfulness)
7. Handle crisis situations appropriately
8. Respect user autonomy while challenging maladaptive patterns
9. Maintain warm, empathetic tone
10. Keep responses concise but insightful

### Context Integration

The prompt dynamically includes:
- User name and demographics
- Therapy goals and preferences
- Health information
- Previous session summaries
- Personal details from all conversations
- Time since last session

## Prompt Structure

```
[Main Therapy Instructions]
    ↓
[User Profile Context]
    ↓
[Personal Details by Category]
    ↓
[Previous Session Summaries]
    ↓
[Timing Instructions]
    ↓
[User Messages]
```

## Personal Detail Categories

The AI tracks information in 8 structured categories:

1. **Personal Profile**: Name, age, location, values
2. **Relationships**: Partner, family, social connections
3. **Work & Purpose**: Career, aspirations, skills
4. **Health & Wellbeing**: Physical/mental health, medications
5. **Lifestyle & Habits**: Routines, hobbies, stress management
6. **Goals & Plans**: Short/long-term goals, milestones
7. **Patterns & Insights**: Recurring themes, triggers
8. **Preferences & Boundaries**: Communication style, sensitive topics

## Session Flow Integration

### New Session Start
1. Calculate time since last session
2. Generate appropriate greeting
3. Reference previous conversation timing
4. Invite user to share current state

### During Conversation
1. Maintain context from profile
2. Reference accumulated personal details
3. Apply therapeutic techniques
4. Track new information for extraction

### Session End
1. Generate summary (2-3 sentences)
2. Identify 3 key patterns
3. Suggest 2-3 follow-up topics
4. Extract new personal details

## AI Response Generation

### Model Configurations

#### OpenAI GPT-4
```typescript
{
  model: 'gpt-4-turbo-preview',
  messages: apiMessages,
  temperature: 0.7,
  max_tokens: 4096,
  response_format: { type: "json_object" }  // For structured responses
}
```

#### Anthropic Claude 3
```typescript
{
  model: 'claude-3-sonnet-20240229',
  messages: formattedMessages,
  max_tokens: 4096,
  temperature: 0.7
}
```

#### Google Gemini
```typescript
{
  model: 'gemini-1.5-flash',
  contents: [{
    parts: [{ text: prompt }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096
  }
}
```

## Special Message Handling

### Session Start Marker
`[NEW_SESSION_START]` - Hidden message that triggers greeting

### Intake Session
Fixed welcome message for first-time users focusing on gathering context

### Crisis Detection
System monitors for self-harm indicators and provides appropriate resources

## Error Handling

1. **API Failures**: Fallback to simple responses
2. **Parsing Errors**: Safe JSON parsing with defaults
3. **Timeout Handling**: Graceful degradation
4. **Model Switching**: Automatic fallback to available model

## Implementation Guide

### Adding a New AI Model

1. **Update Types** (`/server/src/services/ai/types.ts`):
   ```typescript
   export type AIModel = 'gpt-4-turbo-preview' | 'claude-3-sonnet-20240229' | 'gemini-1.5-flash' | 'your-new-model';
   ```

2. **Add Provider Class** (`/server/src/services/ai/providers/`):
   - Implement the `AIProvider` interface
   - Handle authentication and API calls
   - Map responses to standard format

3. **Update AI Service** (`/server/src/services/ai/index.ts`):
   - Add model to the switch statement
   - Configure cost estimation

### Modifying Therapy Behavior

1. **Edit System Prompt** (`/server/src/services/ai/therapyPrompt.ts`):
   - Adjust therapeutic approach
   - Modify response style
   - Add new guidelines

2. **Update Greeting Logic** (`/server/src/services/ai/index.ts`):
   - Modify `generateTherapistGreeting` method
   - Adjust time-based greetings

3. **Enhance Summary Generation**:
   - Edit summary prompt structure
   - Add new pattern detection

## Testing AI Changes

```bash
# Test specific model
node test-full-api.js

# Test conversation flow
node test-app-flow.js

# Manual testing with curl
curl -X POST http://localhost:3001/api/test/ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "model": "gpt-4-turbo-preview"}'
```

## Future Enhancements

1. **Voice Integration**: Speech-to-text and text-to-speech
2. **Multi-modal Input**: Image and document analysis
3. **Advanced Memory**: Vector database for better recall
4. **Personalized Models**: Fine-tuning on user patterns
5. **Therapeutic Protocols**: Structured intervention programs
6. **Group Therapy Mode**: Multi-user sessions
7. **Therapist Supervision**: Human-in-the-loop option