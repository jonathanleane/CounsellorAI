# CounsellorAI - Your Open Source AI Therapy Companion 🧠💬

> ## ⚠️ **DEVELOPMENT ONLY - DO NOT USE FOR REAL THERAPY DATA** ⚠️
> 
> **This application has CRITICAL SECURITY VULNERABILITIES:**
> - ❌ **NO AUTHENTICATION** - Anyone with access can read all data
> - ❌ **NO SESSION MANAGEMENT** - Sessions never expire
> - ❌ **NO AUDIT LOGGING** - No tracking of data access
> 
> **Recently Fixed (2025-06-14):**
> - ✅ Database encryption (SQLCipher with AES-256)
> - ✅ Data export for GDPR compliance
> - ✅ Input validation (Zod schemas)
> - ✅ SQL injection protection
> - ✅ Sensitive data redaction in logs
> - ✅ CSRF protection
> 
> **This is a development prototype only. DO NOT use for actual therapy sessions or sensitive personal data until the remaining security issues are resolved. See [TODO.md](./TODO.md) for the full list.**

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

Node.js is the software that runs CounsellorAI. Think of it like installing Microsoft Word before you can open a document.

#### For Windows:
1. Go to https://nodejs.org
2. Click the big green button that says "LTS" (Long Term Support)
3. Download will start automatically
4. Double-click the downloaded file
5. Click "Next" through all the steps (default options are fine)
6. Click "Install" and wait for it to finish

#### For Mac:
1. Go to https://nodejs.org
2. Click the big green button that says "LTS"
3. Download the .pkg file
4. Double-click the downloaded file
5. Follow the installation wizard

#### How to Check It Worked:
1. Open Terminal (Mac) or Command Prompt (Windows)
   - **Windows**: Press `Windows Key + R`, type `cmd`, press Enter
   - **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
2. Type: `node --version`
3. Press Enter
4. You should see something like `v20.11.0` (the numbers might be different)

### Step 2: Download CounsellorAI

Now we'll download the actual CounsellorAI program.

1. Go to https://github.com/jonathanleane/CounsellorAI
2. Click the green "Code" button
3. Click "Download ZIP"
4. Find the downloaded ZIP file (usually in your Downloads folder)
5. Right-click and select "Extract All" (Windows) or double-click (Mac)
6. Move the extracted folder to somewhere easy to find (like your Desktop)

### Step 3: Get Your AI API Key

You need an API key to connect to the AI. This is like a password that lets CounsellorAI talk to the AI service.

#### Option A: OpenAI (GPT-4) - Recommended for Beginners
1. Go to https://platform.openai.com/signup
2. Create an account (you can use Google or email)
3. Once logged in, click your profile picture (top right)
4. Click "View API keys"
5. Click "Create new secret key"
6. Give it a name like "CounsellorAI"
7. **IMPORTANT**: Copy the key immediately! You won't see it again
8. Save it somewhere safe (like a text file)

**Cost**: OpenAI charges about $0.01-0.03 per conversation. You get $5 free credit to start.

#### Option B: Anthropic (Claude)
1. Go to https://console.anthropic.com
2. Sign up for an account
3. Go to "API Keys" in the sidebar
4. Create a new key
5. Copy and save it

#### Option C: Google (Gemini)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and save it

### Step 4: Set Up CounsellorAI

Now we'll configure CounsellorAI with your API key.

1. **Open the CounsellorAI folder** you extracted earlier
2. **Find the `server` folder** inside it
3. **Look for a file called `.env.example`**
   - If you can't see it, you might need to show hidden files:
     - **Windows**: In File Explorer, click View → Show → Hidden items
     - **Mac**: Press `Cmd + Shift + .` (period)
4. **Make a copy of `.env.example`** and rename it to `.env` (remove the .example part)
5. **Open the `.env` file** with any text editor (Notepad on Windows, TextEdit on Mac)
6. You'll see something like this:
   ```
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   ```
7. **Replace `your_openai_api_key_here`** with your actual API key
8. **Save the file**

### Step 5: Install and Start CounsellorAI

Almost there! Now we'll install and run the program.

1. **Open Terminal/Command Prompt**
2. **Navigate to the CounsellorAI folder**:
   - Type `cd ` (with a space after cd)
   - Drag the CounsellorAI folder into the terminal window
   - Press Enter
3. **Install the program** by typing:
   ```
   npm install
   ```
   - Press Enter and wait (this might take 2-5 minutes)
   - You'll see lots of text scrolling - that's normal!
4. **Start CounsellorAI** by typing:
   ```
   npm run dev
   ```
   - Press Enter

If everything worked, you'll see:
```
Server running on http://localhost:3001
Client running on http://localhost:3000
```

### Step 6: Use CounsellorAI

1. **Open your web browser** (Chrome, Firefox, Safari, etc.)
2. **Go to**: http://localhost:3000
3. **Complete the setup**:
   - Fill out the initial questionnaire
   - Be honest - this helps the AI understand how to help you
4. **Start chatting!**

---

## 🛠️ Troubleshooting

### "npm is not recognized" Error
- **Problem**: Node.js didn't install correctly
- **Solution**: Restart your computer and try the Node.js installation again

### "Cannot find module" Error
- **Problem**: Installation incomplete
- **Solution**: Run `npm install` again in the CounsellorAI folder

### "API key is invalid" Error
- **Problem**: The API key wasn't copied correctly
- **Solution**: 
  1. Make sure you copied the entire key
  2. Check there are no extra spaces
  3. Make sure you're using the right key for the right service

### Nothing Happens When I Go to localhost:3000
- **Problem**: The server didn't start
- **Solution**:
  1. Check the terminal - are there any error messages?
  2. Try running `npm run dev` again
  3. Make sure no other program is using port 3000

### "Port already in use" Error
- **Problem**: Another program is using the same port
- **Solution**: 
  1. Close other development servers
  2. Or change the port in the `.env` file:
     ```
     PORT=3002
     CLIENT_PORT=3003
     ```

---

## 📖 How to Use CounsellorAI

### Your First Session
1. **Be Open**: The AI is here to help, not judge
2. **Be Specific**: Instead of "I feel bad", try "I feel anxious about work"
3. **Take Your Time**: There's no rush in your responses

### Features Explained
- **Chat**: Talk naturally, like texting a friend
- **Dashboard**: See your mood trends over time
- **Export**: Download your conversations for your records
- **Settings**: Change AI models or update your profile

### Privacy Tips
- **Running Locally**: Your conversations stay on your computer
- **API Keys**: Only you have access to your API key
- **Data Export**: You can download and delete all your data anytime

---

## 💡 Frequently Asked Questions

### Is this really free?
Yes! The software is 100% free. You only pay for the AI API usage (usually $0.01-0.03 per conversation).

### Is it safe to share personal information?
When running locally, your data stays on your computer. The AI services (OpenAI, etc.) have their own privacy policies - generally they don't store your conversations.

### Can I use this on my phone?
Yes! Once it's running on your computer, you can access it from your phone's browser if both devices are on the same WiFi network.

### How do I stop the program?
In the terminal where you ran `npm run dev`, press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac).

### How do I start it again later?
1. Open terminal
2. Navigate to the CounsellorAI folder
3. Run `npm run dev`

---

## 🆘 Getting Help

### If You're Stuck
1. **Check the [Documentation](./docs)** - More detailed guides
2. **Ask the Community** - [GitHub Discussions](https://github.com/jonathanleane/CounsellorAI/discussions)
3. **Report Bugs** - [Issue Tracker](https://github.com/jonathanleane/CounsellorAI/issues)

### Crisis Resources
If you're experiencing a mental health crisis:
- **US**: Call 988 (Suicide & Crisis Lifeline)
- **UK**: Call 116 123 (Samaritans)
- **International**: Find your local crisis line at [findahelpline.com](https://findahelpline.com)

---

## 🤝 Contributing

Want to help make CounsellorAI better? We'd love your help!
- **Not a Coder?** Help with documentation, translations, or testing
- **Developer?** Check out [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📜 License

MIT License - This means you can use, modify, and share CounsellorAI freely!

---

## ⚠️ Important Disclaimer

CounsellorAI is an AI-powered support tool, NOT a replacement for professional mental health care. 

**Please seek professional help if you're:**
- Having thoughts of self-harm
- Experiencing severe depression or anxiety
- In any kind of crisis situation

Your mental health matters, and sometimes you need human support. This tool is here to complement, not replace, professional care.

---

**Remember**: Taking the first step towards better mental health is brave. We're here to support you on your journey. 💙