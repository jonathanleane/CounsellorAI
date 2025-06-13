#!/bin/bash

echo "🧪 Testing CounsellorAI API Endpoints"
echo "===================================="

# Test health endpoint
echo -e "\n📍 Testing Health Endpoint..."
curl -s http://localhost:3001/api/health | jq .

# Test models endpoint
echo -e "\n🤖 Testing Models Endpoint..."
curl -s http://localhost:3001/api/test/ai/models | jq .

# Test GPT-4 Turbo
echo -e "\n💬 Testing GPT-4 Turbo..."
curl -s -X POST http://localhost:3001/api/test/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel anxious about my job interview tomorrow. Any advice?",
    "model": "gpt-4-turbo-preview"
  }' | jq .

# Test Claude 3 Sonnet
echo -e "\n💬 Testing Claude 3 Sonnet..."
curl -s -X POST http://localhost:3001/api/test/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel anxious about my job interview tomorrow. Any advice?",
    "model": "claude-3-sonnet-20240229"
  }' | jq .

# Test Gemini Pro
echo -e "\n💬 Testing Gemini Pro..."
curl -s -X POST http://localhost:3001/api/test/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel anxious about my job interview tomorrow. Any advice?",
    "model": "gemini-pro"
  }' | jq .

echo -e "\n✅ Tests complete!"