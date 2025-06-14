# Tech Stack and Dependencies

## Current Technology Stack

### Frontend (Client)
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query) v5
- **UI Components**: Material-UI (MUI) v5
- **Styling**: Emotion (CSS-in-JS)
- **Forms**: React Hook Form
- **Date Handling**: date-fns v3

### Backend (Server)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: SQLite3 (local storage, NO ENCRYPTION)
- **AI Integration**:
  - OpenAI SDK (GPT-4, GPT-3.5)
  - Anthropic SDK (Claude)
  - Google Generative AI (Gemini)
- **Validation**: Zod
- **Logging**: Winston
- **Security Middleware**: 
  - CORS
  - Helmet
  - Express Rate Limit

### Development Tools
- **TypeScript**: v5.3.3
- **Linting**: ESLint with TypeScript plugins
- **Formatting**: Prettier
- **Package Management**: npm workspaces
- **Process Management**: Nodemon, Concurrently

## Frontend Dependencies

### Core Dependencies
```json
{
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "@mui/icons-material": "^5.17.1",
  "@mui/material": "^5.15.6",
  "@tanstack/react-query": "^5.17.19",
  "axios": "^1.6.7",
  "chart.js": "^4.4.1",
  "date-fns": "^3.3.1",
  "date-fns-tz": "^3.2.0",
  "react": "^18.2.0",
  "react-chartjs-2": "^5.2.0",
  "react-dom": "^18.2.0",
  "react-hook-form": "^7.49.3",
  "react-router-dom": "^6.22.0",
  "zustand": "^4.5.0"
}
```

### Dev Dependencies
- Vite and plugins
- TypeScript and type definitions
- ESLint and plugins
- Vitest for testing

## Backend Dependencies

### Core Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "@google/generative-ai": "^0.1.3",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "date-fns": "^3.3.1",
  "date-fns-tz": "^3.2.0",
  "dotenv": "^16.4.1",
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "firebase-admin": "^13.2.0",
  "helmet": "^7.1.0",
  "joi": "^17.12.0",
  "morgan": "^1.10.0",
  "openai": "^4.24.0",
  "sqlite3": "^5.1.7",
  "winston": "^3.11.0",
  "zod": "^3.22.4"
}
```

### Dev Dependencies
- TypeScript and type definitions
- Jest and ts-jest for testing
- tsx for TypeScript execution
- Supertest for API testing

## Environment Variables

### Required
```bash
# AI API Keys (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Server Configuration
PORT=3001
NODE_ENV=development|production
```

### Optional
```bash
# Database (defaults to SQLite)
USE_FIREBASE=false

# Firebase (if USE_FIREBASE=true)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Security (recommended for production)
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_encryption_key  # NOT IMPLEMENTED

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000  # 15 minutes

# AI Configuration
DEFAULT_AI_MODEL=gpt-4
MAX_TOKENS=16384
AI_TEMPERATURE=0.7

# Timezone
DEFAULT_TIMEZONE=UTC
```

## System Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Operating System**: Windows, macOS, or Linux
- **Memory**: 4GB RAM minimum
- **Storage**: 500MB free space

## Architecture Decisions

### Why Vite Instead of Create React App?
- Faster development builds
- Better TypeScript support
- Modern ESM-first approach
- Smaller production bundles

### Why SQLite for Local Storage?
- Zero configuration database
- Embedded, no separate server needed
- Good for single-user applications
- **WARNING**: Currently stores all data in plaintext

### Why TypeScript?
- Type safety for therapy data structures
- Better IDE support and autocompletion
- Catches errors at compile time
- Self-documenting code

### Why Zustand for State Management?
- Simpler than Redux
- TypeScript-first design
- No boilerplate
- Good performance

## Security Considerations

⚠️ **CRITICAL SECURITY GAPS**:
- No database encryption (all data in plaintext)
- No authentication system
- No CSRF protection
- SQL injection vulnerabilities
- Sensitive data in logs

This application is for DEVELOPMENT ONLY until these issues are resolved.

## Development Scripts

### Root Level
```bash
npm run dev          # Run both frontend and backend
npm run build        # Build both frontend and backend
npm run test         # Run all tests
npm run lint         # Lint all code
npm run format       # Format all code
npm run typecheck    # Type check all TypeScript
```

### Client
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run Vitest tests
```

### Server
```bash
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run test         # Run Jest tests
```

## Deployment Notes

The application is designed to run locally. For production deployment:

1. Implement database encryption
2. Add authentication system
3. Configure HTTPS
4. Set up proper logging
5. Implement backup system
6. Add monitoring and alerts

## Version Control

- Git for version control
- GitHub for repository hosting
- Conventional commits recommended
- Feature branches for development