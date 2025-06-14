# Data Export & GDPR Compliance Guide

## ✅ Status: IMPLEMENTED (2025-06-14)

CounsellorAI now provides comprehensive data export functionality to ensure GDPR compliance and user data ownership.

## Overview

Users can:
- Export all their data in multiple formats (JSON, Text, ZIP)
- Download complete therapy session history
- Access all personal information and AI insights
- Permanently delete all their data

## Export Formats

### 1. JSON Export
- **Format**: Machine-readable JSON
- **Use Case**: Backups, data transfer, analysis
- **Endpoint**: `GET /api/export/json`
- **Contents**:
  ```json
  {
    "exportDate": "2025-06-14T...",
    "version": "1.0",
    "profile": { /* all profile data */ },
    "conversations": [ /* all sessions with messages */ ],
    "statistics": { /* usage stats */ }
  }
  ```

### 2. Text Export
- **Format**: Human-readable plain text
- **Use Case**: Reading, printing, sharing
- **Endpoint**: `GET /api/export/text`
- **Contents**:
  - Profile information
  - Complete conversation transcripts
  - Session summaries and insights
  - Formatted for easy reading

### 3. ZIP Archive
- **Format**: Compressed ZIP file
- **Use Case**: Complete backup, archival
- **Endpoint**: `GET /api/export/archive`
- **Structure**:
  ```
  counsellor-ai-export.zip
  ├── README.txt
  ├── profile.json
  └── conversations/
      ├── session_1234_2025-06-14.json
      ├── session_1235_2025-06-14.json
      └── ...
  ```

## Data Deletion

### Right to Erasure (GDPR Article 17)

Users can permanently delete all their data:

- **Endpoint**: `DELETE /api/export/delete-all`
- **Security**: Requires CSRF token and explicit confirmation
- **Confirmation**: User must type `DELETE_ALL_MY_DATA`
- **Effect**: Irreversibly removes:
  - All therapy sessions
  - Profile information
  - AI-generated insights
  - Personal details

## User Interface

### Access Data Export

1. Navigate to **Export** in the top navigation
2. Choose export format:
   - **Export JSON**: For technical users/backups
   - **Export Text**: For reading/printing
   - **Export Archive**: For complete backup

### Delete Account

1. Navigate to **Export** page
2. Scroll to "Delete All Data" section
3. Click "Delete All My Data" button
4. Type confirmation text exactly
5. Confirm deletion

⚠️ **Warning**: Deletion is permanent and cannot be undone!

## API Documentation

### Export Endpoints

```typescript
// JSON Export
GET /api/export/json
Response: application/json
{
  exportDate: string,
  version: string,
  profile: ProfileData,
  conversations: ConversationData[],
  statistics: StatsData
}

// Text Export
GET /api/export/text
Response: text/plain
Human-readable formatted text

// ZIP Export
GET /api/export/archive
Response: application/zip
Compressed archive file

// Delete All Data
DELETE /api/export/delete-all
Body: { confirmation: "DELETE_ALL_MY_DATA" }
Response: { success: true, message: string, deletedConversations: number }
```

## Implementation Details

### Security Features

1. **CSRF Protection**: Delete endpoint requires valid CSRF token
2. **Confirmation Required**: Explicit confirmation text prevents accidents
3. **No Authentication**: Since app is single-user, no auth required
4. **Complete Deletion**: All data removed, not just marked as deleted

### Data Included

- **Profile**: All fields including parsed JSON data
- **Conversations**: Complete with messages and metadata
- **AI Insights**: Summaries, patterns, suggestions
- **Personal Details**: Everything the AI has learned
- **Timestamps**: Creation and update times

### Performance

- **Streaming**: Large exports use streaming to prevent memory issues
- **Compression**: ZIP exports use level 9 compression
- **Async Processing**: Non-blocking export generation

## GDPR Compliance

This implementation satisfies key GDPR requirements:

### Article 15 - Right of Access
✅ Users can access all their personal data via exports

### Article 17 - Right to Erasure
✅ Users can delete all their data permanently

### Article 20 - Right to Data Portability
✅ Data exportable in structured, machine-readable format (JSON)

### Privacy by Design
✅ Export includes ALL data, nothing hidden
✅ Clear warnings about deletion permanence
✅ No dark patterns - all options clearly presented

## Testing

### Manual Testing

1. **Test JSON Export**:
   ```bash
   curl -X GET http://localhost:3001/api/export/json -o export.json
   ```

2. **Test Text Export**:
   ```bash
   curl -X GET http://localhost:3001/api/export/text -o export.txt
   ```

3. **Test ZIP Export**:
   ```bash
   curl -X GET http://localhost:3001/api/export/archive -o export.zip
   ```

### Verify Export Contents

```bash
# Check JSON structure
jq . export.json

# Check ZIP contents
unzip -l export.zip
```

## Future Enhancements

1. **Selective Export**: Choose date ranges or specific sessions
2. **PDF Export**: Formatted PDF documents
3. **Markdown Export**: For documentation/sharing
4. **Import Function**: Re-import exported data
5. **Scheduled Exports**: Automatic periodic backups
6. **Encryption**: Optionally encrypt exports

## User Guidance

### Before Deleting

Always recommend users:
1. Export their data first (any format)
2. Verify the export is complete
3. Store the export securely
4. Only then proceed with deletion

### Data Ownership

Users own all their data:
- No vendor lock-in
- Complete transparency
- Full control over their information
- Freedom to leave anytime

## Support

For issues with data export:
1. Check browser console for errors
2. Ensure sufficient disk space
3. Try different export formats
4. Report issues on GitHub