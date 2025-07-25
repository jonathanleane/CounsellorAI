import { AIProvider, AIModel, AIResponse, AIServiceConfig } from './types';
import { OpenAIService } from './providers/openai';
import { AnthropicService } from './providers/anthropic';
import { GeminiService } from './providers/gemini';
import { logger } from '../../utils/logger';

export class AIService {
  private providers: Map<AIProvider, any> = new Map();
  private providerInstances: Map<AIProvider, any> = new Map();
  private providerAvailabilityCache: Map<AIProvider, boolean> = new Map();
  private availabilityCacheExpiry: number = 0;
  private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
  private currentProvider: AIProvider;
  private currentModel: AIModel;

  constructor(config?: AIServiceConfig) {
    // Store provider classes for lazy initialization
    this.providers.set(AIProvider.OpenAI, OpenAIService);
    this.providers.set(AIProvider.Anthropic, AnthropicService);
    this.providers.set(AIProvider.Google, GeminiService);

    // Set default provider and model
    this.currentProvider = config?.defaultProvider || AIProvider.OpenAI;
    this.currentModel = config?.defaultModel || AIModel.GPT45_Preview;
  }

  private getOrCreateProvider(provider: AIProvider): any {
    // Check if we already have an instance
    if (this.providerInstances.has(provider)) {
      return this.providerInstances.get(provider);
    }

    // Try to create the provider instance
    const ProviderClass = this.providers.get(provider);
    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    try {
      const instance = new ProviderClass();
      this.providerInstances.set(provider, instance);
      return instance;
    } catch (error) {
      logger.error(`Failed to initialize ${provider} provider:`, error);
      throw new Error(`Provider ${provider} is not available. Please check your API key configuration.`);
    }
  }

  async generateResponse(
    messages: any[],
    userProfile: any,
    model?: AIModel
  ): Promise<AIResponse> {
    const selectedModel = model || this.currentModel;
    const provider = this.getProviderForModel(selectedModel);
    
    try {
      logger.info(`Generating response with ${selectedModel}`);
      const service = this.getOrCreateProvider(provider);
      
      return await service.generateResponse(messages, userProfile, selectedModel);
    } catch (error) {
      logger.error(`Error with ${selectedModel}, attempting fallback`, error);
      
      // Attempt fallback to GPT-4.5 Preview
      if (selectedModel !== AIModel.GPT45_Preview) {
        return this.generateResponse(messages, userProfile, AIModel.GPT45_Preview);
      }
      
      throw error;
    }
  }

  async generateSummary(
    messages: any[],
    metadata: { initialMood?: number; endMood?: number },
    model?: AIModel
  ): Promise<any> {
    const selectedModel = model || this.currentModel;
    const provider = this.getProviderForModel(selectedModel);
    
    try {
      const service = this.getOrCreateProvider(provider);
      return await service.generateSummary(messages, metadata, selectedModel);
    } catch (error) {
      logger.error(`Error generating summary with ${selectedModel}`, error);
      throw error;
    }
  }

  async extractPersonalDetails(
    messages: any[],
    model?: AIModel
  ): Promise<any> {
    const selectedModel = model || this.currentModel;
    const provider = this.getProviderForModel(selectedModel);
    
    try {
      const service = this.getOrCreateProvider(provider);
      return await service.extractPersonalDetails(messages, selectedModel);
    } catch (error) {
      logger.error(`Error extracting details with ${selectedModel}`, error);
      throw error;
    }
  }

  private getProviderForModel(model: AIModel): AIProvider {
    switch (model) {
      case AIModel.GPT45_Preview:
      case AIModel.GPT4_Turbo:
      case AIModel.GPT4:
      case AIModel.O3:
        return AIProvider.OpenAI;
      
      case AIModel.Claude4_Opus:
      case AIModel.Claude4_Sonnet:
      case AIModel.Claude3_Opus:
      case AIModel.Claude3_Sonnet:
        return AIProvider.Anthropic;
      
      case AIModel.Gemini25_Pro:
      case AIModel.Gemini25_Flash:
      case AIModel.Gemini_Pro:
      case AIModel.Gemini_Ultra:
        return AIProvider.Google;
      
      default:
        return AIProvider.OpenAI;
    }
  }

  // Check if a provider is available (has valid API key) with caching
  private isProviderAvailable(provider: AIProvider): boolean {
    // Check if cache is still valid
    const now = Date.now();
    if (now < this.availabilityCacheExpiry && this.providerAvailabilityCache.has(provider)) {
      return this.providerAvailabilityCache.get(provider)!;
    }
    
    // If cache expired or doesn't exist, check availability
    let isAvailable = false;
    switch (provider) {
      case AIProvider.OpenAI:
        isAvailable = !!process.env.OPENAI_API_KEY;
        break;
      case AIProvider.Anthropic:
        isAvailable = !!process.env.ANTHROPIC_API_KEY;
        break;
      case AIProvider.Google:
        isAvailable = !!process.env.GOOGLE_AI_API_KEY;
        break;
      default:
        isAvailable = false;
    }
    
    // Update cache
    this.providerAvailabilityCache.set(provider, isAvailable);
    
    // Update cache expiry time if this is the first cache entry
    if (this.availabilityCacheExpiry <= now) {
      this.availabilityCacheExpiry = now + this.CACHE_DURATION_MS;
    }
    
    return isAvailable;
  }

  // Get available models
  getAvailableModels(): Array<{ model: AIModel; name: string; provider: AIProvider; available: boolean }> {
    return [
      { model: AIModel.GPT45_Preview, name: 'GPT-4.5 Preview', provider: AIProvider.OpenAI, available: this.isProviderAvailable(AIProvider.OpenAI) },
      { model: AIModel.GPT4_Turbo, name: 'GPT-4 Turbo', provider: AIProvider.OpenAI, available: this.isProviderAvailable(AIProvider.OpenAI) },
      { model: AIModel.GPT4, name: 'GPT-4', provider: AIProvider.OpenAI, available: this.isProviderAvailable(AIProvider.OpenAI) },
      { model: AIModel.O3, name: 'O3 (Coming Soon)', provider: AIProvider.OpenAI, available: false },
      { model: AIModel.Claude4_Opus, name: 'Claude 4 Opus', provider: AIProvider.Anthropic, available: this.isProviderAvailable(AIProvider.Anthropic) },
      { model: AIModel.Claude4_Sonnet, name: 'Claude 4 Sonnet', provider: AIProvider.Anthropic, available: this.isProviderAvailable(AIProvider.Anthropic) },
      { model: AIModel.Claude3_Opus, name: 'Claude 3 Opus', provider: AIProvider.Anthropic, available: this.isProviderAvailable(AIProvider.Anthropic) },
      { model: AIModel.Claude3_Sonnet, name: 'Claude 3 Sonnet', provider: AIProvider.Anthropic, available: this.isProviderAvailable(AIProvider.Anthropic) },
      { model: AIModel.Gemini25_Pro, name: 'Gemini 2.5 Pro', provider: AIProvider.Google, available: this.isProviderAvailable(AIProvider.Google) },
      { model: AIModel.Gemini25_Flash, name: 'Gemini 2.5 Flash', provider: AIProvider.Google, available: this.isProviderAvailable(AIProvider.Google) },
      { model: AIModel.Gemini_Pro, name: 'Gemini Pro', provider: AIProvider.Google, available: this.isProviderAvailable(AIProvider.Google) },
    ];
  }

  // Estimate cost for a session
  estimateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    // Cost per 1K tokens (rough estimates)
    const costs: Record<AIModel, { input: number; output: number }> = {
      [AIModel.GPT45_Preview]: { input: 0.015, output: 0.045 }, // Estimated based on GPT-4.5 being more expensive
      [AIModel.GPT4_Turbo]: { input: 0.01, output: 0.03 },
      [AIModel.GPT4]: { input: 0.03, output: 0.06 },
      [AIModel.O3]: { input: 0.02, output: 0.04 }, // Estimated
      [AIModel.Claude4_Opus]: { input: 0.015, output: 0.075 },
      [AIModel.Claude4_Sonnet]: { input: 0.003, output: 0.015 },
      [AIModel.Claude3_Opus]: { input: 0.015, output: 0.075 },
      [AIModel.Claude3_Sonnet]: { input: 0.003, output: 0.015 },
      [AIModel.Gemini25_Pro]: { input: 0.002, output: 0.008 }, // Estimated
      [AIModel.Gemini25_Flash]: { input: 0.001, output: 0.004 }, // Estimated
      [AIModel.Gemini_Pro]: { input: 0.0005, output: 0.0015 },
      [AIModel.Gemini_Ultra]: { input: 0.002, output: 0.006 }, // Deprecated
    };

    const modelCost = costs[model] || costs[AIModel.GPT45_Preview];
    return (inputTokens / 1000) * modelCost.input + (outputTokens / 1000) * modelCost.output;
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export * from './types';