# AI Provider Lazy Loading Fix

## Problem
The server would crash on startup if any AI provider API key was missing, even if the user only wanted to use a different provider. For example, if a user only had an OpenAI key but not Anthropic or Gemini keys, the entire server would fail to start.

## Root Cause
In `/server/src/services/ai/index.ts`, the AIService constructor was eagerly instantiating all providers:

```typescript
constructor(config?: AIServiceConfig) {
  // This would throw if any API key was missing
  this.providers.set(AIProvider.OpenAI, new OpenAIService());
  this.providers.set(AIProvider.Anthropic, new AnthropicService());
  this.providers.set(AIProvider.Google, new GeminiService());
}
```

Each provider constructor would throw an error if its API key was missing.

## Solution
Implemented lazy loading for AI providers:

1. **Lazy Provider Initialization**: Providers are now only instantiated when actually needed
2. **Graceful Degradation**: Missing API keys only affect their specific providers
3. **Clear Error Messages**: Better error messages indicate which API key is missing
4. **Startup Validation**: Server checks that at least one provider is available

### Key Changes

1. **AIService now stores provider classes instead of instances**:
```typescript
constructor(config?: AIServiceConfig) {
  // Store provider classes for lazy initialization
  this.providers.set(AIProvider.OpenAI, OpenAIService);
  this.providers.set(AIProvider.Anthropic, AnthropicService);
  this.providers.set(AIProvider.Google, GeminiService);
}
```

2. **Added getOrCreateProvider method for lazy initialization**:
```typescript
private getOrCreateProvider(provider: AIProvider): any {
  if (this.providerInstances.has(provider)) {
    return this.providerInstances.get(provider);
  }
  
  try {
    const ProviderClass = this.providers.get(provider);
    const instance = new ProviderClass();
    this.providerInstances.set(provider, instance);
    return instance;
  } catch (error) {
    logger.error(`Failed to initialize ${provider} provider:`, error);
    throw new Error(`Provider ${provider} is not available. Please check your API key configuration.`);
  }
}
```

3. **Updated getAvailableModels to check provider availability**:
```typescript
getAvailableModels(): Array<{ model: AIModel; name: string; provider: AIProvider; available: boolean }> {
  return [
    { model: AIModel.GPT4_Turbo, name: 'GPT-4 Turbo', provider: AIProvider.OpenAI, available: this.isProviderAvailable(AIProvider.OpenAI) },
    // ... other models
  ];
}
```

4. **Added startup validation** in `/server/src/index.ts`:
```typescript
// Check available AI providers
const availableModels = aiService.getAvailableModels();
const availableProviders = new Set(
  availableModels
    .filter(model => model.available)
    .map(model => model.provider)
);

if (availableProviders.size === 0) {
  logger.error('No AI providers available. Please configure at least one API key.');
  logger.error('Set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_API_KEY');
  process.exit(1);
}

logger.info(`Available AI providers: ${Array.from(availableProviders).join(', ')}`);
```

## Benefits

1. **Flexible Configuration**: Users can run the server with any combination of API keys
2. **Better Error Handling**: Clear messages about which providers are available
3. **No Breaking Changes**: The API remains the same for existing code
4. **Improved Startup Logging**: Server logs which providers and models are available

## Testing

To test the fix:

1. **With only OpenAI key**:
```bash
OPENAI_API_KEY=your-key npm start
# Server starts successfully, only OpenAI models available
```

2. **With only Anthropic key**:
```bash
ANTHROPIC_API_KEY=your-key npm start
# Server starts successfully, only Anthropic models available
```

3. **With no keys**:
```bash
npm start
# Server fails with clear error message about needing at least one API key
```

## Migration Notes

No migration needed. The fix is backward compatible and doesn't change any external APIs.