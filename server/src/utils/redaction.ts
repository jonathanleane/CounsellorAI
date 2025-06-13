/**
 * Utility functions for redacting sensitive information from logs
 */

// Fields that should always be redacted
const SENSITIVE_FIELDS = [
  'password',
  'api_key',
  'apiKey',
  'secret',
  'token',
  'ssn',
  'social_security_number',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
  'health',
  'medications',
  'therapy_goals',
  'mental_health_screening',
  'personal_details',
  'sensitive_topics',
  'demographics',
  'spirituality',
  'physical_conditions',
  'current_challenges',
  'avoid_topics',
  'beliefs',
  'previous_therapy',
  'initial_mood',
  'end_mood'
];

// Patterns to detect and redact
const SENSITIVE_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' }, // SSN
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CARD_REDACTED]' }, // Credit card
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' }, // Email
  { pattern: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, replacement: '[PHONE_REDACTED]' }, // Phone
];

/**
 * Deep clone an object to avoid modifying the original
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
}

/**
 * Redact sensitive data from an object
 */
export function redactSensitiveData(data: any): any {
  if (!data) return data;
  
  // Clone to avoid modifying original
  const redacted = deepClone(data);
  
  // Handle string values
  if (typeof redacted === 'string') {
    let result = redacted;
    SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
      result = result.replace(pattern, replacement);
    });
    return result;
  }
  
  // Handle objects and arrays
  if (typeof redacted === 'object') {
    const processValue = (obj: any) => {
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        
        const lowerKey = key.toLowerCase();
        const value = obj[key];
        
        // Check if key is sensitive
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
          if (typeof value === 'string') {
            obj[key] = '[REDACTED]';
          } else if (typeof value === 'number') {
            obj[key] = 0;
          } else if (typeof value === 'boolean') {
            obj[key] = false;
          } else if (typeof value === 'object' && value !== null) {
            obj[key] = Array.isArray(value) ? [] : {};
          }
        } else if (typeof value === 'string') {
          // Apply pattern matching to string values
          SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
            obj[key] = value.replace(pattern, replacement);
          });
        } else if (typeof value === 'object' && value !== null) {
          // Recursively process nested objects
          processValue(value);
        }
      }
    };
    
    if (Array.isArray(redacted)) {
      redacted.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          processValue(item);
        }
      });
    } else {
      processValue(redacted);
    }
  }
  
  return redacted;
}

/**
 * Create a safe log object with only essential fields
 */
export function createSafeLogObject(data: any): any {
  if (!data) return data;
  
  // For profile data, only include safe fields
  if (data.name !== undefined && data.demographics !== undefined) {
    return {
      id: data.id,
      name: data.name,
      intake_completed: data.intake_completed,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  // For session data, only include safe fields
  if (data.session_type !== undefined && data.messages !== undefined) {
    return {
      id: data.id,
      session_type: data.session_type,
      status: data.status,
      duration: data.duration,
      message_count: Array.isArray(data.messages) ? data.messages.length : 0,
      created_at: data.timestamp
    };
  }
  
  // Default redaction
  return redactSensitiveData(data);
}