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
- **Database**: SQLite3 (⚠️ NO ENCRYPTION)
- **Validation**: Zod
- **Logging**: Winston
- **Security**: CORS, Helmet, Express Rate Limit
- **Environment**: dotenv

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
- Environment variable configuration
- Rate limiting (100 req/15min)
- CORS configuration
- Input validation with Zod
- Error handling middleware

### NOT Implemented ❌
- Database encryption
- Authentication system
- CSRF protection
- Session management
- API key rotation
- Audit logging

## Development vs Production

### Development Mode
- Vite dev server (port 5173)
- Express with nodemon (port 3001)
- Hot module replacement
- Debug logging enabled
- CORS allows localhost

### Production Mode (NOT READY)
Missing critical security features:
- No HTTPS configuration
- No database encryption
- No authentication
- No production logging
- No monitoring

## Deployment Considerations

### Current State
- Local development only
- Not suitable for production
- Critical security gaps

### Required for Production
1. Implement database encryption
2. Add authentication system
3. Configure HTTPS
4. Add session management
5. Implement CSRF protection
6. Set up monitoring
7. Configure backups
8. Add rate limiting per user
9. Implement audit logging
10. Security audit

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