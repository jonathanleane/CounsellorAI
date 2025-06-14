# Database Encryption Implementation Guide

## ✅ Status: IMPLEMENTED (2025-06-14)

CounsellorAI now supports database encryption using SQLCipher to protect sensitive therapy data.

## Overview

The application uses SQLCipher (via `@journeyapps/sqlcipher`) to provide transparent encryption for the SQLite database. All therapy sessions, personal information, and mental health data are encrypted at rest using AES-256 encryption.

## Quick Start

### 1. Generate an Encryption Key

```bash
# Generate a secure 32-byte key
openssl rand -base64 32
```

Example output: `Kh3Qn8xPmL9vR2yT5jW6aB4cD7eF1gH0iJ3kM2nO4pQ=`

### 2. Add Key to Environment

Add to your `.env` file (create from `.env.example` if needed):
```env
DATABASE_ENCRYPTION_KEY=your-generated-key-here
```

⚠️ **IMPORTANT**: 
- Never commit your `.env` file to version control
- Keep a secure backup of your encryption key
- If you lose the key, your data cannot be recovered

### 3. Migrate Existing Data (Optional)

If you have existing unencrypted data:

```bash
cd server
npm run migrate:encrypt
```

This will:
- Create a backup of your existing database
- Migrate all data to a new encrypted database
- Preserve all therapy sessions and user information

### 4. Start the Application

```bash
npm run dev
```

The application will automatically detect the encryption key and use the encrypted database.

## How It Works

### Automatic Detection

The database service checks for `DATABASE_ENCRYPTION_KEY`:
- **If present**: Uses encrypted SQLite database
- **If missing**: Falls back to unencrypted database with warning

### File Locations

- **Unencrypted DB**: `/database/counsellor.db`
- **Encrypted DB**: `/database/counsellor_encrypted.db`
- **Backup**: `/database/counsellor_backup.db` (created during migration)

### Security Features

1. **AES-256 Encryption**: Military-grade encryption for all data
2. **Key-based Access**: Database unreadable without correct key
3. **Memory-only Temp Storage**: Temporary data never written to disk
4. **Transparent Operation**: No code changes needed after setup

## Migration Process

### From Unencrypted to Encrypted

1. **Backup Creation**: Original database is backed up
2. **Data Transfer**: All profiles, conversations, and messages copied
3. **Verification**: Test encrypted database before switching
4. **Cleanup**: Original can be deleted after verification

### Migration Command

```bash
# Ensure DATABASE_ENCRYPTION_KEY is set in .env
cd server
npm run migrate:encrypt
```

### Post-Migration

After successful migration:
1. Test the application thoroughly
2. Verify all data is accessible
3. Consider deleting the unencrypted database
4. Keep the backup in a secure location

## Testing Encryption

### Test Script

```bash
cd server
npm run test:encryption
```

This verifies:
- Database can be created with encryption
- Data is not readable without key
- Correct key allows access
- Wrong key is rejected

### Manual Verification

```bash
# Try to read encrypted database without key
sqlite3 database/counsellor_encrypted.db
SQLite version 3.39.5 2022-10-14 20:58:05
Enter ".help" for usage hints.
sqlite> .tables
Error: file is not a database
```

## Security Best Practices

### Key Management

1. **Generation**: Use cryptographically secure random generation
2. **Storage**: Store in environment variables or secure key vault
3. **Rotation**: Plan for key rotation (requires re-encryption)
4. **Backup**: Keep encrypted backups of the key

### Deployment

1. **Production**: Always use encryption in production
2. **Development**: Recommended even for development
3. **CI/CD**: Use different keys per environment
4. **Monitoring**: Log encryption status (not the key!)

### Performance

- **Overhead**: ~10-15% performance impact
- **Optimization**: Use indexes appropriately
- **Caching**: Consider Redis for frequently accessed data

## Troubleshooting

### Common Issues

#### "DATABASE_ENCRYPTION_KEY is required"
- **Cause**: Missing encryption key in environment
- **Fix**: Add key to `.env` file

#### "Error: file is not a database"
- **Cause**: Trying to open encrypted DB without key
- **Fix**: Ensure DATABASE_ENCRYPTION_KEY is set

#### "Migration failed"
- **Cause**: Various (permissions, disk space, etc.)
- **Fix**: Check error message, ensure backup exists

### Recovery

If encryption setup fails:
1. Check `/database/counsellor_backup.db` exists
2. Remove failed encrypted database
3. Restore from backup if needed
4. Review error logs

## FAQ

### Can I disable encryption after enabling it?

Yes, but not recommended. You would need to:
1. Export all data while encrypted
2. Remove DATABASE_ENCRYPTION_KEY
3. Restart application
4. Import data to unencrypted database

### What if I lose my encryption key?

**Data will be permanently inaccessible**. Always:
- Keep secure backups of your key
- Use a password manager
- Consider key escrow for organizations

### Can I change the encryption key?

Yes, through re-encryption:
1. Set up new key
2. Run migration with old database
3. Update environment with new key

### Is the backup encrypted?

The backup created during migration is **not encrypted** by default. Store it securely or encrypt it separately.

## Next Steps

1. ✅ **Encryption Implemented**: Database encryption is now available
2. 🔜 **Authentication System**: Next priority for complete security
3. 🔜 **Audit Logging**: Track all data access
4. 🔜 **Backup Encryption**: Automated encrypted backups

## Support

For issues or questions:
- Check the logs in `/server/logs/`
- Review this guide
- Open an issue on GitHub