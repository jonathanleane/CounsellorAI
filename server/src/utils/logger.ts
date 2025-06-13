import winston from 'winston';
import path from 'path';

const logDir = path.join(__dirname, '../../../logs');

// PII fields to redact from logs
const PII_FIELDS = [
  'name',
  'email',
  'phone',
  'age',
  'content', // message content
  'demographics',
  'health',
  'mental_health_screening',
  'therapy_goals',
  'sensitive_topics',
  'personal_details',
  'ai_summary',
  'password',
  'api_key',
  'authorization',
];

// Deep redact sensitive fields from objects
function redactPII(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactPII(item));
  }
  
  const redacted = { ...obj };
  
  for (const key in redacted) {
    const lowerKey = key.toLowerCase();
    
    // Check if field name contains PII indicators
    if (PII_FIELDS.some(field => lowerKey.includes(field))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactPII(redacted[key]);
    }
  }
  
  // Redact specific patterns
  if (redacted.stack && typeof redacted.stack === 'string') {
    // Remove request body data from stack traces
    redacted.stack = redacted.stack.replace(/body:.*?}/g, 'body: [REDACTED]}');
  }
  
  return redacted;
}

// Custom format that redacts PII
const redactFormat = winston.format.printf((info) => {
  const redactedInfo = redactPII(info);
  return JSON.stringify(redactedInfo);
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    redactFormat
  ),
  defaultMeta: { service: 'counsellor-ai' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export { logger };