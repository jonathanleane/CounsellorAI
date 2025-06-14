import { PersonalDetails } from '../services/ai/types';
import { logger } from './logger';

/**
 * Intelligently merge new personal details with existing ones
 * - Preserves existing information
 * - Adds new information
 * - Updates fields when new information is more specific
 * - Tracks what was learned
 */
export function mergePersonalDetails(
  existing: PersonalDetails,
  newDetails: PersonalDetails
): { merged: PersonalDetails; changes: string[] } {
  // Deep clone using structured cloning when available, fallback to JSON method
  let merged: PersonalDetails;
  try {
    // Try structured cloning if available (Node.js 17+)
    if (typeof structuredClone === 'function') {
      merged = structuredClone(existing);
    } else {
      // Fallback to JSON method
      merged = JSON.parse(JSON.stringify(existing));
    }
  } catch (error) {
    logger.error('Failed to deep clone existing details:', error);
    // Create a new object as fallback
    merged = {} as PersonalDetails;
  }
  const changes: string[] = [];

  // Define categories that should be merged
  const categories = [
    'personalProfile',
    'relationships',
    'workPurpose',
    'healthWellbeing',
    'lifestyleHabits',
    'goalsPlans',
    'patternsInsights',
    'preferencesBoundaries'
  ] as const;

  for (const category of categories) {
    if (!newDetails[category as keyof PersonalDetails]) continue;
    
    // Initialize category if it doesn't exist
    if (!merged[category as keyof PersonalDetails]) {
      (merged as any)[category] = {};
    }

    // Merge fields within the category
    for (const [field, value] of Object.entries(newDetails[category as keyof PersonalDetails] as any)) {
      if (!value || value === '') continue;

      const existingValue = (merged as any)[category][field];
      
      // Add new field
      if (!existingValue) {
        (merged as any)[category][field] = value;
        changes.push(`Learned ${category}.${field}: ${truncateValue(value)}`);
      }
      // Update if new value is longer/more detailed
      else if (typeof value === 'string' && typeof existingValue === 'string') {
        if (value.length > existingValue.length || hasMoreDetail(value, existingValue)) {
          (merged as any)[category][field] = value;
          changes.push(`Updated ${category}.${field}: ${truncateValue(value)}`);
        }
      }
      // For arrays, merge unique values
      else if (Array.isArray(value) && Array.isArray(existingValue)) {
        const mergedArray = [...new Set([...existingValue, ...value])];
        if (mergedArray.length > existingValue.length) {
          (merged as any)[category][field] = mergedArray;
          changes.push(`Added to ${category}.${field}: ${value.filter(v => !existingValue.includes(v)).join(', ')}`);
        }
      }
    }
  }

  // Special handling for patternsInsights - always append new patterns
  if (newDetails.patternsInsights) {
    if (!merged.patternsInsights) {
      merged.patternsInsights = {};
    }
    
    // For recurring themes and patterns, append with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fieldsToAppend = ['recurring_themes', 'behavioral_patterns', 'progress_markers'];
    
    for (const field of fieldsToAppend) {
      if (newDetails.patternsInsights[field]) {
        const existing = merged.patternsInsights[field] || '';
        const newValue = newDetails.patternsInsights[field];
        
        if (newValue && !existing.includes(newValue)) {
          merged.patternsInsights[field] = existing
            ? `${existing}\n[${timestamp}] ${newValue}`
            : `[${timestamp}] ${newValue}`;
          changes.push(`Added pattern: ${truncateValue(newValue)}`);
        }
      }
    }
  }

  logger.info(`Personal details merge completed with ${changes.length} changes`);
  return { merged, changes };
}

/**
 * Check if a new value has more detail than existing
 */
function hasMoreDetail(newValue: string, existingValue: string): boolean {
  // Check for more specific information
  const detailIndicators = [
    newValue.includes(' and ') && !existingValue.includes(' and '),
    newValue.includes(', ') && !existingValue.includes(', '),
    newValue.match(/\d+/) && !existingValue.match(/\d+/), // Contains numbers
    newValue.split(' ').length > existingValue.split(' ').length * 1.5, // Significantly more words
  ];
  
  return detailIndicators.some(indicator => indicator);
}

/**
 * Truncate value for logging
 */
function truncateValue(value: any): string {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return str.length > 50 ? str.substring(0, 50) + '...' : str;
}

/**
 * Filter out sensitive information before storing
 */
export function sanitizePersonalDetails(details: PersonalDetails): PersonalDetails {
  let sanitized: PersonalDetails;
  try {
    // Try structured cloning if available (Node.js 17+)
    if (typeof structuredClone === 'function') {
      sanitized = structuredClone(details);
    } else {
      // Fallback to JSON method
      sanitized = JSON.parse(JSON.stringify(details));
    }
  } catch (error) {
    logger.error('Failed to clone details for sanitization:', error);
    // Return empty object if cloning fails
    return {} as PersonalDetails;
  }
  
  // Remove any fields that might contain sensitive data
  const sensitiveFields = ['password', 'ssn', 'credit_card', 'bank_account'];
  
  for (const category of Object.keys(sanitized) as Array<keyof PersonalDetails>) {
    const categoryData = sanitized[category];
    if (categoryData && typeof categoryData === 'object') {
      for (const field of Object.keys(categoryData)) {
        if (sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))) {
          delete categoryData[field];
        }
      }
    }
  }
  
  return sanitized;
}