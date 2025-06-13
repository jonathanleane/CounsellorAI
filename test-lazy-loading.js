// Test script to verify lazy loading of AI providers
// Run with: node test-lazy-loading.js

// Test 1: Only OpenAI key set
console.log('\n=== Test 1: Only OpenAI key set ===');
process.env.OPENAI_API_KEY = 'test-key';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.GOOGLE_AI_API_KEY;

try {
  // Clear module cache
  delete require.cache[require.resolve('./server/dist/services/ai/index.js')];
  const { aiService } = require('./server/dist/services/ai/index.js');
  
  const models = aiService.getAvailableModels();
  console.log('Available providers:', models.filter(m => m.available).map(m => `${m.provider}`).filter((v, i, a) => a.indexOf(v) === i));
  console.log('Success: Server starts with only OpenAI key');
} catch (error) {
  console.error('Failed:', error.message);
}

// Test 2: No API keys set
console.log('\n=== Test 2: No API keys set ===');
delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
delete process.env.GOOGLE_AI_API_KEY;

try {
  // Clear module cache
  delete require.cache[require.resolve('./server/dist/services/ai/index.js')];
  const { aiService } = require('./server/dist/services/ai/index.js');
  
  const models = aiService.getAvailableModels();
  const availableCount = models.filter(m => m.available).length;
  console.log('Available models:', availableCount);
  console.log('Success: Server starts but no models available');
} catch (error) {
  console.error('Failed:', error.message);
}

// Test 3: Multiple keys set
console.log('\n=== Test 3: Multiple keys set ===');
process.env.OPENAI_API_KEY = 'test-key-1';
process.env.ANTHROPIC_API_KEY = 'test-key-2';

try {
  // Clear module cache
  delete require.cache[require.resolve('./server/dist/services/ai/index.js')];
  const { aiService } = require('./server/dist/services/ai/index.js');
  
  const models = aiService.getAvailableModels();
  console.log('Available providers:', models.filter(m => m.available).map(m => `${m.provider}`).filter((v, i, a) => a.indexOf(v) === i));
  console.log('Success: Server starts with multiple providers');
} catch (error) {
  console.error('Failed:', error.message);
}

console.log('\n=== All tests completed ===');