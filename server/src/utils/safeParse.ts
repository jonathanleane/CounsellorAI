import { logger } from './logger';

/**
 * Safely parse JSON with error handling
 * @param jsonString - The JSON string to parse
 * @param fallback - The fallback value if parsing fails
 * @param context - Optional context for logging
 * @returns The parsed value or fallback
 */
export function safeParse<T = any>(
  jsonString: string | null | undefined,
  fallback: T,
  context?: string
): T {
  if (!jsonString) {
    return fallback;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    if (context) {
      logger.error(`JSON parse error in ${context}:`, error);
      logger.debug(`Malformed JSON: ${jsonString.substring(0, 100)}...`);
    }
    return fallback;
  }
}

/**
 * Safely parse JSON array with error handling
 * @param jsonString - The JSON string to parse
 * @param context - Optional context for logging
 * @returns The parsed array or empty array
 */
export function safeParseArray<T = any>(
  jsonString: string | null | undefined,
  context?: string
): T[] {
  return safeParse(jsonString, [], context);
}

/**
 * Safely parse JSON object with error handling
 * @param jsonString - The JSON string to parse
 * @param context - Optional context for logging
 * @returns The parsed object or empty object
 */
export function safeParseObject<T extends Record<string, any> = Record<string, any>>(
  jsonString: string | null | undefined,
  context?: string
): T {
  return safeParse(jsonString, {} as T, context);
}