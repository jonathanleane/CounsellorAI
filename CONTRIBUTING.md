# Contributing to CounsellorAI

Thank you for your interest in contributing to CounsellorAI! This AI therapy application aims to make mental health support accessible to everyone.

## 🎉 Project Status

**CounsellorAI is now a secure, feature-complete open source AI therapy companion!**

All critical security features have been implemented:
- ✅ Database encryption (SQLCipher with AES-256)
- ✅ Authentication system (JWT with bcrypt)
- ✅ SQL injection protection (field whitelisting)
- ✅ Sensitive data redaction in logs
- ✅ CSRF protection and input validation
- ✅ GDPR compliance with data export
- ✅ Automatic encrypted backups

**Contributors can now focus on enhancements and new features!**

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Remember that this is a mental health application, and user safety is paramount.

## How to Contribute

### Reporting Issues
- Check existing issues before creating a new one
- Use issue templates when available
- Include steps to reproduce bugs
- Suggest solutions if possible

### Submitting Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

### Commit Message Guidelines
- Use present tense ("Add feature" not "Added feature")
- Keep first line under 50 characters
- Reference issues and PRs in commit body
- Example:
  ```
  Add export functionality for sessions
  
  - Implement JSON, PDF, and Markdown export
  - Add export button to history view
  - Include tests for export functions
  
  Fixes #123
  ```

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Add required configuration:
   - AI API keys (OpenAI/Anthropic/Google - at least one)
   - Security keys: JWT_SECRET, CSRF_SECRET, DATABASE_ENCRYPTION_KEY
4. Run `npm install`
5. Run `npm run dev`
6. Create an account at http://localhost:5173

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "export"

# Run with coverage
npm run test:coverage
```

## Areas We Need Help

### Enhancement Opportunities
- Accessibility improvements (screen readers, keyboard nav)
- Crisis resource database and detection
- Additional export formats (PDF, Markdown)
- Offline mode with PWA support
- Voice input/output support
- Progress visualization and charts
- Multi-language support
- Mobile app development

### Good First Issues
- Add keyboard shortcuts
- Improve error messages
- Add loading states
- Documentation improvements
- UI/UX enhancements

## Guidelines

### Code Style
- Use TypeScript for new code
- Follow existing patterns
- Avoid comments in code (project preference - code should be self-documenting)
- Keep functions small and focused

### Safety Considerations
- Sensitive data is automatically redacted from logs
- Test crisis detection thoroughly
- Maintain therapeutic best practices
- Respect user privacy
- Follow security best practices
- Keep dependencies updated

### Performance
- Lazy load large components
- Optimize bundle size
- Cache expensive operations
- Profile before optimizing

## Questions?

- Open a GitHub Discussion
- Check the documentation in `/docs`
- Review existing issues and PRs

Thank you for helping make mental health support more accessible!