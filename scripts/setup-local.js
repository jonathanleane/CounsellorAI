#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🚀 CounsellorAI Local Setup\n');

  // Check if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  // Collect API keys
  console.log('\n📝 API Configuration');
  console.log('You need at least one AI provider API key to use CounsellorAI.\n');

  const openaiKey = await question('OpenAI API Key (optional): ');
  const anthropicKey = await question('Anthropic API Key (optional): ');
  const googleKey = await question('Google AI API Key (optional): ');

  if (!openaiKey && !anthropicKey && !googleKey) {
    console.error('\n❌ Error: At least one API key is required.');
    process.exit(1);
  }

  // Create .env file
  const envContent = `# API Keys
OPENAI_API_KEY=${openaiKey}
ANTHROPIC_API_KEY=${anthropicKey}
GOOGLE_AI_API_KEY=${googleKey}

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
USE_FIREBASE=false

# Security
SESSION_SECRET=${generateRandomString(32)}
ENCRYPTION_KEY=${generateRandomString(32)}

# Default AI Settings
DEFAULT_AI_MODEL=gpt-4-turbo-preview
MAX_TOKENS=16384
AI_TEMPERATURE=0.7

# Timezone
DEFAULT_TIMEZONE=UTC
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Created .env file');

  // Install dependencies
  console.log('\n📦 Installing dependencies...\n');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    execSync('cd server && npm install', { stdio: 'inherit' });
    execSync('cd client && npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Error installing dependencies:', error.message);
    process.exit(1);
  }

  // Create necessary directories
  const dirs = ['logs', 'database', 'user-data', 'exports'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  console.log('\n✅ Setup complete!');
  console.log('\n🎉 You can now start CounsellorAI with: npm run dev\n');

  rl.close();
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});