# AI Integration and Prompting System

## Current Implementation Status

**Last Updated**: June 2025

This document describes the AI integration as currently implemented in CounsellorAI.

## Supported AI Models

### 1. OpenAI
- **GPT-4o** (`gpt-4o`) - Latest and most capable model
- **GPT-4o mini** (`gpt-4o-mini`) - Faster, cost-effective variant

### 2. Anthropic
- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`) - Most capable Claude model

### 3. Google
- **Gemini 2.0 Flash Experimental** (`gemini-2.0-flash-exp`) - Fastest Gemini model

## AI Service Architecture

### Service Location
`/server/src/services/ai/index.ts`

### Provider Implementations
- `/server/src/services/ai/providers/openai.ts`
- `/server/src/services/ai/providers/anthropic.ts`
- `/server/src/services/ai/providers/gemini.ts`

### Core Interface
```typescript
interface AIService {
  generateResponse(
    messages: Message[],
    userProfile: any,
    model?: string
  ): Promise<AIResponse>
  
  generateSummary(
    messages: Message[],
    sessionData: any,
    model?: string
  ): Promise<SummaryResponse>
}
```

## Therapy Prompt System

### Location
`/server/src/services/ai/prompts/therapyPrompt.ts`

### Core Instructions
The therapy prompt includes:
1. Non-judgmental, supportive approach
2. Evidence-based therapeutic techniques
3. Crisis intervention protocols
4. User preference adaptation
5. Session continuity maintenance

### Dynamic Context Integration
- User demographics and preferences
- Health information and medications
- Therapy goals and boundaries
- Previous session summaries
- Accumulated personal details
- Time since last session

## Personal Detail Tracking

The system organizes information into 8 categories:
1. **Personal Profile** - Basic demographics, values
2. **Relationships** - Family, social connections
3. **Work & Purpose** - Career, aspirations
4. **Health & Wellbeing** - Physical and mental health
5. **Lifestyle & Habits** - Routines, coping strategies
6. **Goals & Plans** - Short and long-term objectives
7. **Patterns & Insights** - Recurring themes
8. **Preferences & Boundaries** - Communication style

## Session Management

### Session Types
1. **Intake Session** - First-time user onboarding
2. **Standard Session** - Regular therapy conversations

### Session Flow
1. **Start**: Greeting based on time elapsed
2. **During**: Active conversation with context
3. **End**: Summary generation and pattern identification

## API Configuration

### OpenAI
```typescript
{
  model: "gpt-4o", // or other available models
  messages: formattedMessages,
  temperature: 0.7,
  max_tokens: 4096
}
```

### Anthropic
```typescript
{
  model: "claude-3-5-sonnet-20241022",
  messages: formattedMessages,
  max_tokens: 4096,
  temperature: 0.7
}
```

### Google Gemini
```typescript
{
  contents: [{
    parts: [{ text: prompt }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096
  }
}
```

## Error Handling

1. **API Key Validation** - Checks for required keys
2. **Rate Limiting** - 100 requests per 15 minutes
3. **Model Fallback** - Switches to available model
4. **Graceful Degradation** - Returns error messages
5. **Logging** - Winston logger for debugging

## Security Considerations

✅ **Security Measures**:
- Prompt injection protection implemented
- Input sanitization with dangerous pattern detection
- Request size limits (1MB) prevent token abuse
- Sensitive data redaction in logs
- Lazy provider initialization reduces attack surface

## Environment Configuration

Required environment variables:
```bash
# At least one AI key required
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key

# Optional configuration
DEFAULT_AI_MODEL=gpt-4o
MAX_TOKENS=16384
AI_TEMPERATURE=0.7
```

## Implementation Notes

### Current Issues
1. Model names in UI don't match API model names
2. No streaming support for real-time responses
3. Token counting not implemented
4. Cost tracking not implemented

### Future Improvements
1. Add streaming responses
2. Implement token counting
3. Add cost estimation
4. Improve prompt injection protection
5. Add conversation compression
6. Implement model-specific optimizations

## Testing

Test files available:
- `/test-ai-direct.js` - Direct AI provider testing
- `/test-models.html` - Browser-based model testing
- Integration tests in `/tests/`

## Usage Example

```javascript
// From conversation endpoint
const response = await aiService.generateResponse(
  messages,
  userProfile,
  selectedModel
);

// Response includes:
// - content: AI's response text
// - usage: Token usage (if available)
// - model: Model used
```