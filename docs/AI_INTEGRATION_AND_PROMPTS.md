# AI Integration and Prompting System

## AI Service Architecture

### Supported Models

1. **OpenAI GPT-4.5-preview** (Current Default)
   - Primary therapy model
   - JSON response format support
   - 16,384 max tokens

2. **OpenAI o3** (Planned)
   - Advanced reasoning capabilities
   - Enhanced safety features
   - Structured output support

3. **Anthropic Claude 3.7 Sonnet** (Current)
   - Alternative model option
   - Streaming responses
   - Thinking mode support (16,000 budget tokens)
   - 32,000 max output tokens

4. **Anthropic Claude 4 Opus** (Planned)
   - Enhanced thinking mode
   - Superior context understanding
   - Advanced safety alignment

5. **Google Gemini** (Planned)
   - Multi-modal capabilities
   - Cost-effective option
   - Long context window

### AI Service (`fetch-ai.js`)

The AI service provides three main functions:

1. **generateResponse**: Main conversation responses
2. **extractPersonalDetails**: Intake session analysis
3. **generateSummary**: Session summarization

## Core Therapy Prompt

The system uses a comprehensive prompt that defines the AI therapist's behavior:

### Key Instructions:
1. Provide a non-judgmental, supportive space
2. Leave ample space for user expression
3. Periodically check understanding
4. Avoid physical descriptions or third-person language
5. Analyze patterns in moods, mindsets, and behaviors
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

### OpenAI Implementation
```javascript
{
  model: 'gpt-4.5-preview',
  messages: apiMessages,
  temperature: 0.7,
  max_tokens: 16384,
  response_format: { type: "json_object" }  // For summaries
}
```

### Claude Implementation
```javascript
{
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 32000,
  temperature: 1.0,  // Required for thinking mode
  messages: formattedMessages,
  thinking: {
    type: "enabled",
    budget_tokens: 16000
  },
  betas: ["output-128k-2025-02-19"]
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

## Future Enhancements

1. **Voice Integration**: Speech-to-text and text-to-speech
2. **Multi-modal Input**: Image and document analysis
3. **Advanced Memory**: Vector database for better recall
4. **Personalized Models**: Fine-tuning on user patterns
5. **Therapeutic Protocols**: Structured intervention programs