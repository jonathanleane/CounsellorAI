# Token Truncation Guide

## Overview

CounsellorAI implements smart conversation truncation to handle AI model token limits gracefully. This ensures that long therapy sessions don't fail when they exceed the model's context window.

## How It Works

### Token Limits by Model

The system has predefined token limits for each AI model:

- **GPT-4**: 8,000 tokens
- **GPT-4.5 Preview**: 12,000 tokens
- **GPT-4 Turbo**: 12,000 tokens
- **Claude 3/4 Models**: 16,000 tokens
- **Gemini 2.5 Pro/Flash**: 20,000 tokens
- **Gemini Pro**: 15,000 tokens

These limits are conservative to leave room for:
- System prompts (~2,000 tokens)
- User profile data (variable)
- AI response generation (~2,000 tokens)

### Token Estimation

The system uses a simple but effective estimation:
- **1 token ≈ 4 characters**
- Each message includes overhead for role and formatting (~7 tokens)

### Truncation Strategy

When a conversation exceeds the token limit, the system:

1. **Always Preserves**:
   - System prompts (therapy instructions)
   - First assistant greeting
   - Most recent user message
   - Recent conversation context (last ~10 messages)

2. **Smart Selection**:
   - Keeps messages from the end of conversation
   - Prioritizes maintaining conversation flow
   - Includes a truncation notice when messages are removed

3. **Fallback Levels**:
   - Level 1: Keep all important messages + recent context
   - Level 2: Add truncation notice + reduce recent context
   - Level 3: Keep only critical messages (system + last exchange)

## Implementation Details

### Code Location

The truncation logic is in `/server/src/utils/messageTruncation.ts`

### Key Functions

```typescript
// Estimate tokens for a single text
estimateTokenCount(text: string): number

// Estimate tokens for array of messages  
estimateMessagesTokenCount(messages: Message[]): number

// Truncate messages to fit model limits
truncateMessages(
  messages: Message[],
  model: AIModel,
  userProfile?: any
): Message[]
```

### Usage in Routes

The truncation is automatically applied in `/server/src/routes/sessions.ts`:

1. When generating AI responses to user messages
2. When creating session greetings
3. When generating session summaries
4. When extracting personal details

## Example

For a conversation with 100 messages (~9,000 tokens) on GPT-4 (8,000 limit):

**Before truncation**:
- 100 messages
- ~9,000 tokens

**After truncation**:
- 45 messages preserved
- ~4,000 tokens (well within limit)
- Keeps: System prompt, first greeting, last 10 exchanges

## Benefits

1. **Reliability**: Long sessions never fail due to token limits
2. **Context Preservation**: Important context is always maintained
3. **Transparency**: System logs when truncation occurs
4. **Model-Aware**: Different limits for different models
5. **Future-Proof**: Easy to update limits as models evolve

## Monitoring

The system logs truncation events:
```
info: Truncating conversation: 9309 tokens exceeds limit of 4000 for model gpt-4
info: Conversation truncated from 103 to 45 messages (9309 to 3944 tokens)
```

## Customization

To modify token limits, update `MODEL_TOKEN_LIMITS` in `/server/src/utils/messageTruncation.ts`.

To change truncation strategy, modify the logic in `truncateMessages()` function.