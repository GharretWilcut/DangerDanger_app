# DangerDanger App - Setup Notes

## Database Configuration

**Connection String:**
```
postgresql://mario-linux@/dangerdanger?host=/var/run/postgresql&schema=public
```

**Database:** `dangerdanger`  
**User:** `mario-linux`  
**Method:** Unix socket (bypasses ident authentication)

## Important Changes Made

1. **Prisma Schema:** Updated from SQLite to PostgreSQL
2. **Email Field:** Added `@unique` constraint to `UserEmails.email`
3. **Database Tables:** All 15 tables created via migration SQL files
4. **Permissions:** Granted CREATE permissions on `public` schema to `mario-linux` user
5. **Connection:** Using Unix socket instead of TCP/IP to avoid ident authentication issues

## Test Accounts

**Existing Test Users (created via direct database access for testing):**
- `test2@test.com` - Password: Unknown (created for DB connection testing)
- `test3@test.com` - Name: "Test 3" - Password: Unknown (created for DB connection testing)

**Note:** These test accounts may not have proper passwords set. Create new accounts through the app for actual use.

## Server Status

- **Backend:** http://localhost:4000
- **Frontend:** http://localhost:19006
- **Database:** Connected and working

## Quick Start

```bash
# Start backend
cd /home/mario-linux/DangerDanger_app/server
node index.js

# Start frontend (in another terminal)
cd /home/mario-linux/DangerDanger_app/incident-map-app
npm start
```

## Database Tables

All 15 tables are created:
- UserEmails, UserPasswords, UserNames, UserCreationTimes
- IncidentTypes, IncidentDescriptions, IncidentLocations, IncidentSeverity, IncidentApprovalStatus
- UserIncidentMap
- NotificationUsers, NotificationTitles, NotificationMessages, NotificationTimes, Notifications

