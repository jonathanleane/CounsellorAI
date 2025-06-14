# Security Policy

## ⚠️ CRITICAL SECURITY WARNING

**This application is currently in DEVELOPMENT ONLY status with the following vulnerabilities:**
- ❌ **NO DATABASE ENCRYPTION** - All therapy data stored in plaintext SQLite
- ❌ **NO AUTHENTICATION SYSTEM** - No login or access control
- ❌ **NO SESSION MANAGEMENT** - Sessions never expire
- ❌ **NO AUDIT LOGGING** - No tracking of data access

**Recently Fixed (2025-06-13):**
- ✅ **INPUT VALIDATION** - All endpoints protected with Zod schemas
- ✅ **CSRF PROTECTION** - Double-submit cookie pattern implemented
- ✅ **SQL INJECTION** - Field whitelisting prevents injection attacks
- ✅ **SENSITIVE DATA REDACTION** - PII removed from logs automatically
- ✅ **REQUEST SIZE LIMITS** - 1MB limit prevents DoS attacks

**DO NOT USE FOR REAL THERAPY DATA UNTIL REMAINING CRITICAL ISSUES ARE RESOLVED**

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
- ❌ **NOT IMPLEMENTED**: Database encryption at rest (SQLite stores all data in plaintext)
- ✅ API keys protected in environment variables
- ✅ **IMPLEMENTED**: Sensitive data redaction in logs using redactSensitiveData utility
- ❌ **NOT IMPLEMENTED**: Session management with proper timeouts

### API Security
- ✅ Request size limits (1MB) to prevent DoS attacks
- ✅ Input validation with Zod on ALL endpoints
- ✅ SQL injection prevention via field whitelisting
- ✅ CSRF protection with double-submit cookie pattern
- ✅ XSS protection via input sanitization

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
- Request size limits (1MB) on all endpoints
- Input validation with Zod schemas on ALL endpoints
- CSRF protection using csrf-csrf package
- SQL injection protection via field whitelisting
- Sensitive data redaction in logs (redactSensitiveData utility)
- Comprehensive error handling middleware
- CORS configuration with proper origins
- JSON body parsing with strict size limits
- Input sanitization for XSS prevention
- Lazy loading of AI providers (security & performance)

### ❌ NOT Implemented (CRITICAL):
- Database encryption (all data in plaintext SQLite)
- Authentication system (no access control)
- Session timeouts and management
- Security headers (Helmet.js)
- HTTPS enforcement (development only)
- Secure session management
- Password hashing (no user accounts)
- API key rotation mechanism
- Audit logging for compliance
- Data export for GDPR compliance
- Backup encryption

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve CounsellorAI.