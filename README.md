# CounsellorAI - Open Source AI Therapy Companion 🧠💬

> ## 🎯 About This Project
> 
> **CounsellorAI is an open source hobby project for experimenting with AI-powered mental health support.**
> 
> This is a personal project created for:
> - Learning and experimenting with AI therapy applications
> - Exploring mental health support technologies
> - Personal use and self-reflection
> - Contributing to open source mental health tools
> 
> **Security Features Implemented:**
> - ✅ JWT Authentication with bcrypt password hashing
> - ✅ Database encryption (SQLCipher with AES-256)
> - ✅ Data export for GDPR compliance
> - ✅ Input validation (Zod schemas)
> - ✅ SQL injection protection
> - ✅ Sensitive data redaction in logs
> - ✅ CSRF protection
> - ✅ Automatic backups with encryption
> 
> **Please Note:** While security best practices have been implemented, this is a hobby project. Use at your own discretion and comfort level.

## What is CounsellorAI?

CounsellorAI is a free, open-source AI therapist that provides personalized mental health support through natural conversations. Think of it as having a supportive, understanding therapist available 24/7 on your computer.

**Important**: This is NOT a replacement for professional mental health care. If you're in crisis, please contact emergency services or a crisis hotline.

## 🎯 Features

- 🤖 **Multiple AI Options**: Choose between GPT-4o (OpenAI), Claude 3.5 Sonnet (Anthropic), or Gemini 2.0 Flash (Google)
- 🔒 **Privacy Focused**: Run it on your own computer - your conversations stay private
- 💬 **Natural Conversations**: Chat like you would with a real therapist
- 📊 **Track Your Progress**: See your mood patterns over time
- 📱 **Works Everywhere**: Use on your computer, tablet, or phone
- 🆓 **Completely Free**: Just bring your own AI API key

---

## 🚀 Complete Setup Guide for Beginners

Don't worry if you're not tech-savvy! This guide will walk you through every step.

### Prerequisites (What You Need)

Before starting, you'll need:

1. **A Computer** (Windows, Mac, or Linux)
2. **Internet Connection** (for downloading and AI responses)
3. **An AI API Key** (we'll show you how to get one - it's like a password for the AI)

### Step 1: Install Node.js

Node.js is what makes the app run. Think of it as the engine.

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the "LTS" version (the big green button)
3. Run the installer - just click "Next" for everything
4. To check it worked, open Terminal/Command Prompt and type: `node --version`

### Step 2: Get an AI API Key

You need at least ONE of these (they're free to start):

#### Option A: OpenAI (GPT-4o)
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up for a free account
3. Click "API Keys" in the left menu
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. **Save it somewhere safe!** You can't see it again

#### Option B: Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up for a free account
3. Go to "API Keys"
4. Create a new key
5. Copy and save it

#### Option C: Google (Gemini)
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy and save it

### Step 3: Download CounsellorAI

1. Click the green "Code" button on this page
2. Click "Download ZIP"
3. Extract the ZIP file to your Desktop or Documents folder

### Step 4: Set Up Your API Key

1. In the CounsellorAI folder, find the file called `.env.example`
2. Make a copy and rename it to `.env` (remove the `.example` part)
3. Open it with any text editor (Notepad is fine)
4. Add your API key(s):
   ```
   OPENAI_API_KEY=your-openai-key-here
   ANTHROPIC_API_KEY=your-anthropic-key-here
   GOOGLE_API_KEY=your-google-key-here
   ```
5. Save the file

### Step 5: Install and Run

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the CounsellorAI folder:
   ```bash
   cd Desktop/CounsellorAI
   ```
3. Install everything:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open your web browser and go to: `http://localhost:3000`

That's it! You should see the login page. Create an account and start chatting!

---

## 🔧 For Developers

### Tech Stack
- **Frontend**: React 18, TypeScript, Material-UI 5, Vite
- **Backend**: Express.js, TypeScript, SQLite with SQLCipher
- **AI**: OpenAI, Anthropic, and Google Gemini APIs
- **Auth**: JWT with bcrypt
- **State**: Zustand + React Query

### Quick Start
```bash
# Clone the repo
git clone https://github.com/yourusername/CounsellorAI.git
cd CounsellorAI

# Install dependencies
npm install

# Copy environment variables
cp server/.env.example server/.env
# Add your API keys to server/.env

# Run development server
npm run dev
```

### Project Structure
```
CounsellorAI/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types
└── database/        # SQLite database (auto-created)
```

### Security Features

The following security measures have been implemented:

- **Authentication**: JWT-based with bcrypt password hashing
- **Database Encryption**: SQLCipher with AES-256
- **Input Validation**: Zod schemas on all endpoints
- **CSRF Protection**: Double-submit cookie pattern
- **SQL Injection Protection**: Parameterized queries and field whitelisting
- **XSS Protection**: Input sanitization
- **Rate Limiting**: Request size limits (1MB)
- **Sensitive Data Redaction**: Automatic PII removal from logs

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Some areas that could use help:

- UI/UX improvements
- Additional AI model integrations
- Better crisis detection
- Progress visualization features
- Documentation improvements
- Bug fixes

### Development Guidelines

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Follow the existing code style
5. Test with all AI models

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with love for the mental health community
- Inspired by the need for accessible mental health tools
- Thanks to all contributors and users

---

## ⚠️ Important Disclaimers

1. **Not Medical Advice**: This is not a replacement for professional therapy
2. **Crisis Support**: If you're in crisis, please contact emergency services
3. **Privacy**: While we implement security best practices, this is a hobby project
4. **AI Limitations**: AI responses may not always be appropriate or accurate

---

## 🆘 Crisis Resources

If you're experiencing a mental health crisis:

- **US**: National Suicide Prevention Lifeline: 988
- **UK**: Samaritans: 116 123
- **Australia**: Lifeline: 13 11 14
- **International**: [findahelpline.com](https://findahelpline.com/)

Remember: You're not alone, and help is available. 💙