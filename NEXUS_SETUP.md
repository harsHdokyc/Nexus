# Nexus - Unified Communication Hub
## Production-Grade Supabase Setup Guide

This document outlines the complete Supabase foundation for Nexus, a SaaS application that aggregates communications from multiple platforms.

---

## 🏗️ Architecture Overview

Nexus uses **Supabase** as the complete backend solution:
- **Authentication**: User management and OAuth
- **Database**: PostgreSQL with Row Level Security
- **Realtime**: Live message updates
- **Storage**: File attachments
- **Edge Functions**: OAuth integrations

---

## 📁 Project Structure

```
/src
  /lib
    supabaseClient.ts          # Supabase client configuration
  /types
    database.types.ts          # Auto-generated DB types
    index.ts                   # Exported convenience types
  /services
    integrationsService.ts     # Integration management
    messagesService.ts         # Message operations
    threadsService.ts          # Thread management
    index.ts                   # Service exports
  /features
    /auth/
      authService.ts           # Authentication service
      index.ts
    /integrations/
      index.ts                 # Integration components (placeholder)
    /inbox/
      index.ts                 # Inbox components (placeholder)
/database
  schema.sql                   # Complete database schema
/scripts
  generate-types.sh            # Type generation script
  test-rls.sql                 # RLS testing script
```

---

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OAuth Credentials (for Edge Functions)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# ... other OAuth credentials
```

### 2. Database Setup

Run the complete schema:

```bash
# Via Supabase Dashboard SQL Editor
# Or via CLI:
supabase db reset
supabase db push database/schema.sql
```

### 3. Generate TypeScript Types

```bash
# Make the script executable (Linux/Mac)
chmod +x scripts/generate-types.sh

# Run type generation
./scripts/generate-types.sh

# Or add to package.json:
npm run generate-types
```

### 4. Test Row Level Security

```bash
# Run RLS tests in Supabase Dashboard SQL Editor
# Execute scripts/test-rls.sql section by section
# Verify all tests return "PASS"
```

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profiles extending `auth.users`
- **id**: UUID (references auth.users)
- **email**: User email
- **full_name**: Display name
- **notification_preferences**: JSON settings

#### `integrations`
Connected platform accounts per user
- **provider**: enum (email, slack, twitter, teams, meet)
- **account_identifier**: Platform-specific ID
- **access_token**: Encrypted OAuth token
- **status**: Integration health status

#### `messages`
Unified message store across platforms
- **platform**: Message source
- **content**: Message body
- **status**: read/unread/archived
- **thread_id**: Conversation grouping

#### `threads`
Conversation grouping
- **external_thread_id**: Platform thread ID
- **message_count**: Message count
- **last_message_at**: Latest activity

#### `attachments`
File attachments across platforms
- **message_id**: Reference to message
- **file_url**: Download URL
- **metadata**: File information

---

## 🔒 Security Features

### Row Level Security (RLS)

**All tables have RLS enabled with strict user isolation:**

```sql
-- Example policy for messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);
```

**Security guarantees:**
- ✅ Users can only access their own data
- ✅ No cross-user data leakage
- ✅ Tokens protected by RLS
- ✅ Attachments inherit message security

### Token Storage Strategy

**Recommended approaches:**
1. **Encryption at application level** before storage
2. **Supabase Vault** for sensitive credentials
3. **RLS policies** restrict token access

**Current implementation:**
- Tokens stored in `integrations` table
- RLS prevents cross-user access
- Recommend encryption before insertion

---

## 🚀 Usage Examples

### Authentication

```typescript
import { AuthService } from './features/auth'

// Sign in
const { data, error } = await AuthService.signIn(email, password)

// Get current user
const { data: user } = await AuthService.getCurrentUser()
```

### Integrations

```typescript
import { IntegrationsService } from './services'

// Get user integrations
const { data: integrations } = await IntegrationsService.getUserIntegrations()

// Create new integration
const { data: integration } = await IntegrationsService.createIntegration({
  user_id: userId,
  provider: 'slack',
  account_identifier: 'workspace-id',
  access_token: encryptedToken
})
```

### Messages

```typescript
import { MessagesService } from './services'

// Get messages with pagination
const { data: messages, count } = await MessagesService.getUserMessages(50, 0)

// Search messages
const { data: results } = await MessagesService.searchMessages('query')

// Real-time updates
const subscription = MessagesService.subscribeToMessages((payload) => {
  console.log('New message:', payload)
})
```

---

## 📊 Performance Optimizations

### Database Indexes

**Strategic indexes for common queries:**
- User-based lookups: `user_id` indexes
- Time-based queries: `received_at DESC`
- Full-text search: `to_tsvector('english', content)`
- Composite indexes: `(user_id, status, received_at)`

### Query Optimization

**Efficient patterns:**
- Pagination with `range()` and `count: 'exact'`
- Selective column fetching
- View definitions for complex queries
- Real-time subscriptions instead of polling

---

## 🧪 Testing & Validation

### RLS Testing

Run `scripts/test-rls.sql` to verify:
- ✅ User data isolation
- ✅ Cross-user access prevention
- ✅ Policy enforcement
- ✅ View security

### Performance Testing

```sql
-- Test message query performance
EXPLAIN ANALYZE 
SELECT * FROM messages 
WHERE user_id = $1 
ORDER BY received_at DESC 
LIMIT 50;
```

---

## 🔧 Development Workflow

### Type Safety

1. **Generate types** after schema changes
2. **Use typed services** for all operations
3. **Import types** from `src/types/index.ts`

### Schema Changes

1. **Update `database/schema.sql`**
2. **Apply to Supabase**
3. **Regenerate types**
4. **Update services**

### Testing

1. **Run RLS tests** after security changes
2. **Test with multiple users**
3. **Verify real-time subscriptions**
4. **Check performance on large datasets**

---

## 🚀 Production Considerations

### Scaling

**Messages table optimization:**
- Partitioning by date for large datasets
- Archive old messages
- Implement soft deletes
- Consider read replicas

**Realtime scaling:**
- Limit subscription channels
- Implement connection pooling
- Monitor WebSocket connections

### Monitoring

**Key metrics:**
- Query performance
- RLS policy execution time
- Real-time subscription count
- Token refresh failures

### Security

**Production checklist:**
- ✅ RLS enabled on all tables
- ✅ No service_role keys in frontend
- ✅ Tokens encrypted at rest
- ✅ OAuth credentials in Edge Functions
- ✅ Regular security audits

---

## 📚 Next Steps

1. **Implement OAuth flows** in Edge Functions
2. **Build React components** for each feature
3. **Add real-time UI updates**
4. **Implement file upload/download**
5. **Add message threading UI**
6. **Create admin dashboard**
7. **Add analytics and reporting**

---

## 🤝 Contributing

When contributing to Nexus:
1. **Update types** after schema changes
2. **Test RLS policies** thoroughly
3. **Follow security best practices**
4. **Document new features**
5. **Update this README**

---

## 📞 Support

For questions about this setup:
- Review the schema comments in `database/schema.sql`
- Check the service implementations in `src/services/`
- Run the RLS tests to verify security
- Consult Supabase documentation for advanced features
