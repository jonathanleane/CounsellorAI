const axios = require('axios');
const colors = require('colors/safe');

const API_BASE = 'http://localhost:3001/api';

async function quickSetup() {
  console.log(colors.bold.blue('🚀 Quick Setup for CounsellorAI\n'));
  
  try {
    // Check if profile already exists
    try {
      const existing = await axios.get(`${API_BASE}/profile`);
      console.log(colors.yellow('⚠️  Profile already exists for: ' + existing.data.name));
      console.log(colors.gray('   Delete the database if you want to start fresh.'));
      return;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(colors.green('✓ No existing profile found, creating one...'));
      }
    }
    
    // Create a default profile
    const profileData = {
      name: 'Test User',
      demographics: { 
        age: '30', 
        gender: 'prefer not to say' 
      },
      spirituality: { 
        beliefs: 'Not specified', 
        importance: 'Medium' 
      },
      therapy_goals: { 
        primary_goal: 'Manage stress and improve well-being',
        secondary_goals: 'Better work-life balance, improved sleep' 
      },
      preferences: { 
        communication_style: 'direct',
        approach: 'cbt' 
      },
      health: { 
        physical_conditions: 'None specified', 
        medications: 'None' 
      },
      mental_health_screening: { 
        previous_therapy: 'no',
        current_challenges: 'Work stress, occasional anxiety' 
      },
      sensitive_topics: { 
        avoid_topics: 'None specified' 
      }
    };
    
    const createProfile = await axios.post(`${API_BASE}/profile`, profileData);
    console.log(colors.green('✓ Profile created successfully!'));
    console.log(colors.gray(`   Name: ${createProfile.data.name}`));
    console.log(colors.gray(`   Primary Goal: ${profileData.therapy_goals.primary_goal}`));
    
    console.log(colors.bold.green('\n✅ Setup complete!'));
    console.log(colors.cyan('\nYou can now:'));
    console.log(colors.cyan('1. Go to http://localhost:3000 to access the dashboard'));
    console.log(colors.cyan('2. Start a new therapy session'));
    console.log(colors.cyan('3. Or go through the onboarding to customize your profile'));
    
  } catch (error) {
    console.error(colors.red('❌ Setup failed:'), error.response?.data || error.message);
  }
}

// Check if server is running
axios.get(`${API_BASE}/health`)
  .then(() => {
    quickSetup();
  })
  .catch(() => {
    console.log(colors.red('❌ Server is not running!'));
    console.log(colors.yellow('Please start the server first with: npm run dev'));
  });