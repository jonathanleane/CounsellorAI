# Security Policy

## ⚠️ CRITICAL SECURITY WARNING

**This application is currently in DEVELOPMENT ONLY status with the following vulnerabilities:**
- ❌ **NO DATABASE ENCRYPTION** - All therapy data stored in plaintext
- ❌ **NO AUTHENTICATION SYSTEM** - No login or access control
- ⚠️ **LIMITED INPUT VALIDATION** - Some endpoints now protected with Zod
- ⚠️ **NO CSRF PROTECTION** - Vulnerable to cross-site request forgery

**DO NOT USE FOR REAL THERAPY DATA**

## Reporting Security Vulnerabilities

We take security seriously in CounsellorAI, especially given the sensitive nature of mental health data.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
- Create a private security advisory on GitHub
- Or open an issue describing the general area of concern without specifics

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
- ❌ **NOT IMPLEMENTED**: Database encryption at rest
- ✅ API keys protected in environment variables
- ✅ Sensitive data redacted from logs
- ⚠️ **PARTIAL**: Session management exists but no timeout

### API Security
- ✅ Rate limiting is enforced (100 req/15min)
- ✅ Input validation with Zod on critical endpoints
- ✅ SQL injection prevention via whitelisting
- ⚠️ **PARTIAL**: Basic XSS protection via input sanitization

### Authentication
- ❌ **NOT IMPLEMENTED**: No authentication system
- ❌ **NOT IMPLEMENTED**: No password requirements
- ❌ **NOT IMPLEMENTED**: No 2FA support
- ❌ **NOT IMPLEMENTED**: No secure session management

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Current Security Status

### ✅ Implemented:
- Environment-based configuration
- Sanitized user inputs with pattern detection
- Rate limiting on AI endpoints
- SQL injection protection via field whitelisting
- Sensitive data redaction in logs
- Input validation with Zod schemas

### ❌ NOT Implemented:
- Database encryption (critical)
- Authentication system (critical)
- CSRF protection
- Session timeouts
- Security headers (Helmet.js not configured)
- HTTPS enforcement

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve CounsellorAI.