# API Versioning Guide

## ✅ Status: IMPLEMENTED (2025-06-14)

CounsellorAI now supports API versioning for better backward compatibility and future-proofing.

## Overview

The API now supports versioned endpoints under `/api/v1/` while maintaining backward compatibility with legacy endpoints.

## Current API Versions

### Version 1 (Active)
- **Base URL**: `/api/v1/`
- **Status**: Active and recommended
- **Features**: All current functionality

### Legacy (Deprecated)
- **Base URL**: `/api/`
- **Status**: Deprecated but functional
- **Note**: Will be removed in future versions

## Endpoint Mapping

### V1 Endpoints (Recommended)
```
GET    /api/v1/version           - API version information
GET    /api/v1/health            - Health check
GET    /api/v1/profile           - Get user profile
POST   /api/v1/profile           - Create/update profile
GET    /api/v1/sessions          - Get all sessions
POST   /api/v1/sessions          - Create new session
GET    /api/v1/export/json       - Export data as JSON
DELETE /api/v1/export/delete-all - Delete all data
```

### Legacy Endpoints (Deprecated)
```
GET    /api/health
GET    /api/profile
POST   /api/profile
GET    /api/sessions
POST   /api/sessions
GET    /api/export/json
DELETE /api/export/delete-all
```

## Client Configuration

### Using Versioned API (Default)

The client automatically uses the versioned API by default:

```typescript
// In client/src/services/api.ts
const API_BASE = '/api/v1';
```

### Using Legacy API

To use legacy endpoints (not recommended):

```env
# In client/.env
VITE_USE_API_V1=false
```

## Migration Guide

### For Developers

1. **New Development**: Always use `/api/v1/` endpoints
2. **Existing Code**: Update gradually to use versioned endpoints
3. **Testing**: Test with both versions during transition

### API Changes

The versioned API is identical to the legacy API in functionality. Only the URL paths have changed:

```javascript
// Legacy
await fetch('/api/sessions');

// Versioned (recommended)
await fetch('/api/v1/sessions');
```

## Version Information Endpoint

Get current API version details:

```bash
curl http://localhost:3001/api/v1/version
```

Response:
```json
{
  "version": "1.0.0",
  "api": "v1",
  "status": "active",
  "deprecated": false,
  "features": [
    "sessions",
    "profile",
    "health",
    "export",
    "ai-models",
    "auto-learning",
    "encryption",
    "gdpr-compliance"
  ]
}
```

## Benefits of Versioning

1. **Backward Compatibility**: Old clients continue working
2. **Safe Updates**: Breaking changes in new versions only
3. **Clear Deprecation**: Planned removal of old endpoints
4. **Feature Discovery**: Version endpoint lists capabilities
5. **Multiple Versions**: Can support multiple API versions

## Future Considerations

### Version 2 Planning

When v2 is needed:
1. Create `/api/v2/` routes
2. Maintain v1 for transition period
3. Mark v1 as deprecated
4. Document migration path

### Deprecation Timeline

1. **Current**: Legacy endpoints deprecated
2. **6 months**: Warning logs for legacy usage
3. **12 months**: Remove legacy endpoints
4. **Ongoing**: Maintain at least 2 versions

## Implementation Details

### Server Structure

```
server/src/routes/
├── v1/
│   └── index.ts      # Version 1 router
├── sessions.ts       # Shared route handlers
├── profile.ts
├── export.ts
└── health.ts
```

### Adding New Versions

1. Create new version directory:
   ```typescript
   // server/src/routes/v2/index.ts
   import { Router } from 'express';
   const router = Router();
   // ... mount routes
   export default router;
   ```

2. Mount in main server:
   ```typescript
   app.use('/api/v2', v2Routes);
   ```

3. Update client configuration:
   ```typescript
   const API_BASE = '/api/v2';
   ```

## Testing

### Test Version Detection

```bash
# Check API root
curl http://localhost:3001/api

# Check v1 version
curl http://localhost:3001/api/v1/version

# Test legacy endpoint
curl http://localhost:3001/api/health

# Test v1 endpoint
curl http://localhost:3001/api/v1/health
```

### Verify Both Work

Both should return same data:
```bash
# Legacy
curl http://localhost:3001/api/sessions

# V1
curl http://localhost:3001/api/v1/sessions
```

## Best Practices

1. **Always Version**: Even v1 establishes the pattern
2. **Document Changes**: Clear migration guides
3. **Deprecate Gracefully**: Long transition periods
4. **Version Discovery**: Endpoint to list versions
5. **Client Flexibility**: Easy version switching

## Monitoring

Track API version usage:
- Log which versions are being called
- Monitor legacy endpoint usage
- Plan deprecation based on usage

## Support

For API versioning questions:
- Check this guide
- Review the code in `/server/src/routes/v1/`
- Test with both versions