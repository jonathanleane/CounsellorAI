# CounsellorAI

> ⚠️ **CRITICAL SECURITY WARNING**: This application currently stores therapy data unencrypted. See [CRITICAL_SECURITY_UPDATE.md](./CRITICAL_SECURITY_UPDATE.md) for details. DO NOT use for sensitive data until encryption is implemented.

An open-source AI therapy companion that provides personalized mental health support through conversational AI.

## Features

- 🧠 **Multi-Model AI Support**: Choose between GPT-4, Claude 3, or Gemini for therapy sessions
- 🔒 **Privacy First**: Run locally or deploy online - your data stays yours
- 💬 **Natural Conversations**: Interactive therapy sessions with context-aware responses
- 📊 **Progress Tracking**: Monitor mood patterns and therapy goals
- 🧩 **Transparent AI**: See and edit what the AI remembers about you
- 🌐 **Open Source**: MIT licensed for maximum flexibility
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Export Data**: Download your sessions for personal records

## Quick Start

### Local Installation (Recommended for Privacy)

```bash
# Clone the repository
git clone https://github.com/yourusername/counsellor-ai.git
cd counsellor-ai

# Install dependencies
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env and add your API keys

# Start the application
npm run dev
```

This will start:
- Server on http://localhost:3001
- Client on http://localhost:3000

Visit `http://localhost:3000` to begin.

### Cloud Deployment

See [deployment guide](./docs/ARCHITECTURE_OVERVIEW.md#deployment-options) for cloud hosting options.

## Requirements

- Node.js 18+
- npm 9+
- At least one AI provider API key:
  - OpenAI API key (for GPT-4)
  - Anthropic API key (for Claude 3) - optional
  - Google API key (for Gemini) - optional

## Usage

1. Complete the onboarding questionnaire
2. Start your first therapy session
3. Chat naturally with the AI therapist
4. Review your progress in the dashboard
5. Export your data anytime

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md)
- [Features & Functionality](./docs/FEATURES_AND_FUNCTIONALITY.md)
- [API Documentation](./docs/DATA_MODELS_AND_API.md)
- [Launch Features](./docs/LAUNCH_FEATURES_AND_CONSIDERATIONS.md)

## Privacy & Security

- **No telemetry**: We don't track your usage
- **Local storage**: All data stays on your device (local mode)
- **Your API keys**: You provide and control your own keys
- **Encryption**: Optional database encryption
- **Export anytime**: Your data in JSON/PDF/Markdown

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Areas We Need Help
- 🌍 Internationalization
- ♿ Accessibility improvements
- 🚨 Crisis resource database
- 📱 Mobile app development
- 🔒 Security auditing

## Support

- 📖 [Documentation](./docs)
- 💬 [GitHub Discussions](https://github.com/yourusername/counsellor-ai/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/counsellor-ai/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Disclaimer

CounsellorAI is not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a crisis hotline in your area.

## Acknowledgments

- OpenAI for GPT-4
- Anthropic for Claude 3
- Google for Gemini
- The open-source community

---

**Remember**: Your mental health matters. This tool is here to support you, not replace professional care when needed.