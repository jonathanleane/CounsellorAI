import { Router } from 'express';
import { getDatabase } from '../services/database';
import { logger } from '../utils/logger';
import { csrfProtection } from '../middleware/csrf';
import { authenticateToken } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { safeParse, safeParseArray, safeParseObject } from '../utils/safeParse';

const router = Router();

// Apply authentication to all export routes
router.use(authenticateToken);

// Export all user data as JSON
router.get('/export/json', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get profile data
    const profile = await db.getProfile();
    
    // Get all conversations
    const conversations = await db.getAllConversations();
    
    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await db.getMessages(conv.id);
        return { ...conv, messages };
      })
    );
    
    // Parse JSON fields in profile
    const parsedProfile = profile ? {
      ...profile,
      demographics: safeParseObject(profile.demographics, 'export.json.demographics'),
      spirituality: safeParseObject(profile.spirituality, 'export.json.spirituality'),
      therapy_goals: safeParseObject(profile.therapy_goals, 'export.json.therapy_goals'),
      preferences: safeParseObject(profile.preferences, 'export.json.preferences'),
      health: safeParseObject(profile.health, 'export.json.health'),
      mental_health_screening: safeParseObject(profile.mental_health_screening, 'export.json.mental_health_screening'),
      sensitive_topics: safeParseObject(profile.sensitive_topics, 'export.json.sensitive_topics'),
      personal_details: safeParseObject(profile.personal_details, 'export.json.personal_details')
    } : null;
    
    // Parse JSON fields in conversations
    const parsedConversations = conversationsWithMessages.map(conv => ({
      ...conv,
      identified_patterns: safeParseArray(conv.identified_patterns, 'export.json.patterns'),
      followup_suggestions: safeParseArray(conv.followup_suggestions, 'export.json.suggestions')
    }));
    
    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      profile: parsedProfile,
      conversations: parsedConversations,
      statistics: {
        totalConversations: conversations.length,
        totalMessages: parsedConversations.reduce((sum, conv) => sum + conv.messages.length, 0),
        firstSession: conversations.length > 0 ? conversations[conversations.length - 1].timestamp : null,
        lastSession: conversations.length > 0 ? conversations[0].timestamp : null
      }
    };
    
    logger.info('User data exported as JSON');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=counsellor-ai-export.json');
    res.json(exportData);
    
  } catch (error) {
    logger.error('Error exporting data as JSON:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Export all user data as formatted text
router.get('/export/text', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get profile data
    const profile = await db.getProfile();
    
    // Get all conversations
    const conversations = await db.getAllConversations();
    
    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await db.getMessages(conv.id);
        return { ...conv, messages };
      })
    );
    
    // Build text output
    let output = '=== COUNSELLOR AI DATA EXPORT ===\n';
    output += `Export Date: ${new Date().toISOString()}\n\n`;
    
    // Profile section
    if (profile) {
      output += '=== YOUR PROFILE ===\n';
      output += `Name: ${profile.name}\n`;
      
      if (profile.demographics) {
        const demo = safeParseObject(profile.demographics, 'export.text.demographics');
        output += `Age: ${demo.age || 'Not specified'}\n`;
        output += `Gender: ${demo.gender || 'Not specified'}\n`;
      }
      
      if (profile.therapy_goals) {
        const goals = safeParseObject(profile.therapy_goals, 'export.text.therapy_goals');
        output += `\nTherapy Goals:\n`;
        output += `Primary: ${goals.primary_goal || 'Not specified'}\n`;
        output += `Secondary: ${goals.secondary_goals || 'Not specified'}\n`;
      }
      
      output += '\n';
    }
    
    // Conversations section
    output += '=== THERAPY SESSIONS ===\n';
    output += `Total Sessions: ${conversations.length}\n\n`;
    
    for (const conv of conversationsWithMessages) {
      output += `--- Session ${conv.id} ---\n`;
      output += `Date: ${conv.timestamp}\n`;
      output += `Type: ${conv.session_type}\n`;
      output += `Duration: ${conv.duration ? Math.round(conv.duration / 60) + ' minutes' : 'Not recorded'}\n`;
      output += `Initial Mood: ${conv.initial_mood || 'Not recorded'}\n`;
      output += `End Mood: ${conv.end_mood || 'Not recorded'}\n`;
      
      if (conv.ai_summary) {
        output += `\nSummary:\n${conv.ai_summary}\n`;
      }
      
      output += `\nConversation:\n`;
      for (const msg of conv.messages) {
        const role = msg.role === 'user' ? 'You' : 'Therapist';
        output += `\n[${role}]: ${msg.content}\n`;
      }
      
      output += '\n' + '='.repeat(50) + '\n\n';
    }
    
    logger.info('User data exported as text');
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=counsellor-ai-export.txt');
    res.send(output);
    
  } catch (error) {
    logger.error('Error exporting data as text:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Export all user data as ZIP archive
router.get('/export/archive', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Create archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=counsellor-ai-export.zip');
    
    // Pipe archive data to response
    archive.pipe(res);
    
    // Get all data
    const profile = await db.getProfile();
    const conversations = await db.getAllConversations();
    
    // Add profile as JSON
    if (profile) {
      const parsedProfile = {
        ...profile,
        demographics: safeParseObject(profile.demographics, 'export.archive.demographics'),
        spirituality: safeParseObject(profile.spirituality, 'export.archive.spirituality'),
        therapy_goals: safeParseObject(profile.therapy_goals, 'export.archive.therapy_goals'),
        preferences: safeParseObject(profile.preferences, 'export.archive.preferences'),
        health: safeParseObject(profile.health, 'export.archive.health'),
        mental_health_screening: safeParseObject(profile.mental_health_screening, 'export.archive.mental_health_screening'),
        sensitive_topics: safeParseObject(profile.sensitive_topics, 'export.archive.sensitive_topics'),
        personal_details: safeParseObject(profile.personal_details, 'export.archive.personal_details')
      };
      
      archive.append(JSON.stringify(parsedProfile, null, 2), { name: 'profile.json' });
    }
    
    // Add each conversation as separate file
    for (const conv of conversations) {
      const messages = await db.getMessages(conv.id);
      const conversationData = {
        ...conv,
        messages,
        identified_patterns: safeParseArray(conv.identified_patterns, 'export.archive.patterns'),
        followup_suggestions: safeParseArray(conv.followup_suggestions, 'export.archive.suggestions')
      };
      
      const filename = `conversations/session_${conv.id}_${conv.timestamp?.split('T')[0] || 'unknown'}.json`;
      archive.append(JSON.stringify(conversationData, null, 2), { name: filename });
    }
    
    // Add README
    const readme = `CounsellorAI Data Export
========================

This archive contains all your CounsellorAI data.

Contents:
- profile.json: Your profile information and preferences
- conversations/: All your therapy sessions

Each conversation file includes:
- Session metadata (date, duration, mood ratings)
- Complete message history
- AI-generated summaries and insights

To import this data into another CounsellorAI instance,
use the import feature (coming soon).

Export date: ${new Date().toISOString()}
`;
    
    archive.append(readme, { name: 'README.txt' });
    
    // Finalize archive
    archive.finalize();
    
    logger.info('User data exported as archive');
    
  } catch (error) {
    logger.error('Error exporting data as archive:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Delete all user data (GDPR right to erasure)
router.delete('/export/delete-all', csrfProtection, async (req, res) => {
  try {
    const { confirmation } = req.body;
    
    if (confirmation !== 'DELETE_ALL_MY_DATA') {
      return res.status(400).json({ 
        error: 'Invalid confirmation. Send { "confirmation": "DELETE_ALL_MY_DATA" }' 
      });
    }
    
    const db = getDatabase();
    
    // Get all conversations
    const conversations = await db.getAllConversations();
    
    // Delete all conversations (messages will cascade delete)
    for (const conv of conversations) {
      await db.deleteConversation(conv.id);
    }
    
    // Delete profile
    await db.updateProfile('name', '');
    await db.updateProfile('demographics', '{}');
    await db.updateProfile('spirituality', '{}');
    await db.updateProfile('therapy_goals', '{}');
    await db.updateProfile('preferences', '{}');
    await db.updateProfile('health', '{}');
    await db.updateProfile('mental_health_screening', '{}');
    await db.updateProfile('sensitive_topics', '{}');
    await db.updateProfile('personal_details', '{}');
    await db.updateProfile('intake_completed', 0);
    
    logger.warn('All user data deleted per user request');
    
    return res.json({ 
      success: true, 
      message: 'All your data has been permanently deleted',
      deletedConversations: conversations.length
    });
    
  } catch (error) {
    logger.error('Error deleting user data:', error);
    return res.status(500).json({ error: 'Failed to delete data' });
  }
});

export default router;