import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIModel, AIResponse, SessionSummary, PersonalDetails } from '../types';
import { buildTherapySystemPrompt, buildSummaryPrompt, buildPersonalDetailsExtractionPrompt } from '../prompts/therapyPrompt';
import { logger } from '../../../utils/logger';

export class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Google AI API key not configured. Please set GOOGLE_AI_API_KEY environment variable.');
    }
    
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  private ensureClient(): GoogleGenerativeAI {
    if (!this.client) {
      throw new Error('Gemini client not initialized. Missing API key.');
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

      // Get the Gemini model
      const modelString = this.mapModelToString(model);
      const geminiModel = this.ensureClient().getGenerativeModel({ model: modelString });

      // Format conversation history for Gemini
      const history = this.formatMessagesForGemini(messages);
      
      // Start chat with history
      const chat = geminiModel.startChat({
        history,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      // Send the system prompt as context for the current message
      const result = await chat.sendMessage(
        `Context: ${systemPrompt}\n\nPlease respond to the user's last message with this context in mind.`
      );
      
      const response = result.response;
      const text = response.text();

      // Estimate token usage (Gemini doesn't provide exact counts)
      const estimatedInputTokens = JSON.stringify(messages).length / 4;
      const estimatedOutputTokens = text.length / 4;

      return {
        content: text,
        model,
        usage: {
          inputTokens: Math.round(estimatedInputTokens),
          outputTokens: Math.round(estimatedOutputTokens),
          totalTokens: Math.round(estimatedInputTokens + estimatedOutputTokens)
        }
      };
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error('Failed to generate response from Gemini');
    }
  }

  async generateSummary(
    messages: any[],
    metadata: any,
    model: AIModel
  ): Promise<SessionSummary> {
    try {
      const systemPrompt = buildSummaryPrompt();
      const modelString = this.mapModelToString(model);
      const geminiModel = this.ensureClient().getGenerativeModel({ model: modelString });

      // Format all messages as context
      const conversationText = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');

      const prompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nGenerate the JSON summary:`;

      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to extract JSON from response');
    } catch (error) {
      logger.error('Gemini summary generation error:', error);
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
      const modelString = this.mapModelToString(model);
      const geminiModel = this.ensureClient().getGenerativeModel({ model: modelString });

      const conversationText = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');

      const prompt = `${systemPrompt}\n\nConversation:\n${conversationText}\n\nExtract and return the personal details as JSON:`;

      const result = await geminiModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {};
    } catch (error) {
      logger.error('Gemini personal details extraction error:', error);
      return {};
    }
  }

  private formatMessagesForGemini(messages: any[]): any[] {
    // Gemini expects a specific format for chat history
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  private mapModelToString(model: AIModel): string {
    switch (model) {
      case AIModel.Gemini_Pro:
        return 'gemini-1.5-flash';
      case AIModel.Gemini_Ultra:
        // Gemini Ultra not yet available, fallback to Flash
        logger.warn('Gemini Ultra not yet available, using Gemini 1.5 Flash');
        return 'gemini-1.5-flash';
      default:
        return 'gemini-1.5-flash';
    }
  }
}