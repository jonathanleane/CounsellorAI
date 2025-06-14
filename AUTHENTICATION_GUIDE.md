# Authentication System Guide

## Overview

CounsellorAI now includes a JWT-based authentication system to secure all therapy data. This guide covers how to use the authentication system.

## ⚠️ Important Security Note

While authentication has been implemented, this application is still in **DEVELOPMENT ONLY** status. Professional security audit is required before using for real therapy data.

## Configuration

Add the following to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRES_IN=24h

# Generate a secure secret with:
# openssl rand -base64 32
```

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePassword123"
}
```

**Requirements:**
- Username: 3-50 characters, alphanumeric with underscores and hyphens
- Password: Minimum 8 characters

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

#### Delete Account
```http
DELETE /api/auth/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

### Protected Endpoints

All other API endpoints now require authentication:

```http
GET /api/profile
Authorization: Bearer <token>
```

## Frontend Integration

### Login Flow

1. User navigates to `/login`
2. Enters username and password
3. On successful login:
   - JWT token is stored in Zustand persist store
   - User is redirected to dashboard
   - Token is automatically included in all API requests

### Logout

Click the user icon in the top-right corner and select "Logout". This will:
- Clear the stored token
- Redirect to login page
- Clear all cached data

### Protected Routes

All routes except `/login` and `/register` are protected. Unauthenticated users are redirected to login.

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds
- Minimum 8 character requirement
- Password strength recommendations shown during registration

### Token Security
- JWT tokens expire after 24 hours (configurable)
- Tokens are verified on every API request
- Invalid tokens result in 403 Forbidden response

### Session Management
- Last login time is tracked
- No concurrent session limiting (planned feature)
- Tokens cannot be revoked (planned feature)

## Database Schema

The authentication system adds a `users` table:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);
```

## Migration Notes

### For Existing Installations

1. The users table is automatically created on server startup
2. Existing data remains unchanged
3. Users must register new accounts to access the system

### First User Setup

After deploying with authentication:

1. Navigate to `/register`
2. Create your admin account
3. Login with your credentials
4. Complete profile setup if needed

## Troubleshooting

### "Access token required" Error
- Ensure you're logged in
- Check if token has expired (24 hour default)
- Try logging in again

### "Invalid or expired token" Error
- Token has expired or is corrupted
- Clear browser storage and login again

### Cannot Create Account
- Username may already be taken
- Password doesn't meet requirements
- Check server logs for detailed error

## Security Best Practices

1. **Use Strong JWT Secret**: Generate with `openssl rand -base64 32`
2. **HTTPS Only**: Always use HTTPS in production
3. **Regular Password Changes**: Encourage users to change passwords regularly
4. **Monitor Failed Logins**: Check logs for repeated failed login attempts
5. **Backup User Data**: Include users table in backup strategy

## Limitations

Current limitations that should be addressed before production use:

1. **No Password Reset**: Users cannot reset forgotten passwords
2. **No Email Verification**: Accounts are active immediately
3. **No Session Revocation**: Tokens cannot be invalidated before expiry
4. **No Rate Limiting**: Login attempts are not rate-limited
5. **No 2FA**: Two-factor authentication not implemented
6. **No Audit Logging**: User actions are not logged for compliance

## API Examples

### JavaScript/TypeScript
```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'SecurePassword123'
  })
});

const { token, user } = await response.json();

// Use token for authenticated requests
const profile = await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"SecurePassword123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"SecurePassword123"}'

# Use token
curl http://localhost:3001/api/profile \
  -H "Authorization: Bearer <token>"
```

## Next Steps

To complete production-ready authentication:

1. Implement password reset via email
2. Add email verification for new accounts
3. Implement session management and revocation
4. Add login attempt rate limiting
5. Implement 2FA support
6. Add comprehensive audit logging
7. Professional security audit

Remember: This is a development implementation. A professional security audit is required before using for real therapy data.