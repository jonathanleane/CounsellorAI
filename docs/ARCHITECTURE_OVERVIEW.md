# CounsellorAI Architecture Overview

## Current Implementation Status

**Last Updated**: June 2025

⚠️ **DEVELOPMENT STATUS**: This application has critical security vulnerabilities and should not be used for real therapy data.

## System Architecture

CounsellorAI is a full-stack TypeScript application with the following architecture:

### Frontend (Client)
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **UI Framework**: Material-UI (MUI) v5
- **Styling**: Emotion (CSS-in-JS)
- **Forms**: React Hook Form
- **HTTP Client**: Axios

### Backend (Server)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: SQLite3 with SQLCipher encryption (AES-256)
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Logging**: Winston with PII redaction
- **Security**: CORS, Helmet, Express Rate Limit, CSRF protection
- **Environment**: dotenv
- **Backup**: Automatic encrypted backups with cron scheduling

### AI Integration
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Google**: Gemini Pro

## Directory Structure

```
CounsellorAI/
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client services
│   │   ├── stores/        # Zustand state stores
│   │   └── theme.ts       # MUI theme configuration
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                  # Express backend server
│   ├── src/
│   │   ├── config/        # Configuration validation
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   │   ├── ai/       # AI provider integrations
│   │   │   └── database/  # Database abstraction
│   │   ├── utils/         # Helper functions
│   │   └── validation/    # Zod schemas
│   ├── dist/              # Compiled TypeScript
│   └── tsconfig.json
│
├── database/               # SQLite database files
├── docs/                   # Documentation
├── logs/                   # Application logs
├── scripts/                # Setup and utility scripts
├── tests/                  # Test files
└── package.json           # Workspace configuration
```

## Key Architectural Decisions

### 1. TypeScript Throughout
- Type safety for API contracts
- Better IDE support
- Self-documenting code
- Compile-time error catching

### 2. Monorepo with Workspaces
- Shared dependencies
- Unified scripts
- Easier development
- Consistent tooling

### 3. Local-First Design
- SQLite for zero-config database
- No external services required
- User owns their data
- Privacy by default

### 4. Service Layer Pattern
- Clean separation of concerns
- Testable business logic
- Database abstraction
- AI provider abstraction

## API Architecture

### RESTful Endpoints
```
GET    /api/health          # Health check
GET    /api/profile         # Get user profile
POST   /api/profile         # Create/update profile
PATCH  /api/profile/:field  # Update specific field
GET    /api/sessions        # List sessions
POST   /api/sessions        # Create session
GET    /api/sessions/:id    # Get session details
POST   /api/sessions/:id/messages  # Add message
PATCH  /api/sessions/:id    # Update session
DELETE /api/sessions/:id    # Delete session
```

### Request/Response Flow
1. Client makes HTTP request
2. Express middleware (CORS, rate limiting)
3. Route handler validates input with Zod
4. Service layer processes business logic
5. Database/AI operations
6. Response sent back to client

## Data Flow

### User Profile Management
```
React Form → API Request → Validation → SQLite → Response
```

### AI Conversation
```
User Input → API → AI Service → Provider (OpenAI/Anthropic/Google) → 
Process Response → Store in DB → Return to Client
```

### Session Management
```
Create Session → Store Metadata → Add Messages → 
Generate Summary → Update Session → Display History
```

## Security Architecture

### Current Implementation ✅
- **Authentication**: JWT-based with bcrypt password hashing
- **Database encryption**: SQLCipher with AES-256
- **CSRF protection**: Double-submit cookie pattern
- **Input validation**: Zod schemas on all endpoints
- **Rate limiting**: 100 req/15min for general, 20 req/15min for AI
- **Request size limits**: 1MB to prevent DoS
- **SQL injection protection**: Field whitelisting and parameterized queries
- **Sensitive data redaction**: Automatic PII removal from logs
- **Environment configuration**: Secure key management
- **CORS configuration**: Properly configured for production
- **Error handling**: Comprehensive middleware
- **Backup system**: Automatic encrypted backups
- **Data export**: GDPR compliance with full export/delete

### Future Enhancements
- API key rotation
- Detailed audit logging
- Session timeouts
- Two-factor authentication

## Development vs Production

### Development Mode
- Vite dev server (port 5173)
- Express with nodemon (port 3001)
- Hot module replacement
- Debug logging enabled
- CORS allows localhost

### Production Mode
Security features implemented:
- HTTPS configuration ready (use reverse proxy)
- Database encryption with SQLCipher
- JWT authentication system
- Production-ready logging with Winston
- Error tracking and monitoring hooks

For production deployment:
1. Use a reverse proxy (nginx) for HTTPS
2. Set strong JWT_SECRET and DATABASE_ENCRYPTION_KEY
3. Configure backup retention policies
4. Set up monitoring (optional)
5. Review rate limiting settings

## Deployment Considerations

### Current State
- Local development only
- Not suitable for production
- Critical security gaps

### Production Checklist ✅
1. ✅ Database encryption (SQLCipher)
2. ✅ Authentication system (JWT + bcrypt)
3. ✅ HTTPS ready (use reverse proxy)
4. ✅ Session management (JWT-based)
5. ✅ CSRF protection (double-submit cookies)
6. ✅ Backup system (automatic + manual)
7. ✅ Rate limiting (configurable)
8. ✅ Input validation (Zod schemas)
9. ✅ Security headers (Helmet)
10. ✅ GDPR compliance (export/delete)

### Optional Enhancements
- Detailed audit logging
- Advanced monitoring
- Per-user rate limiting
- Two-factor authentication

## Performance Characteristics

### Strengths
- Fast local SQLite queries
- Efficient React rendering
- Lazy loading with React Query
- Optimized bundle with Vite

### Limitations
- Full conversation history in memory
- No pagination for large datasets
- No caching strategy
- No WebSocket for real-time

## Future Architecture Improvements

### High Priority
1. Database encryption
2. Authentication system
3. Proper session management
4. WebSocket for streaming AI responses

### Medium Priority
1. Redis for caching
2. Message queue for AI requests
3. Pagination for conversations
4. Compression for large texts

### Low Priority
1. Microservices architecture
2. GraphQL API
3. Server-side rendering
4. PWA support