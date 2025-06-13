export enum AIProvider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'google'
}

export enum AIModel {
  // OpenAI Models
  GPT4_Turbo = 'gpt-4-turbo-preview',
  GPT4 = 'gpt-4',
  O3 = 'o3-preview', // Placeholder for upcoming model
  
  // Anthropic Models
  Claude3_Opus = 'claude-3-opus-20240229',
  Claude3_Sonnet = 'claude-3-sonnet-20240229',
  Claude4_Opus = 'claude-4-opus', // Placeholder for upcoming model
  
  // Google Models
  Gemini_Pro = 'gemini-pro',
  Gemini_Ultra = 'gemini-ultra' // Placeholder for upcoming model
}

export interface AIResponse {
  content: string;
  model: AIModel;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost?: number;
}

export interface AIServiceConfig {
  defaultProvider?: AIProvider;
  defaultModel?: AIModel;
  apiKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
}

export interface TherapyPromptContext {
  userName: string;
  demographics?: any;
  spirituality?: any;
  therapyGoals?: any;
  preferences?: any;
  health?: any;
  mentalHealthScreening?: any;
  sensitiveTopics?: any;
  personalDetails?: any;
  previousSummaries?: string[];
  lastSessionTime?: string;
}

export interface SessionSummary {
  summary: string;
  patterns: string[];
  followupSuggestions: string[];
}

export interface PersonalDetails {
  personalProfile?: Record<string, any>;
  relationships?: Record<string, any>;
  workPurpose?: Record<string, any>;
  healthWellbeing?: Record<string, any>;
  lifestyleHabits?: Record<string, any>;
  goalsPlans?: Record<string, any>;
  patternsInsights?: Record<string, any>;
  preferencesBoundaries?: Record<string, any>;
}