# Backup System Guide

## Overview

CounsellorAI includes a comprehensive backup system that automatically backs up all therapy data, including:
- User profile information
- All therapy sessions and conversations
- Messages and AI responses
- Identified patterns and follow-up suggestions
- Database file (if encryption is enabled)

## Configuration

Configure the backup system using environment variables in your `.env` file:

```env
# Enable/disable automatic backups
AUTO_BACKUP=true

# Backup frequency (options: hourly, daily, weekly, monthly, or custom cron pattern)
BACKUP_INTERVAL=daily

# Number of backups to keep (older backups are automatically deleted)
MAX_BACKUPS=7
```

### Backup Intervals

- `hourly`: Every hour at minute 0
- `daily`: Every day at 2 AM UTC (default)
- `weekly`: Every Sunday at 2 AM UTC
- `monthly`: First day of each month at 2 AM UTC
- Custom cron pattern: e.g., `0 */6 * * *` for every 6 hours

## Backup Storage

Backups are stored in the `backups/` directory at the project root:
```
CounsellorAI/
├── backups/
│   ├── counsellor-backup-2025-06-14-120000.zip
│   ├── counsellor-backup-2025-06-13-020000.zip
│   └── ...
```

## Backup Contents

Each backup is a ZIP archive containing:

```
counsellor-backup-YYYY-MM-DD-HHMMSS.zip
├── metadata.json          # Backup information and statistics
├── profile.json          # User profile data
├── conversations/        # All therapy sessions
│   ├── session_1_2025-06-10.json
│   ├── session_2_2025-06-11.json
│   └── ...
├── database/            # Encrypted database file (if applicable)
│   └── counsellor_encrypted.db
└── README.txt           # Backup documentation
```

## API Endpoints

### List Backups
```bash
GET /api/backup/list
GET /api/v1/backup/list
```

Returns:
```json
{
  "backups": [
    {
      "name": "counsellor-backup-2025-06-14-120000.zip",
      "size": 45678,
      "created": "2025-06-14T12:00:00.000Z"
    }
  ],
  "enabled": true,
  "interval": "daily",
  "maxBackups": 7
}
```

### Create Manual Backup
```bash
POST /api/backup/create
POST /api/v1/backup/create
```

Requires CSRF token. Returns:
```json
{
  "message": "Backup created successfully",
  "backup": {
    "name": "counsellor-backup-2025-06-14-143022.zip",
    "path": "/path/to/backup",
    "created": "2025-06-14T14:30:22.000Z"
  }
}
```

### Download Backup
```bash
GET /api/backup/download/{filename}
GET /api/v1/backup/download/{filename}
```

Downloads the specified backup file.

### Delete Backup
```bash
DELETE /api/backup/{filename}
DELETE /api/v1/backup/{filename}
```

Requires CSRF token. Deletes the specified backup file.

## Manual Backup via CLI

You can trigger a manual backup from the command line:

```bash
# From the project root
cd server
npm run backup:create
```

## Automatic Backup Schedule

When `AUTO_BACKUP=true`, the system will:
1. Create an initial backup when the server starts
2. Schedule automatic backups based on `BACKUP_INTERVAL`
3. Automatically delete old backups when the count exceeds `MAX_BACKUPS`

## Security Considerations

1. **Encrypted Backups**: If database encryption is enabled (`DATABASE_ENCRYPTION_KEY` is set), the backup includes the encrypted database file
2. **Access Control**: Backup endpoints should be protected by authentication (not yet implemented)
3. **Storage Security**: Ensure the `backups/` directory has appropriate file permissions
4. **Sensitive Data**: Backups contain all therapy data - handle with extreme care

## Restore Process

Currently, restore functionality is not automated. To restore from a backup:

1. Extract the backup ZIP file
2. For JSON data:
   - Import `profile.json` to restore user profile
   - Import conversation files from `conversations/` directory
3. For encrypted database:
   - Replace the current database with the backed-up version
   - Ensure the same `DATABASE_ENCRYPTION_KEY` is used

## Monitoring

The backup service logs all operations:
- Successful backups: `"Backup completed: {filename} ({size} bytes)"`
- Failed backups: `"Backup failed: {error}"`
- Cleanup operations: `"Deleted old backup: {filename}"`

## Best Practices

1. **Regular Testing**: Periodically test backup restoration
2. **Off-site Storage**: Consider copying backups to external storage
3. **Retention Policy**: Adjust `MAX_BACKUPS` based on your needs
4. **Monitoring**: Set up alerts for backup failures
5. **Encryption**: Always use database encryption for sensitive data

## Troubleshooting

### Backup Creation Fails
- Check disk space availability
- Verify write permissions on `backups/` directory
- Check server logs for detailed error messages

### Backups Not Running Automatically
- Verify `AUTO_BACKUP=true` in `.env`
- Check server logs for cron job initialization
- Ensure server has been restarted after configuration changes

### Old Backups Not Deleted
- Check `MAX_BACKUPS` setting
- Verify cleanup process in server logs
- Check file permissions on old backup files