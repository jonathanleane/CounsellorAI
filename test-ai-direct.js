// Direct test of AI models without running the full server
require('dotenv').config();

const axios = require('axios');

async function testOpenAI() {
  console.log('Testing OpenAI GPT-4...');
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful AI therapist.' },
        { role: 'user', content: 'Hello, I\'m feeling anxious about a presentation tomorrow.' }
      ],
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ OpenAI Response:', response.data.choices[0].message.content);
    console.log('   Tokens used:', response.data.usage.total_tokens);
  } catch (error) {
    console.log('❌ OpenAI Error:', error.response?.data?.error?.message || error.message);
  }
}

async function testAnthropic() {
  console.log('\nTesting Anthropic Claude 3...');
  try {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20240229',
      messages: [
        { role: 'user', content: 'Hello, I\'m feeling anxious about a presentation tomorrow. Can you help?' }
      ],
      max_tokens: 150
    }, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Anthropic Response:', response.data.content[0].text);
    console.log('   Tokens used:', response.data.usage.input_tokens + response.data.usage.output_tokens);
  } catch (error) {
    console.log('❌ Anthropic Error:', error.response?.data?.error?.message || error.message);
  }
}

async function testGemini() {
  console.log('\nTesting Google Gemini...');
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Hello, I\'m feeling anxious about a presentation tomorrow. Can you help?'
          }]
        }]
      }
    );
    
    console.log('✅ Gemini Response:', response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.log('❌ Gemini Error:', error.response?.data?.error?.message || error.message);
  }
}

async function testAll() {
  console.log('🧪 Testing AI Models with your API keys...\n');
  
  await testOpenAI();
  await testAnthropic();
  await testGemini();
  
  console.log('\n✨ Test complete!');
}

testAll();