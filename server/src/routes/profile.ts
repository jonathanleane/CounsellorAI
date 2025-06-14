import { Router } from 'express';
import { getDatabase } from '../services/database';
import { logger } from '../utils/logger';
import { redactSensitiveData, createSafeLogObject } from '../utils/redaction';
import { safeParse, safeParseArray, safeParseObject } from '../utils/safeParse';
import { validateBody, createProfileSchema, updateProfileSchema, updateBrainSchema } from '../validation/schemas';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all profile routes
router.use(authenticateToken);

// Get user profile
router.get('/', async (req, res, next) => {
  try {
    logger.info('GET /api/profile - Fetching profile data');
    const db = getDatabase();
    const profile = await db.getProfile();
    
    logger.info('Profile fetched from database:', createSafeLogObject(profile));
    
    if (!profile) {
      logger.warn('Profile not found in database');
      res.status(404).json({ 
        error: { 
          message: 'Profile not found. Please complete the onboarding questionnaire.' 
        } 
      });
      return;
    }
    
    // Parse JSON fields
    const parsedProfile = {
      ...profile,
      demographics: safeParseObject(profile.demographics, 'profile.get.demographics'),
      spirituality: safeParseObject(profile.spirituality, 'profile.get.spirituality'),
      therapy_goals: safeParseObject(profile.therapy_goals, 'profile.get.therapy_goals'),
      preferences: safeParseObject(profile.preferences, 'profile.get.preferences'),
      health: safeParseObject(profile.health, 'profile.get.health'),
      mental_health_screening: safeParseObject(profile.mental_health_screening, 'profile.get.mental_health_screening'),
      sensitive_topics: safeParseObject(profile.sensitive_topics, 'profile.get.sensitive_topics'),
      personal_details: safeParseObject(profile.personal_details, 'profile.get.personal_details'),
      intake_completed: Boolean(profile.intake_completed)
    };
    
    logger.info('Parsed profile ready for client:', createSafeLogObject(parsedProfile));
    
    // Add stats to the profile response
    const conversations = await db.getAllConversations();
    
    // Calculate streak
    const calculateStreak = () => {
      if (conversations.length === 0) return 0;
      
      // Sort sessions by date (newest first)
      const sortedSessions = conversations
        .filter(c => c.status === 'completed')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (sortedSessions.length === 0) return 0;
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if there's a session today or yesterday
      const lastSessionDate = new Date(sortedSessions[0].timestamp);
      lastSessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If last session was more than 1 day ago, streak is broken
      if (daysDiff > 1) return 0;
      
      // Count consecutive days
      let currentDate = new Date(lastSessionDate);
      streak = 1;
      
      for (let i = 1; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].timestamp);
        sessionDate.setHours(0, 0, 0, 0);
        
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        
        if (sessionDate.getTime() === prevDate.getTime()) {
          streak++;
          currentDate = sessionDate;
        } else if (sessionDate.getTime() < prevDate.getTime()) {
          // Skip sessions on the same day
          continue;
        } else {
          // Streak broken
          break;
        }
      }
      
      return streak;
    };
    
    const stats = {
      total_sessions: conversations.length,
      avg_mood: conversations.length > 0 
        ? Math.round(conversations.reduce((sum, c) => sum + (c.initial_mood || 0), 0) / conversations.length)
        : 0,
      total_duration: conversations.reduce((sum, c) => sum + (c.duration || 0), 0),
      streak: calculateStreak()
    };
    
    const responseData = {
      ...parsedProfile,
      stats
    };
    
    logger.info('Sending profile response with stats');
    res.json(responseData);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    next(error);
  }
});

// Create or update profile
router.post('/', validateBody(createProfileSchema), async (req, res, next) => {
  try {
    const db = getDatabase();
    const profileData = req.body;
    
    logger.info('Creating/updating profile for user:', { name: profileData.name });
    
    const savedProfile = await db.createProfile(profileData);
    
    res.status(201).json({
      ...savedProfile,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error saving profile:', error);
    next(error);
  }
});

// Update existing profile
router.put('/', validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const db = getDatabase();
    const profileData = req.body;
    
    logger.info('Updating profile for user:', { name: profileData.name });
    
    // Get existing profile
    const existingProfile = await db.getProfile();
    if (!existingProfile) {
      res.status(404).json({ 
        error: { 
          message: 'Profile not found' 
        } 
      });
      return;
    }
    
    // Update each field individually to maintain data integrity
    const fieldsToUpdate = [
      'name', 'demographics', 'spirituality', 'therapy_goals', 
      'preferences', 'health', 'mental_health_screening', 'sensitive_topics'
    ];
    
    for (const field of fieldsToUpdate) {
      if (profileData[field] !== undefined) {
        await db.updateProfile(field, profileData[field]);
      }
    }
    
    // Get updated profile
    const updatedProfile = await db.getProfile();
    
    res.json({
      ...updatedProfile,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    next(error);
  }
});

// Get therapist brain data
router.get('/brain', async (req, res, next) => {
  try {
    const db = getDatabase();
    const profile = await db.getProfile();
    
    if (!profile) {
      res.status(404).json({ 
        error: { 
          message: 'Profile not found. Please complete the onboarding questionnaire.' 
        } 
      });
      return;
    }
    
    const personalDetails = safeParseObject(profile.personal_details, 'profile.brain.get');
    res.json({ personalDetails });
  } catch (error) {
    logger.error('Error fetching therapist brain data:', error);
    next(error);
  }
});

// Update therapist brain data
router.post('/brain', validateBody(updateBrainSchema), async (req, res, next) => {
  try {
    const { category, field, value } = req.body;
    
    if (!category || !field) {
      res.status(400).json({ 
        error: { 
          message: 'Category and field are required' 
        } 
      });
      return;
    }
    
    const db = getDatabase();
    const profile = await db.getProfile();
    
    if (!profile) {
      res.status(404).json({ 
        error: { 
          message: 'Profile not found' 
        } 
      });
      return;
    }
    
    // Get current personal details
    let personalDetails = safeParseObject(profile.personal_details, 'profile.brain.update');
    
    // Create category if it doesn't exist
    if (!personalDetails[category]) {
      personalDetails[category] = {};
    }
    
    // Update or delete field
    if (value === null || value === '') {
      delete personalDetails[category][field];
      
      // Remove category if empty
      if (Object.keys(personalDetails[category]).length === 0) {
        delete personalDetails[category];
      }
    } else {
      personalDetails[category][field] = value;
    }
    
    // Save updated personal details
    await db.updateProfile('personal_details', personalDetails);
    
    res.json({ success: true, personalDetails });
  } catch (error) {
    logger.error('Error updating therapist brain data:', error);
    next(error);
  }
});

export default router;