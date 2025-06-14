import { AIModel } from '../services/ai/types';
import { logger } from './logger';

interface Message {
  role: string;
  content: string;
}

interface TruncationConfig {
  maxTokens: number;
  preserveSystemPrompt: boolean;
  preserveRecentMessages: number;
}

const MODEL_TOKEN_LIMITS: Record<AIModel, number> = {
  [AIModel.GPT45_Preview]: 12000,
  [AIModel.GPT4_Turbo]: 12000,
  [AIModel.GPT4]: 8000,
  [AIModel.O3]: 12000,
  [AIModel.Claude4_Opus]: 16000,
  [AIModel.Claude4_Sonnet]: 16000,
  [AIModel.Claude3_Opus]: 16000,
  [AIModel.Claude3_Sonnet]: 16000,
  [AIModel.Gemini25_Pro]: 20000,
  [AIModel.Gemini25_Flash]: 20000,
  [AIModel.Gemini_Pro]: 15000,
  [AIModel.Gemini_Ultra]: 20000,
};

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function estimateMessagesTokenCount(messages: Message[]): number {
  return messages.reduce((total, msg) => {
    const roleTokens = 4;
    const contentTokens = estimateTokenCount(msg.content);
    const formattingTokens = 3;
    return total + roleTokens + contentTokens + formattingTokens;
  }, 0);
}

export function truncateMessages(
  messages: Message[],
  model: AIModel,
  userProfile?: any
): Message[] {
  const maxTokens = MODEL_TOKEN_LIMITS[model] || 12000;
  const profileTokens = userProfile ? estimateTokenCount(JSON.stringify(userProfile)) : 0;
  const systemPromptOverhead = 2000;
  const responseBuffer = 2000;
  
  const availableTokens = maxTokens - profileTokens - systemPromptOverhead - responseBuffer;
  
  const currentTokenCount = estimateMessagesTokenCount(messages);
  
  if (currentTokenCount <= availableTokens) {
    return messages;
  }
  
  logger.info(`Truncating conversation: ${currentTokenCount} tokens exceeds limit of ${availableTokens} for model ${model}`);
  
  const systemMessages = messages.filter(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  if (conversationMessages.length === 0) {
    return messages;
  }
  
  let lastUserMessageIndex = -1;
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    if (conversationMessages[i].role === 'user') {
      lastUserMessageIndex = i;
      break;
    }
  }
  
  if (lastUserMessageIndex === -1) {
    return messages;
  }
  
  const recentMessagesToKeep = Math.min(10, Math.floor(conversationMessages.length / 3));
  const importantMessages: Message[] = [];
  
  importantMessages.push(...systemMessages);
  
  if (conversationMessages.length > 0 && conversationMessages[0].role === 'assistant') {
    importantMessages.push(conversationMessages[0]);
  }
  
  const startOfRecentMessages = Math.max(
    lastUserMessageIndex - recentMessagesToKeep + 1,
    1
  );
  const recentMessages = conversationMessages.slice(startOfRecentMessages);
  importantMessages.push(...recentMessages);
  
  let truncatedMessages = [...importantMessages];
  let truncatedTokenCount = estimateMessagesTokenCount(truncatedMessages);
  
  if (truncatedTokenCount > availableTokens) {
    const summaryMessage: Message = {
      role: 'system',
      content: `[Previous conversation truncated. Keeping system context and most recent ${recentMessages.length} messages.]`
    };
    
    truncatedMessages = [
      ...systemMessages,
      summaryMessage,
      ...recentMessages.slice(-Math.floor(recentMessages.length / 2))
    ];
    
    truncatedTokenCount = estimateMessagesTokenCount(truncatedMessages);
    
    if (truncatedTokenCount > availableTokens) {
      const criticalMessages = [
        ...systemMessages,
        summaryMessage,
        conversationMessages[lastUserMessageIndex]
      ];
      
      if (lastUserMessageIndex > 0 && conversationMessages[lastUserMessageIndex - 1].role === 'assistant') {
        criticalMessages.splice(-1, 0, conversationMessages[lastUserMessageIndex - 1]);
      }
      
      truncatedMessages = criticalMessages;
    }
  } else {
    const middleMessages = conversationMessages.slice(1, startOfRecentMessages);
    const remainingTokens = availableTokens - truncatedTokenCount;
    
    for (let i = middleMessages.length - 1; i >= 0 && remainingTokens > 0; i--) {
      const messageTokens = estimateTokenCount(middleMessages[i].content) + 7;
      if (truncatedTokenCount + messageTokens <= availableTokens) {
        const insertIndex = systemMessages.length + (conversationMessages[0].role === 'assistant' ? 1 : 0);
        truncatedMessages.splice(insertIndex + 1, 0, middleMessages[i]);
        truncatedTokenCount += messageTokens;
      }
    }
  }
  
  const finalTokenCount = estimateMessagesTokenCount(truncatedMessages);
  logger.info(`Conversation truncated from ${messages.length} to ${truncatedMessages.length} messages (${currentTokenCount} to ${finalTokenCount} tokens)`);
  
  return truncatedMessages;
}

export function createConversationSummary(truncatedMessages: Message[]): string {
  const totalMessages = truncatedMessages.filter(m => m.role !== 'system').length;
  const userMessages = truncatedMessages.filter(m => m.role === 'user').length;
  const assistantMessages = truncatedMessages.filter(m => m.role === 'assistant').length;
  
  return `Conversation context: ${totalMessages} messages (${userMessages} from user, ${assistantMessages} from assistant)`;
}