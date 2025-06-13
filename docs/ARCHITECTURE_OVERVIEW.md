# AI Therapist Architecture Overview

## System Architecture

The AI Therapist is a full-stack web application with the following architecture:

### Frontend (React)
- **Framework**: React 18.2.0 with React Router DOM for routing
- **Styling**: Custom CSS with component-specific stylesheets
- **HTTP Client**: Axios for API communication
- **Charting**: Chart.js with react-chartjs-2 for data visualization
- **Date Handling**: date-fns and date-fns-tz for timezone management

### Backend (Node.js/Express)
- **Framework**: Express.js with Node.js 18.x
- **Security**: Helmet for security headers, CORS for cross-origin requests
- **Logging**: Morgan for HTTP request logging
- **Environment**: dotenv for configuration management

### Database
- **Primary**: Firebase Firestore (cloud-based NoSQL)
- **Legacy Support**: SQLite3 (local database option)
- **Migration**: System supports switching between Firebase and SQLite

### AI Integration
- **Primary Model**: OpenAI GPT-4.5-preview
- **Secondary Model**: Anthropic Claude 3.7 Sonnet
- **Fallback**: Graceful degradation if AI services fail

## Directory Structure

```
aitherapist-main/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── backend/                 # Express backend server
│   ├── models/             # Data models
│   ├── routes/             # API endpoint definitions
│   ├── services/           # Business logic and integrations
│   ├── utils/              # Helper functions
│   └── server.js           # Main server file
│
├── functions/              # Firebase Cloud Functions (optional)
├── firebase.json           # Firebase configuration
└── package.json           # Root package configuration
```

## Key Design Decisions

1. **Microservices Architecture**: Frontend and backend are separate services
2. **API-First Design**: Clean REST API interface between frontend and backend
3. **Database Abstraction**: Models abstract database operations for easy switching
4. **Service Layer Pattern**: Business logic separated from routes
5. **Component-Based UI**: Reusable React components for maintainability

## Deployment Options

### Local Deployment (Privacy-First)
- **Complete local operation**: All data stays on user's machine
- **SQLite database**: No external database required
- **User-provided API keys**: OpenAI/Anthropic keys configured locally
- **Simple setup**: `npm install && npm start`
- **Docker support**: Optional containerized deployment

### Cloud Deployment Options
1. **Firebase Hosting**: Frontend on Firebase, backend on Cloud Functions
2. **Digital Ocean**: Backend deployed via do-app.yaml configuration
3. **Heroku**: Support via Procfile for easy deployment
4. **Self-hosted VPS**: Deploy on any Linux server
5. **Vercel/Netlify**: Frontend with serverless functions

### Open Source Considerations
- **License**: MIT or Apache 2.0 for maximum flexibility
- **No proprietary dependencies**: All components replaceable
- **API key security**: Never stored in code, always user-provided
- **Database abstraction**: Easy switching between local/cloud storage
- **Configuration flexibility**: Environment variables for all settings

## Security Considerations

- API keys stored in environment variables
- CORS configured for specific origins
- Helmet.js for security headers
- Input validation on both frontend and backend
- Firebase security rules for database access