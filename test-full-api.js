const axios = require('axios');
const colors = require('colors/safe');

const API_BASE = 'http://localhost:3001/api';

// Helper to print test results
function printResult(test/*: string*/, success/*: boolean*/, details/*: string*/ = '') {
  if (success) {
    console.log(colors.green(`✓ ${test}`));
    if (details) console.log(colors.gray(`  ${details}`));
  } else {
    console.log(colors.red(`✗ ${test}`));
    if (details) console.log(colors.red(`  ${details}`));
  }
}

// Test data
let profileId;
let sessionId;
let messageId;

async function testHealthEndpoints() {
  console.log(colors.bold('\n🏥 Testing Health Endpoints'));
  
  try {
    // Test health check
    const health = await axios.get(`${API_BASE}/health`);
    printResult('GET /api/health', health.data.status === 'healthy', `Status: ${health.data.status}`);
    
    // Test models endpoint
    const models = await axios.get(`${API_BASE}/test/ai/models`);
    printResult('GET /api/test/ai/models', models.data.ready, `Configured: OpenAI=${models.data.configured.openai}, Anthropic=${models.data.configured.anthropic}, Google=${models.data.configured.google}`);
  } catch (error) {
    printResult('Health endpoints', false, error.message);
  }
}

async function testProfileEndpoints() {
  console.log(colors.bold('\n👤 Testing Profile Endpoints'));
  
  try {
    // Test getting profile (should not exist initially)
    try {
      await axios.get(`${API_BASE}/profile`);
      printResult('GET /api/profile (no profile)', false, 'Expected 404 but got success');
    } catch (error) {
      if (error.response?.status === 404) {
        printResult('GET /api/profile (no profile)', true, 'Correctly returned 404');
      }
    }
    
    // Create profile
    const profileData = {
      name: 'Test User',
      demographics: { age: '30', gender: 'non-binary' },
      spirituality: { beliefs: 'Secular', importance: 'Low' },
      therapy_goals: { primary_goal: 'Reduce anxiety', secondary_goals: 'Improve relationships' },
      preferences: { communication_style: 'Direct', approach: 'CBT' },
      health: { physical_conditions: 'None', medications: 'None' },
      mental_health_screening: { previous_therapy: 'Yes', current_challenges: 'Anxiety, stress' },
      sensitive_topics: { avoid_topics: 'None' }
    };
    
    const createProfile = await axios.post(`${API_BASE}/profile`, profileData);
    printResult('POST /api/profile', createProfile.status === 201, `Created profile for ${createProfile.data.name}`);
    
    // Get profile again
    const getProfile = await axios.get(`${API_BASE}/profile`);
    printResult('GET /api/profile', getProfile.data.name === 'Test User', `Retrieved profile: ${getProfile.data.name}`);
    
    // Test therapist brain endpoints
    const getBrain = await axios.get(`${API_BASE}/profile/brain`);
    printResult('GET /api/profile/brain', true, 'Retrieved brain data');
    
    // Update brain data
    const brainUpdate = await axios.post(`${API_BASE}/profile/brain`, {
      category: 'personalProfile',
      field: 'occupation',
      value: 'Software Developer'
    });
    printResult('POST /api/profile/brain', brainUpdate.data.success, 'Updated brain data');
    
    // Verify brain update
    const getBrainAgain = await axios.get(`${API_BASE}/profile/brain`);
    const hasOccupation = getBrainAgain.data.personalDetails?.personalProfile?.occupation === 'Software Developer';
    printResult('Brain data persistence', hasOccupation, hasOccupation ? 'Occupation saved correctly' : 'Occupation not saved');
    
  } catch (error) {
    printResult('Profile endpoints', false, error.message);
  }
}

async function testSessionEndpoints() {
  console.log(colors.bold('\n💬 Testing Session Endpoints'));
  
  try {
    // Get sessions (should be empty)
    const getSessions = await axios.get(`${API_BASE}/sessions`);
    printResult('GET /api/sessions', Array.isArray(getSessions.data), `Found ${getSessions.data.length} sessions`);
    
    // Create new session
    const createSession = await axios.post(`${API_BASE}/sessions`, {
      session_type: 'standard',
      initial_mood: 7,
      model: 'gpt-4-turbo-preview'
    });
    sessionId = createSession.data.id;
    printResult('POST /api/sessions', createSession.status === 201 && createSession.data.messages.length > 0, `Created session ${sessionId} with greeting`);
    
    // Get specific session
    const getSession = await axios.get(`${API_BASE}/sessions/${sessionId}`);
    printResult('GET /api/sessions/:id', getSession.data.id === sessionId, `Retrieved session ${sessionId}`);
    
    // Get recent sessions
    const getRecent = await axios.get(`${API_BASE}/sessions/recent`);
    printResult('GET /api/sessions/recent', getRecent.data.length >= 1, `Found ${getRecent.data.length} recent sessions`);
    
    // Add message to session
    const addMessage = await axios.post(`${API_BASE}/sessions/${sessionId}/messages`, {
      content: 'I am feeling anxious about my upcoming presentation. Can you help me prepare?'
    });
    printResult('POST /api/sessions/:id/messages', addMessage.data.success, `AI responded, cost: $${addMessage.data.cost?.toFixed(4) || 'N/A'}`);
    
    // Test another AI model
    const addMessageClaude = await axios.post(`${API_BASE}/sessions`, {
      session_type: 'standard',
      initial_mood: 6,
      model: 'claude-3-sonnet-20240229'
    });
    const claudeSessionId = addMessageClaude.data.id;
    
    const claudeMessage = await axios.post(`${API_BASE}/sessions/${claudeSessionId}/messages`, {
      content: 'What are some mindfulness techniques I can use?'
    });
    printResult('Claude 3 Sonnet response', claudeMessage.data.success, `Cost: $${claudeMessage.data.cost?.toFixed(4) || 'N/A'}`);
    
    // End session
    const endSession = await axios.post(`${API_BASE}/sessions/${sessionId}/end`, {
      duration: 300 // 5 minutes
    });
    printResult('POST /api/sessions/:id/end', endSession.data.success, 'Session ended successfully');
    
    // Wait a bit for summary generation
    console.log(colors.gray('  Waiting for summary generation...'));
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if summary was generated
    const getEndedSession = await axios.get(`${API_BASE}/sessions/${sessionId}`);
    const hasSummary = !!getEndedSession.data.ai_summary;
    printResult('Session summary generation', hasSummary, hasSummary ? 'Summary generated' : 'No summary');
    
    // Delete the Claude session
    const deleteSession = await axios.delete(`${API_BASE}/sessions/${claudeSessionId}`);
    printResult('DELETE /api/sessions/:id', deleteSession.data.message.includes('successfully'), 'Session deleted');
    
  } catch (error) {
    printResult('Session endpoints', false, error.response?.data?.error?.message || error.message);
  }
}

async function testAIModels() {
  console.log(colors.bold('\n🤖 Testing All AI Models'));
  
  const testMessage = 'I need help managing stress at work. What techniques would you recommend?';
  
  // Test each available model
  const models = [
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
    { id: 'gemini-pro', name: 'Gemini Pro' }
  ];
  
  for (const model of models) {
    try {
      console.log(colors.gray(`\n  Testing ${model.name}...`));
      const start = Date.now();
      
      const response = await axios.post(`${API_BASE}/test/ai`, {
        message: testMessage,
        model: model.id
      });
      
      const elapsed = Date.now() - start;
      printResult(
        `${model.name} response`, 
        response.data.success, 
        `${elapsed}ms, ${response.data.usage?.totalTokens || 'N/A'} tokens, $${response.data.cost?.toFixed(4) || 'N/A'}`
      );
      
      // Print first 100 chars of response
      console.log(colors.gray(`  Response: "${response.data.response.substring(0, 100)}..."`));
      
    } catch (error) {
      printResult(`${model.name} response`, false, error.response?.data?.error?.message || error.message);
    }
  }
}

async function testEdgeCases() {
  console.log(colors.bold('\n🔧 Testing Edge Cases'));
  
  try {
    // Test invalid session ID
    try {
      await axios.get(`${API_BASE}/sessions/invalid-id`);
      printResult('Invalid session ID', false, 'Expected 404');
    } catch (error) {
      if (error.response?.status === 404) {
        printResult('Invalid session ID handling', true, 'Correctly returned 404');
      }
    }
    
    // Test missing required fields
    try {
      await axios.post(`${API_BASE}/profile/brain`, { category: 'test' });
      printResult('Missing required fields', false, 'Expected 400');
    } catch (error) {
      if (error.response?.status === 400) {
        printResult('Missing field validation', true, 'Correctly returned 400');
      }
    }
    
    // Test rate limiting (if we make too many requests)
    // This is just informational, not a failure
    console.log(colors.gray('  Rate limiting is configured at 100 requests per 15 minutes'));
    
  } catch (error) {
    printResult('Edge cases', false, error.message);
  }
}

async function runAllTests() {
  console.log(colors.bold.blue('🧪 CounsellorAI Comprehensive API Tests\n'));
  console.log(colors.gray('Make sure the server is running on http://localhost:3001\n'));
  
  try {
    // Check if server is running
    await axios.get(`${API_BASE}/health`);
  } catch (error) {
    console.log(colors.red('❌ Server is not running! Please start it first.'));
    process.exit(1);
  }
  
  await testHealthEndpoints();
  await testProfileEndpoints();
  await testSessionEndpoints();
  await testAIModels();
  await testEdgeCases();
  
  console.log(colors.bold.green('\n✅ All tests completed!'));
}

// Add colors support
require('colors');

runAllTests().catch(error => {
  console.error(colors.red('\n❌ Test suite failed:'), error.message);
  process.exit(1);
});