# Tech Stack and Dependencies

## Frontend Dependencies

### Core Framework
- **react**: ^18.2.0 - UI library
- **react-dom**: ^18.2.0 - React DOM bindings
- **react-scripts**: 5.0.1 - Create React App tooling

### Routing
- **react-router-dom**: ^6.22.1 - Client-side routing

### HTTP Communication
- **axios**: ^1.6.7 - Promise-based HTTP client

### Data Visualization
- **chart.js**: ^4.4.1 - Charting library
- **react-chartjs-2**: ^5.2.0 - React wrapper for Chart.js

### Date/Time Management
- **date-fns**: ^3.3.1 - Modern date utility library
- **date-fns-tz**: ^3.2.0 - Timezone support for date-fns

## Backend Dependencies

### Core Framework
- **express**: ^4.18.2 - Web application framework
- **body-parser**: ^1.20.2 - Body parsing middleware

### Security
- **cors**: ^2.8.5 - CORS middleware
- **helmet**: ^7.1.0 - Security headers middleware
- **dotenv**: ^16.3.1 - Environment variable management

### Database
- **firebase**: ^11.5.0 - Firebase client SDK
- **firebase-admin**: ^13.2.0 - Firebase Admin SDK
- **sqlite3**: ^5.1.7 - SQLite database (legacy support)

### AI Integration
- **openai**: ^4.24.0 - OpenAI API client
- **@anthropic-ai/sdk**: ^0.39.0 - Anthropic Claude API client
- **node-fetch**: ^2.7.0 - Fetch API for Node.js

### Utilities
- **morgan**: ^1.10.0 - HTTP request logger
- **date-fns**: ^2.30.0 - Date utility (backend version)
- **date-fns-tz**: ^2.0.0 - Timezone support (backend version)

### Development
- **nodemon**: ^3.0.2 - Auto-restart on file changes
- **concurrently**: ^8.2.2 - Run multiple commands

## Root Dependencies

- **concurrently**: ^8.2.2 - Run frontend and backend together
- **date-fns-tz**: ^3.2.0 - Shared timezone utilities

## Environment Variables

### Required
```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
PORT=3001
NODE_ENV=development|production
```

### Optional
```
USE_FIREBASE=true|false
FIREBASE_CONFIG=firebase_config_json
```

## Node Version
- **Required**: Node.js 18.x (specified in package.json engines)

## Build Tools
- **React Scripts**: Webpack, Babel, ESLint preconfigured
- **Create React App**: Development server, build optimization

## Deployment Configurations

### Heroku
- **Procfile**: Specifies web dyno command

### Digital Ocean
- **do-app.yaml**: App Platform configuration

### Firebase
- **firebase.json**: Hosting and Functions configuration
- **firestore.rules**: Security rules
- **firestore.indexes.json**: Database indexes

## Key Version Constraints

1. **React 18**: Required for concurrent features
2. **Node 18**: Required for backend features
3. **Firebase 11+**: Latest Firestore features
4. **OpenAI 4+**: Latest GPT models support

## Package Management
- **npm**: Primary package manager
- **package-lock.json**: Ensures consistent installs

## Development Scripts

### Root Level
```json
{
  "start": "Run both frontend and backend",
  "start:backend": "Run backend only",
  "start:frontend": "Run frontend only",
  "install:all": "Install all dependencies"
}
```

### Frontend
```json
{
  "start": "Development server",
  "build": "Production build",
  "test": "Run tests",
  "eject": "Eject from CRA"
}
```

### Backend
```json
{
  "start": "Production server",
  "dev": "Development with nodemon"
}
```