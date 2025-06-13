import Anthropic from '@anthropic-ai/sdk';
import { AIModel, AIResponse, SessionSummary, PersonalDetails } from '../types';
import { buildTherapySystemPrompt, buildSummaryPrompt, buildPersonalDetailsExtractionPrompt } from '../prompts/therapyPrompt';
import { logger } from '../../../utils/logger';

export class AnthropicService {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.');
    }
    
    this.client = new Anthropic({ apiKey: this.apiKey });
  }

  private ensureClient(): Anthropic {
    if (!this.client) {
      throw new Error('Anthropic client not initialized. Missing API key.');
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

      // Convert messages to Anthropic format
      const formattedMessages = this.formatMessagesForAnthropic(messages, systemPrompt);

      // Map model enum to Anthropic model string
      const modelString = this.mapModelToString(model);

      // Check if we should use thinking mode (for Opus models)
      const useThinking = model === AIModel.Claude3_Opus || model === AIModel.Claude4_Opus;

      let response: Anthropic.Message;
      
      if (useThinking) {
        // Use streaming with thinking mode for Opus models
        response = await this.streamWithThinking(modelString, formattedMessages);
      } else {
        // Regular response for Sonnet
        response = await this.ensureClient().messages.create({
          model: modelString,
          messages: formattedMessages,
          max_tokens: 4096,
          temperature: 0.7,
        });
      }

      return {
        content: this.extractContent(response),
        model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        }
      };
    } catch (error) {
      logger.error('Anthropic API error:', error);
      throw new Error('Failed to generate response from Anthropic');
    }
  }

  async generateSummary(
    messages: any[],
    metadata: any,
    model: AIModel
  ): Promise<SessionSummary> {
    try {
      const systemPrompt = buildSummaryPrompt();
      const formattedMessages = this.formatMessagesForAnthropic(messages, systemPrompt);
      
      // Add explicit JSON request
      formattedMessages.push({
        role: 'user',
        content: 'Remember to return your response as valid JSON using the exact format specified.'
      });

      const modelString = this.mapModelToString(model);

      const response = await this.ensureClient().messages.create({
        model: modelString,
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = this.extractContent(response);
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to extract JSON from response');
    } catch (error) {
      logger.error('Anthropic summary generation error:', error);
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
      const formattedMessages = this.formatMessagesForAnthropic(messages, systemPrompt);
      
      formattedMessages.push({
        role: 'user',
        content: 'Extract the personal details and return as JSON.'
      });

      const modelString = this.mapModelToString(model);

      const response = await this.ensureClient().messages.create({
        model: modelString,
        messages: formattedMessages,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = this.extractContent(response);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {};
    } catch (error) {
      logger.error('Anthropic personal details extraction error:', error);
      return {};
    }
  }

  private async streamWithThinking(model: string, messages: any[]): Promise<Anthropic.Message> {
    // For Opus models with thinking mode
    const stream = await this.ensureClient().beta.messages.stream({
      model,
      messages,
      max_tokens: 32000,
      temperature: 1.0, // Must be 1.0 for thinking mode
      thinking: {
        type: 'enabled',
        budget_tokens: 16000
      },
      betas: ['output-128k-2025-02-19']
    });

    let fullContent = '';
    let usage = { input_tokens: 0, output_tokens: 0 };

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullContent += chunk.delta.text;
      } else if (chunk.type === 'message_start' && chunk.message.usage) {
        usage = chunk.message.usage;
      }
    }

    return {
      id: 'stream-response',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: fullContent }],
      model,
      usage,
      stop_reason: 'end_turn',
      stop_sequence: null
    } as Anthropic.Message;
  }

  private formatMessagesForAnthropic(messages: any[], systemPrompt: string): any[] {
    // Anthropic expects system prompt as first user message
    const formattedMessages = [
      {
        role: 'user',
        content: systemPrompt
      },
      {
        role: 'assistant',
        content: "I understand my role as an AI therapist. I'll support the user's personal growth and well-being while following the guidelines you've provided."
      }
    ];

    // Add the rest of the messages
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    return formattedMessages;
  }

  private extractContent(response: Anthropic.Message): string {
    if (response.content && response.content.length > 0) {
      const textContent = response.content.find(c => c.type === 'text');
      return textContent?.text || '';
    }
    return '';
  }

  private mapModelToString(model: AIModel): string {
    switch (model) {
      case AIModel.Claude4_Opus:
        return 'claude-4-opus';
      case AIModel.Claude4_Sonnet:
        return 'claude-4-sonnet';
      case AIModel.Claude3_Opus:
        return 'claude-3-opus-20240229';
      case AIModel.Claude3_Sonnet:
        return 'claude-3-sonnet-20240229';
      default:
        return 'claude-4-opus';
    }
  }
}