import { Router } from 'express';
import { getDatabase } from '../services/database';
import { aiService, AIModel } from '../services/ai';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { formatInTimeZone } from 'date-fns-tz';
import { sanitizeUserInput, detectInjectionAttempt } from '../utils/security';
import { mergePersonalDetails, sanitizePersonalDetails } from '../utils/personalDetailsMerger';
import { 
  validateBody, 
  validateQuery, 
  createSessionSchema, 
  addMessageSchema, 
  endSessionSchema, 
  limitQuerySchema 
} from '../validation/schemas';

const router = Router();

// Apply authentication to all session routes
router.use(authenticateToken);

// Get all sessions
router.get('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const conversations = await db.getAllConversations();
    
    // Parse JSON fields for each conversation
    const parsedConversations = conversations.map(conv => ({
      ...conv,
      identified_patterns: conv.identified_patterns ? JSON.parse(conv.identified_patterns) : [],
      followup_suggestions: conv.followup_suggestions ? JSON.parse(conv.followup_suggestions) : []
    }));
    
    res.json(parsedConversations);
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    next(error);
  }
});

// Get recent sessions
router.get('/recent', validateQuery(limitQuerySchema), async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const db = getDatabase();
    const conversations = await db.getRecentConversations(limit);
    
    // Parse JSON fields
    const parsedConversations = conversations.map(conv => ({
      ...conv,
      identified_patterns: conv.identified_patterns ? JSON.parse(conv.identified_patterns) : [],
      followup_suggestions: conv.followup_suggestions ? JSON.parse(conv.followup_suggestions) : []
    }));
    
    res.json(parsedConversations);
  } catch (error) {
    logger.error('Error fetching recent conversations:', error);
    next(error);
  }
});

// Get specific session
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const conversation = await db.getConversation(id);
    
    if (!conversation) {
      res.status(404).json({ error: { message: 'Session not found' } });
      return;
    }
    
    // Parse JSON fields
    const parsedConversation = {
      ...conversation,
      identified_patterns: conversation.identified_patterns ? JSON.parse(conversation.identified_patterns) : [],
      followup_suggestions: conversation.followup_suggestions ? JSON.parse(conversation.followup_suggestions) : []
    };
    
    res.json(parsedConversation);
  } catch (error) {
    logger.error('Error fetching conversation:', error);
    next(error);
  }
});

// Create new session
router.post('/', validateBody(createSessionSchema), aiRateLimiter, async (req, res, next) => {
  try {
    const { session_type, initial_mood, model } = req.body;
    const db = getDatabase();
    
    // Check if this is the first session and user hasn't completed intake
    const profile = await db.getProfile();
    const hasCompletedIntake = profile && profile.intake_completed;
    
    // Create the session
    const conversation = await db.createConversation({
      session_type: !hasCompletedIntake ? 'intake' : session_type || 'standard',
      initial_mood,
      model: model || process.env.DEFAULT_AI_MODEL
    });
    
    // Generate initial greeting
    if (!hasCompletedIntake) {
      // Intake session greeting
      await db.addMessage(conversation.id, {
        role: 'assistant',
        content: `Welcome ${profile?.name || 'there'}! I'm your AI therapist, and I'm here to support you on your journey toward better mental health and well-being. 

This is our first session together, so I'd like to spend some time getting to know you better. While I have some basic information from your profile, understanding more about your life context will help me provide more personalized support.

Could you tell me a bit about yourself? For instance, what's your current living situation and relationship status? Do you have a partner or family members who are important in your life?`
      });
    } else {
      // Regular session greeting with AI
      const recentSessions = await db.getRecentConversations(5);
      let lastSessionInfo = "This is your first session with the user.";
      
      if (recentSessions.length > 0) {
        const lastSession = recentSessions.find(s => 
          s.id !== conversation.id && s.status === 'completed'
        );
        
        if (lastSession) {
          const lastTimestamp = new Date(lastSession.timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - lastTimestamp.getTime();
          
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
          let timeAgo;
          if (minutes < 60) {
            timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
          } else if (hours < 24) {
            const remainingMinutes = minutes % 60;
            timeAgo = `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
          } else {
            const remainingHours = hours % 24;
            timeAgo = `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''}`;
          }
          
          const formattedDate = formatInTimeZone(
            lastTimestamp, 
            process.env.DEFAULT_TIMEZONE || 'UTC',
            'MMMM d, yyyy h:mm a'
          );
          
          lastSessionInfo = `The last session with the user was exactly ${timeAgo} ago (${formattedDate}). Make sure to note this precise time when greeting the user.`;
        }
      }
      
      // Generate AI greeting
      const messages = [
        {
          role: 'user',
          content: `[NEW_SESSION_START] ${lastSessionInfo} Please greet the user appropriately based on when you last spoke.`
        }
      ];
      
      try {
        const response = await aiService.generateResponse(
          messages,
          profile,
          conversation.model as AIModel
        );
        
        await db.addMessage(conversation.id, {
          role: 'assistant',
          content: response.content
        });
      } catch (error) {
        logger.error('Error generating AI greeting:', error);
        // Fallback greeting
        await db.addMessage(conversation.id, {
          role: 'assistant',
          content: `Hello ${profile?.name || 'there'}, how are you feeling today?`
        });
      }
    }
    
    // Return the conversation with the greeting message
    const updatedConversation = await db.getConversation(conversation.id);
    res.status(201).json(updatedConversation);
  } catch (error) {
    logger.error('Error creating conversation:', error);
    next(error);
  }
});

// Add message to session
router.post('/:id/messages', validateBody(addMessageSchema), aiRateLimiter, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const db = getDatabase();
    
    // Get conversation
    const conversation = await db.getConversation(id);
    if (!conversation) {
      res.status(404).json({ error: { message: 'Session not found' } });
      return;
    }
    
    if (conversation.status !== 'active') {
      res.status(400).json({ error: { message: 'Session is not active' } });
      return;
    }
    
    // Check for injection attempts
    if (detectInjectionAttempt(content)) {
      logger.warn(`Potential injection attempt in session ${id}`);
    }
    
    // Sanitize and add user message
    const sanitizedContent = sanitizeUserInput(content);
    await db.addMessage(id, {
      role: 'user',
      content: sanitizedContent
    });
    
    // Get profile for context
    const profile = await db.getProfile();
    
    // Prepare messages for AI
    const messages = conversation.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    messages.push({ role: 'user', content: sanitizedContent });
    
    // Generate AI response
    try {
      const response = await aiService.generateResponse(
        messages,
        profile,
        conversation.model as AIModel
      );
      
      // Add AI response
      await db.addMessage(id, {
        role: 'assistant',
        content: response.content
      });
      
      // Return updated conversation
      const updatedConversation = await db.getConversation(id);
      res.json({
        success: true,
        conversation: updatedConversation,
        usage: response.usage,
        cost: response.usage ? aiService.estimateCost(
          conversation.model as AIModel,
          response.usage.inputTokens,
          response.usage.outputTokens
        ) : undefined
      });
    } catch (error) {
      logger.error('Error generating AI response:', error);
      res.status(500).json({ error: { message: 'Failed to generate response' } });
    }
  } catch (error) {
    logger.error('Error adding message:', error);
    next(error);
  }
});

// End session
router.post('/:id/end', validateBody(endSessionSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;
    const db = getDatabase();
    
    // Get conversation
    const conversation = await db.getConversation(id);
    if (!conversation) {
      res.status(404).json({ error: { message: 'Session not found' } });
      return;
    }
    
    // Mark as ending
    await db.updateConversation(id, {
      status: 'ending',
      duration
    });
    
    // Generate summary asynchronously
    generateSessionSummary(id, conversation, duration).catch(error => {
      logger.error('Error generating session summary:', error);
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error ending session:', error);
    next(error);
  }
});

// Delete session
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Verify session exists
    const conversation = await db.getConversation(id);
    if (!conversation) {
      res.status(404).json({ error: { message: 'Session not found' } });
      return;
    }
    
    // Delete the conversation
    await db.deleteConversation(id);
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    next(error);
  }
});

// Helper function to generate session summary
async function generateSessionSummary(
  conversationId: string,
  conversation: any,
  duration: number
) {
  const db = getDatabase();
  
  try {
    // Get messages for summary
    const messages = conversation.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Generate summary using AI
    const summary = await aiService.generateSummary(
      messages,
      { initialMood: conversation.initial_mood },
      conversation.model as AIModel
    );
    
    // Check if automatic learning is enabled
    const enableAutoLearning = process.env.ENABLE_AUTO_LEARNING === 'true';
    let learnedDetails: any = null;
    let learningChanges: string[] = [];
    
    if (enableAutoLearning && messages.length > 2) { // Only learn from substantive conversations
      try {
        logger.info(`Extracting personal details from session ${conversationId}`);
        
        // Extract new personal details from conversation
        const newDetails = await aiService.extractPersonalDetails(
          messages,
          conversation.model as AIModel
        );
        
        // Sanitize extracted details
        const sanitizedNewDetails = sanitizePersonalDetails(newDetails);
        
        // Get current profile to merge with
        const profile = await db.getProfile();
        if (profile) {
          const currentDetails = JSON.parse(profile.personal_details || '{}');
          
          // Merge new details with existing
          const { merged, changes } = mergePersonalDetails(currentDetails, sanitizedNewDetails);
          
          if (changes.length > 0) {
            // Update profile with merged details
            await db.updateProfile('personal_details', merged);
            logger.info(`Updated personal details with ${changes.length} changes from session ${conversationId}`);
            
            learnedDetails = sanitizedNewDetails;
            learningChanges = changes;
          }
        }
      } catch (error) {
        logger.error(`Error extracting personal details from session ${conversationId}:`, error);
        // Continue without failing the summary
      }
    }
    
    // Update conversation with summary and learning info
    await db.updateConversation(conversationId, {
      status: 'completed',
      ai_summary: summary.summary,
      identified_patterns: JSON.stringify(summary.patterns),
      followup_suggestions: JSON.stringify(summary.followupSuggestions),
      learned_details: learnedDetails ? JSON.stringify(learnedDetails) : null,
      learning_changes: learningChanges.length > 0 ? JSON.stringify(learningChanges) : null
    });
    
    // If this was an intake session, mark intake as completed
    if (conversation.session_type === 'intake') {
      await db.updateProfile('intake_completed', 1); // SQLite stores boolean as 0/1
      logger.info(`Marked intake as completed for user after session ${conversationId}`);
    }
    
    logger.info(`Session ${conversationId} summary generated successfully`);
  } catch (error) {
    logger.error(`Error generating summary for session ${conversationId}:`, error);
    
    // Mark as completed even if summary fails
    await db.updateConversation(conversationId, {
      status: 'completed'
    });
  }
}

export default router;