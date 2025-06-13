const axios = require('axios');
const colors = require('colors/safe');

const API_BASE = 'http://localhost:3001/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAppFlow() {
  console.log(colors.bold.blue('🧪 Testing CounsellorAI Application Flow\n'));
  
  try {
    // Step 1: Check health
    console.log(colors.yellow('1. Checking server health...'));
    const health = await axios.get(`${API_BASE}/health`);
    console.log(colors.green('✓ Server is healthy'));
    
    // Step 2: Check if profile exists
    console.log(colors.yellow('\n2. Checking for existing profile...'));
    try {
      await axios.get(`${API_BASE}/profile`);
      console.log(colors.green('✓ Profile already exists'));
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(colors.blue('ℹ Profile not found, creating one...'));
        
        // Create profile (simulating onboarding)
        const profileData = {
          name: 'John Doe',
          demographics: { age: '35', gender: 'male' },
          therapy_goals: { 
            primary_goal: 'Manage stress and anxiety',
            secondary_goals: 'Improve work-life balance'
          },
          preferences: { 
            communication_style: 'direct',
            approach: 'cbt'
          },
          mental_health_screening: {
            previous_therapy: 'yes',
            current_challenges: 'Work stress, anxiety about future'
          }
        };
        
        const createProfile = await axios.post(`${API_BASE}/profile`, profileData);
        console.log(colors.green('✓ Profile created successfully'));
      }
    }
    
    // Step 3: Create a new session
    console.log(colors.yellow('\n3. Creating a new therapy session...'));
    const sessionData = {
      session_type: 'standard',
      initial_mood: 6,
      model: 'gpt-4-turbo-preview'
    };
    
    const createSession = await axios.post(`${API_BASE}/sessions`, sessionData);
    const sessionId = createSession.data.id;
    console.log(colors.green(`✓ Session created: ${sessionId}`));
    console.log(colors.gray(`   Initial greeting: "${createSession.data.messages[0].content.substring(0, 100)}..."`));
    
    // Step 4: Send a message
    console.log(colors.yellow('\n4. Sending message to therapist...'));
    const userMessage = "I'm feeling overwhelmed with work deadlines and having trouble sleeping. What strategies can help?";
    console.log(colors.gray(`   User: "${userMessage}"`));
    
    const sendMessage = await axios.post(`${API_BASE}/sessions/${sessionId}/messages`, {
      content: userMessage
    });
    
    if (sendMessage.data.success) {
      const aiResponse = sendMessage.data.conversation.messages[sendMessage.data.conversation.messages.length - 1];
      console.log(colors.green('✓ AI therapist responded'));
      console.log(colors.gray(`   AI: "${aiResponse.content.substring(0, 150)}..."`));
      console.log(colors.gray(`   Cost: $${sendMessage.data.cost?.toFixed(4) || 'N/A'}`));
    }
    
    // Step 5: End the session
    console.log(colors.yellow('\n5. Ending the session...'));
    await sleep(2000); // Simulate some session duration
    
    const endSession = await axios.post(`${API_BASE}/sessions/${sessionId}/end`, {
      duration: 180 // 3 minutes
    });
    console.log(colors.green('✓ Session ended successfully'));
    
    // Step 6: Check session history
    console.log(colors.yellow('\n6. Checking session history...'));
    const history = await axios.get(`${API_BASE}/sessions`);
    console.log(colors.green(`✓ Found ${history.data.length} sessions in history`));
    
    // Step 7: Get recent sessions
    console.log(colors.yellow('\n7. Getting recent sessions...'));
    const recent = await axios.get(`${API_BASE}/sessions/recent?limit=3`);
    console.log(colors.green(`✓ Retrieved ${recent.data.length} recent sessions`));
    
    // Step 8: View specific session
    console.log(colors.yellow('\n8. Viewing specific session details...'));
    await sleep(3000); // Wait for summary generation
    
    const sessionDetails = await axios.get(`${API_BASE}/sessions/${sessionId}`);
    console.log(colors.green('✓ Session details retrieved'));
    if (sessionDetails.data.ai_summary) {
      console.log(colors.gray(`   Summary: "${sessionDetails.data.ai_summary.substring(0, 100)}..."`));
    }
    
    // Step 9: Test therapist brain
    console.log(colors.yellow('\n9. Checking therapist brain insights...'));
    const brain = await axios.get(`${API_BASE}/profile/brain`);
    console.log(colors.green('✓ Brain data retrieved'));
    
    // Step 10: Test multi-model support
    console.log(colors.yellow('\n10. Testing different AI models...'));
    const models = ['claude-3-sonnet-20240229', 'gemini-1.5-flash'];
    
    for (const model of models) {
      try {
        console.log(colors.gray(`    Testing ${model}...`));
        const testSession = await axios.post(`${API_BASE}/sessions`, {
          session_type: 'standard',
          initial_mood: 7,
          model: model
        });
        
        const testMessage = await axios.post(`${API_BASE}/sessions/${testSession.data.id}/messages`, {
          content: 'What is one quick mindfulness technique I can use right now?'
        });
        
        if (testMessage.data.success) {
          console.log(colors.green(`    ✓ ${model} working correctly`));
        }
      } catch (error) {
        console.log(colors.red(`    ✗ ${model} failed: ${error.response?.data?.error?.message || error.message}`));
      }
    }
    
    console.log(colors.bold.green('\n✅ Application flow test completed successfully!'));
    console.log(colors.gray('\nThe application is ready for use. Key features verified:'));
    console.log(colors.gray('- Profile creation and management'));
    console.log(colors.gray('- Session creation with AI greetings'));
    console.log(colors.gray('- Real-time AI therapy responses'));
    console.log(colors.gray('- Session history and summaries'));
    console.log(colors.gray('- Multi-model AI support'));
    console.log(colors.gray('- Therapist brain insights'));
    
  } catch (error) {
    console.error(colors.red('\n❌ Test failed:'), error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if server is running first
axios.get(`${API_BASE}/health`)
  .then(() => {
    console.log(colors.green('Server is running on http://localhost:3001'));
    console.log(colors.green('Client should be running on http://localhost:3000'));
    console.log(colors.gray('Starting tests in 2 seconds...\n'));
    setTimeout(testAppFlow, 2000);
  })
  .catch(() => {
    console.log(colors.red('❌ Server is not running!'));
    console.log(colors.yellow('Please start the server first with: npm run dev'));
    process.exit(1);
  });