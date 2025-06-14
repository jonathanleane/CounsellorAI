import { z } from 'zod';

const envSchema = z.object({
  // Required
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  
  // AI API Keys (at least one required)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  
  // Database
  USE_FIREBASE: z.string().transform(val => val === 'true').default('false'),
  
  // Firebase (required if USE_FIREBASE is true)
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  
  // Security
  SESSION_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  DATABASE_ENCRYPTION_KEY: z.string().regex(/^[a-zA-Z0-9+/=]+$/, "Database encryption key must be a valid Base64 string").optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CSRF_SECRET: z.string().optional(),
  
  // Database
  USE_ENCRYPTED_DB: z.string().transform(val => val === 'true').default('true'),
  
  // Backup
  AUTO_BACKUP: z.string().transform(val => val === 'true').default('true'),
  BACKUP_INTERVAL: z.string().default('daily'),
  MAX_BACKUPS: z.string().default('7'),
  
  // Learning System
  ENABLE_AUTO_LEARNING: z.string().transform(val => val === 'true').default('true'),
  
  // Frontend URL (for CORS)
  FRONTEND_URL: z.string().optional(),
  
  // Rate limiting
  RATE_LIMIT_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('900000'), // 15 minutes
  
  // Default AI settings
  DEFAULT_AI_MODEL: z.string().default('gpt-4.5-preview'),
  MAX_TOKENS: z.string().default('16384'),
  AI_TEMPERATURE: z.string().default('0.7'),
  
  // Timezone
  DEFAULT_TIMEZONE: z.string().default('UTC'),
});

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation: At least one AI API key must be present
    if (!env.OPENAI_API_KEY && !env.ANTHROPIC_API_KEY && !env.GOOGLE_AI_API_KEY) {
      throw new Error('At least one AI API key must be configured (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_API_KEY)');
    }
    
    // Firebase validation
    if (env.USE_FIREBASE && (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY)) {
      throw new Error('Firebase configuration incomplete. Please provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
    }
    
    // Security warnings
    if (env.NODE_ENV === 'production') {
      if (!env.SESSION_SECRET) {
        console.warn('WARNING: SESSION_SECRET not set in production');
      }
      if (!env.ENCRYPTION_KEY) {
        console.warn('WARNING: ENCRYPTION_KEY not set in production');
      }
      if (env.USE_ENCRYPTED_DB && !env.DATABASE_ENCRYPTION_KEY) {
        throw new Error('DATABASE_ENCRYPTION_KEY is required when USE_ENCRYPTED_DB is true');
      }
      if (!env.JWT_SECRET || env.JWT_SECRET === 'change_this_secret_key') {
        throw new Error('JWT_SECRET must be set to a secure value in production');
      }
      if (!env.CSRF_SECRET || env.CSRF_SECRET === 'default-csrf-secret-change-in-production') {
        throw new Error('CSRF_SECRET must be set to a secure value in production');
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Export typed environment
export type Env = z.infer<typeof envSchema>;