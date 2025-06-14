# Security Policy

## 🛡️ Security Overview

CounsellorAI is an open source hobby project that implements security best practices for personal use. While we take security seriously, please understand this is not a commercial product.

### Implemented Security Features

- ✅ **Authentication**: JWT-based authentication with bcrypt password hashing
- ✅ **Database Encryption**: SQLCipher with AES-256 encryption
- ✅ **Input Validation**: All endpoints protected with Zod schemas
- ✅ **CSRF Protection**: Double-submit cookie pattern implemented
- ✅ **SQL Injection Protection**: Field whitelisting and parameterized queries
- ✅ **XSS Protection**: Input sanitization on all user inputs
- ✅ **Sensitive Data Redaction**: PII automatically removed from logs
- ✅ **Request Size Limits**: 1MB limit prevents DoS attacks
- ✅ **GDPR Compliance**: Full data export and deletion capabilities
- ✅ **Backup System**: Automatic encrypted backups
- ✅ **API Versioning**: Future-proof API design

## Reporting Security Vulnerabilities

We appreciate responsible disclosure of security issues. As an open source project:

1. **Create an Issue**: Open a GitHub issue describing the vulnerability
2. **Submit a PR**: Even better, submit a pull request with a fix!
3. **Be Patient**: This is a hobby project maintained in spare time

## Security Considerations

### Data Protection
- ✅ Database encryption at rest (when DATABASE_ENCRYPTION_KEY is set)
- ✅ API keys protected in environment variables
- ✅ Sensitive data redaction in logs
- ✅ Secure password storage with bcrypt

### API Security
- ✅ Request size limits to prevent DoS
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention
- ✅ CSRF protection
- ✅ XSS protection

### Authentication
- ✅ JWT-based authentication
- ✅ Configurable token expiry
- ✅ Secure password hashing
- ⚠️ No password reset (email integration not implemented)
- ⚠️ No 2FA support

## Best Practices for Users

1. **Strong Passwords**: Use a unique, strong password
2. **Secure Keys**: Keep your JWT_SECRET and DATABASE_ENCRYPTION_KEY secure
3. **Regular Backups**: Enable automatic backups
4. **Private Hosting**: Run on your own secure computer
5. **API Key Security**: Don't share your AI API keys

## Limitations

As a hobby project, some enterprise features are not implemented:

- No email-based password reset
- No two-factor authentication
- No audit logging
- No session timeout (beyond JWT expiry)
- Single-user focused (limited multi-user support)

## Environment Variables

Ensure these are set securely:

```env
# Required for security
JWT_SECRET=<strong-random-string>
DATABASE_ENCRYPTION_KEY=<strong-random-string>

# Generate secure values with:
# openssl rand -base64 32
```

## Disclaimer

This is an open source hobby project provided "as is" without warranty. While security best practices have been implemented, users should evaluate their own security needs and use the application accordingly.

For highly sensitive data or clinical use, please consult with security professionals and use appropriate commercial solutions.

## Contributing

Security improvements are always welcome! Please feel free to:

- Report issues
- Submit pull requests
- Suggest improvements
- Share security best practices

Together we can make this project more secure for everyone! 🔒