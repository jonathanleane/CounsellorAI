import { z } from 'zod';

// Common schemas
const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long');
const ageSchema = z.string().regex(/^\d{1,3}$/, 'Invalid age').optional();
const genderSchema = z.enum(['male', 'female', 'non-binary', 'other', '']).optional();

// Demographics schema
const demographicsSchema = z.object({
  age: ageSchema,
  gender: genderSchema,
}).optional();

// Spirituality schema
const spiritualitySchema = z.object({
  beliefs: z.string().max(500).optional(),
  importance: z.string().max(100).optional(),
}).optional();

// Therapy goals schema
const therapyGoalsSchema = z.object({
  primary_goal: z.string().max(1000).optional(),
  secondary_goals: z.string().max(2000).optional(),
}).optional();

// Preferences schema
const preferencesSchema = z.object({
  communication_style: z.enum(['', 'direct', 'gentle', 'analytical', 'casual']).optional(),
  approach: z.enum(['', 'cbt', 'mindfulness', 'psychodynamic', 'solution-focused', 'integrative']).optional(),
  ai_model: z.string().max(50).optional(),
}).optional();

// Health schema
const healthSchema = z.object({
  physical_conditions: z.string().max(1000).optional(),
  medications: z.string().max(1000).optional(),
}).optional();

// Mental health screening schema
const mentalHealthScreeningSchema = z.object({
  previous_therapy: z.enum(['', 'yes', 'no']).optional(),
  current_challenges: z.string().max(2000).optional(),
  previous_diagnosis: z.string().max(1000).optional(),
}).optional();

// Sensitive topics schema
const sensitiveTopicsSchema = z.object({
  avoid_topics: z.string().max(1000).optional(),
}).optional();

// Profile schemas
export const createProfileSchema = z.object({
  name: nameSchema,
  demographics: demographicsSchema,
  spirituality: spiritualitySchema,
  therapy_goals: therapyGoalsSchema,
  preferences: preferencesSchema,
  health: healthSchema,
  mental_health_screening: mentalHealthScreeningSchema,
  sensitive_topics: sensitiveTopicsSchema,
});

export const updateProfileSchema = createProfileSchema.partial();

// Session schemas
export const createSessionSchema = z.object({
  session_type: z.enum(['intake', 'standard', 'crisis', 'followup']).optional(),
  initial_mood: z.number().int().min(1).max(10).optional(),
  model: z.string().max(50).optional(),
});

export const addMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
});

export const endSessionSchema = z.object({
  duration: z.number().int().min(0).max(86400), // Max 24 hours in seconds
});

// Brain update schema
export const updateBrainSchema = z.object({
  category: z.string().min(1).max(100),
  field: z.string().min(1).max(100),
  value: z.any(),
});

// Query parameter schemas
export const limitQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

// Validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      } else {
        next(error);
      }
    }
  };
}