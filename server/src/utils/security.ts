// Security utilities for input sanitization and validation

// Dangerous patterns that could be prompt injection attempts
const DANGEROUS_PATTERNS = [
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /^System:/gim,
  /^Assistant:/gim,
  /^Human:/gim,
  /\{\{.*?\}\}/g, // Template injection
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
];

// Maximum message length to prevent token overflow attacks
const MAX_MESSAGE_LENGTH = 10000;

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Truncate to reasonable length
  let sanitized = input.substring(0, MAX_MESSAGE_LENGTH);
  
  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  });
  
  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized.trim();
}

/**
 * Check if input contains potential injection attempts
 */
export function detectInjectionAttempt(input: string): boolean {
  if (!input) return false;
  
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Sanitize messages array before sending to AI
 */
export function sanitizeMessages(messages: any[]): any[] {
  return messages.map(msg => ({
    ...msg,
    content: msg.role === 'user' ? sanitizeUserInput(msg.content) : msg.content
  }));
}

/**
 * Generate a safe error message without exposing internals
 */
export function safeErrorMessage(error: any): string {
  // Don't expose internal error details to users
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred processing your request. Please try again.';
  }
  
  // In development, show more details
  if (error?.message) {
    // Still sanitize to avoid leaking sensitive info
    return error.message.replace(/api[_-]?key/gi, '[API_KEY]');
  }
  
  return 'An unknown error occurred';
}