import { Router } from 'express';
import { getDatabase } from '../services/database';
import { logger } from '../utils/logger';

const router = Router();

// Get user profile
router.get('/', async (req, res, next) => {
  try {
    logger.info('GET /api/profile - Fetching profile data');
    const db = getDatabase();
    const profile = await db.getProfile();
    
    logger.info('Raw profile from database:', profile);
    
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
      demographics: JSON.parse(profile.demographics || '{}'),
      spirituality: JSON.parse(profile.spirituality || '{}'),
      therapy_goals: JSON.parse(profile.therapy_goals || '{}'),
      preferences: JSON.parse(profile.preferences || '{}'),
      health: JSON.parse(profile.health || '{}'),
      mental_health_screening: JSON.parse(profile.mental_health_screening || '{}'),
      sensitive_topics: JSON.parse(profile.sensitive_topics || '{}'),
      personal_details: JSON.parse(profile.personal_details || '{}'),
      intake_completed: Boolean(profile.intake_completed)
    };
    
    logger.info('Parsed profile being sent to client:', parsedProfile);
    
    // Add stats to the profile response
    const conversations = await db.getAllConversations();
    const stats = {
      total_sessions: conversations.length,
      avg_mood: conversations.length > 0 
        ? Math.round(conversations.reduce((sum, c) => sum + (c.initial_mood || 0), 0) / conversations.length)
        : 0,
      total_duration: conversations.reduce((sum, c) => sum + (c.duration || 0), 0),
      streak: 0 // TODO: Implement streak calculation
    };
    
    const responseData = {
      ...parsedProfile,
      stats
    };
    
    logger.info('Full response being sent to client:', responseData);
    res.json(responseData);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    next(error);
  }
});

// Create or update profile
router.post('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const profileData = req.body;
    
    logger.info('Creating/updating profile for:', profileData.name);
    
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
router.put('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const profileData = req.body;
    
    logger.info('Updating profile for:', profileData.name);
    
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
    
    const personalDetails = JSON.parse(profile.personal_details || '{}');
    res.json({ personalDetails });
  } catch (error) {
    logger.error('Error fetching therapist brain data:', error);
    next(error);
  }
});

// Update therapist brain data
router.post('/brain', async (req, res, next) => {
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
    let personalDetails = JSON.parse(profile.personal_details || '{}');
    
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