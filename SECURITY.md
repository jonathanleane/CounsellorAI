# Security Policy

## Reporting Security Vulnerabilities

We take security seriously in CounsellorAI, especially given the sensitive nature of mental health data.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- Email: security@counsellorai.example.com
- Use PGP encryption if possible (key available on request)

## What to Include

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2-4 weeks
  - Low: Next release

## Security Considerations

### Data Protection
- All user data should be encrypted at rest
- API keys must never be logged or exposed
- Sessions should timeout appropriately

### API Security
- Rate limiting is enforced
- Input validation on all endpoints
- SQL injection prevention
- XSS protection

### Authentication (Future)
- Strong password requirements
- Optional 2FA support
- Secure session management

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Known Security Features

- Environment-based configuration
- Optional database encryption
- Sanitized user inputs
- HTTPS enforcement (production)
- Security headers via Helmet.js

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve CounsellorAI.