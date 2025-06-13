import { Router } from 'express';
import { aiService, AIModel } from '../services/ai';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Test AI models endpoint
router.post('/ai', aiRateLimiter, async (req, res, next) => {
  try {
    const { message, model } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: { message: 'Message is required' }
      });
    }

    // Get available models
    const availableModels = aiService.getAvailableModels();
    const selectedModel = model || AIModel.GPT4_Turbo;
    
    // Check if model is available
    const modelInfo = availableModels.find(m => m.model === selectedModel);
    if (!modelInfo?.available) {
      return res.status(400).json({
        error: { message: `Model ${selectedModel} is not available` }
      });
    }

    // Test conversation
    const messages = [
      { role: 'user', content: message }
    ];

    // Mock profile for testing
    const mockProfile = {
      name: 'Test User',
      demographics: { age: '30', gender: 'non-binary' },
      therapy_goals: { primary_goal: 'Testing AI responses' }
    };

    const response = await aiService.generateResponse(messages, mockProfile, selectedModel);

    res.json({
      success: true,
      model: selectedModel,
      response: response.content,
      usage: response.usage,
      cost: response.usage ? aiService.estimateCost(
        selectedModel,
        response.usage.inputTokens,
        response.usage.outputTokens
      ) : undefined
    });
  } catch (error) {
    next(error);
  }
});

// Test all available models
router.get('/ai/models', async (req, res) => {
  const models = aiService.getAvailableModels();
  const configured = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_AI_API_KEY
  };

  res.json({
    models,
    configured,
    ready: Object.values(configured).some(v => v)
  });
});

// Test summary generation
router.post('/ai/summary', aiRateLimiter, async (req, res, next) => {
  try {
    const { messages, model } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: { message: 'Messages array is required' }
      });
    }

    const selectedModel = model || AIModel.GPT4_Turbo;
    const summary = await aiService.generateSummary(messages, {}, selectedModel);

    res.json({
      success: true,
      model: selectedModel,
      summary
    });
  } catch (error) {
    next(error);
  }
});

export default router;