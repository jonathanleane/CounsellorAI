import { Message } from './message';

export interface Conversation {
  id: string;
  session_type: 'intake' | 'standard';
  status: 'active' | 'completed' | 'ending';
  initial_mood?: number;
  end_mood?: number;
  duration?: number;
  model?: string;
  ai_summary?: string;
  identified_patterns?: string[];
  followup_suggestions?: string[];
  learned_details?: string;
  learning_changes?: string;
  timestamp: string;
  updated_at?: string;
  messages?: Message[];
}