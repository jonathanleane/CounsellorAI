# Contributing to CounsellorAI

Thank you for your interest in contributing to CounsellorAI! This AI therapy application aims to make mental health support accessible to everyone.

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
3. Add your OpenAI/Anthropic API keys
4. Run `npm install`
5. Run `npm run dev`

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

### High Priority
- Accessibility improvements
- Crisis resource database
- Export functionality
- Offline mode implementation
- Security review

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
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Safety Considerations
- Never log sensitive user data
- Test crisis detection thoroughly
- Maintain therapeutic best practices
- Respect user privacy

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