import { Router } from 'express';
import { getDatabase } from '../services/database';
import { logger } from '../utils/logger';

const router = Router();

// Get user profile
router.get('/', async (req, res, next) => {
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
    
    res.json(parsedProfile);
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