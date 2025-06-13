# CounsellorAI

An open-source AI therapy companion that provides personalized mental health support through conversational AI.

## Features

- 🧠 **Personalized AI Therapy**: Tailored responses based on your profile and history
- 🔒 **Privacy First**: Run locally or deploy online - your data stays yours
- 💬 **Natural Conversations**: Powered by GPT-4.5 and Claude 3.7
- 📊 **Progress Tracking**: Monitor mood patterns and therapy goals
- 🧩 **Transparent AI**: See and edit what the AI remembers about you
- 🌐 **Open Source**: MIT licensed for maximum flexibility

## Quick Start

### Local Installation (Recommended for Privacy)

```bash
# Clone the repository
git clone https://github.com/yourusername/counsellor-ai.git
cd counsellor-ai

# One-command setup
npm run setup:local

# Start the application
npm start
```

The setup script will:
1. Install all dependencies
2. Create a local SQLite database
3. Generate a `.env` file
4. Prompt for your OpenAI/Anthropic API keys
5. Start both frontend and backend

Visit `http://localhost:3000` to begin.

### Cloud Deployment

See [deployment guide](./docs/ARCHITECTURE_OVERVIEW.md#deployment-options) for cloud hosting options.

## Requirements

- Node.js 18+
- npm or yarn
- OpenAI API key (for GPT-4.5)
- Anthropic API key (for Claude 3.7) - optional

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

- OpenAI for GPT-4.5
- Anthropic for Claude 3.7
- The open-source community

---

**Remember**: Your mental health matters. This tool is here to support you, not replace professional care when needed.