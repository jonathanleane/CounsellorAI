import OpenAI from 'openai';
import { AIModel, AIResponse, SessionSummary, PersonalDetails } from '../types';
import { buildTherapySystemPrompt, buildSummaryPrompt, buildPersonalDetailsExtractionPrompt } from '../prompts/therapyPrompt';
import { logger } from '../../../utils/logger';

export class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }
    
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Missing API key.');
    }
    return this.client;
  }

  async generateResponse(
    messages: any[],
    userProfile: any,
    model: AIModel
  ): Promise<AIResponse> {
    try {
      // Build system prompt with user context
      const systemPrompt = buildTherapySystemPrompt({
        userName: userProfile?.name || 'the user',
        demographics: userProfile?.demographics,
        spirituality: userProfile?.spirituality,
        therapyGoals: userProfile?.therapy_goals,
        preferences: userProfile?.preferences,
        health: userProfile?.health,
        mentalHealthScreening: userProfile?.mental_health_screening,
        sensitiveTopics: userProfile?.sensitive_topics,
        personalDetails: userProfile?.personal_details,
      });

      // Prepare messages for API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      // Map model enum to OpenAI model string
      const modelString = this.mapModelToString(model);

      const completion = await this.ensureClient().chat.completions.create({
        model: modelString,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      const response = completion.choices[0].message.content || '';
      const usage = completion.usage;

      return {
        content: response,
        model,
        usage: usage ? {
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        } : undefined
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from OpenAI');
    }
  }

  async generateSummary(
    messages: any[],
    metadata: any,
    model: AIModel
  ): Promise<SessionSummary> {
    try {
      const systemPrompt = buildSummaryPrompt();
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const modelString = this.mapModelToString(model);

      const completion = await this.ensureClient().chat.completions.create({
        model: modelString,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      logger.error('OpenAI summary generation error:', error);
      return {
        summary: 'Session completed',
        patterns: ['Unable to generate patterns'],
        followupSuggestions: ['Continue conversation in next session']
      };
    }
  }

  async extractPersonalDetails(
    messages: any[],
    model: AIModel
  ): Promise<PersonalDetails> {
    try {
      const systemPrompt = buildPersonalDetailsExtractionPrompt();
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const modelString = this.mapModelToString(model);

      const completion = await this.ensureClient().chat.completions.create({
        model: modelString,
        messages: apiMessages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content || '{}';
      return JSON.parse(response);
    } catch (error) {
      logger.error('OpenAI personal details extraction error:', error);
      return {};
    }
  }

  private mapModelToString(model: AIModel): string {
    switch (model) {
      case AIModel.GPT45_Preview:
        return 'gpt-4.5-preview';
      case AIModel.GPT4_Turbo:
        return 'gpt-4-turbo-preview';
      case AIModel.GPT4:
        return 'gpt-4';
      case AIModel.O3:
        // O3 doesn't exist yet, fallback to GPT-4.5 Preview
        logger.warn('O3 model not yet available, using GPT-4.5 Preview');
        return 'gpt-4.5-preview';
      default:
        return 'gpt-4.5-preview';
    }
  }
}