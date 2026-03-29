-- ===========================================
-- Nexus - Unified Communication Hub
-- Production-Grade Database Schema
-- ===========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- ENUMS
-- ===========================================

-- Platform providers enum
CREATE TYPE provider AS ENUM (
  'email',
  'slack', 
  'twitter',
  'teams',
  'meet'
);

-- Message status enum
CREATE TYPE message_status AS ENUM (
  'unread',
  'read',
  'archived',
  'deleted'
);

-- Integration status enum
CREATE TYPE integration_status AS ENUM (
  'active',
  'inactive',
  'error',
  'expired'
);

-- ===========================================
-- CORE TABLES
-- ===========================================

-- User profiles table
-- Extends auth.users with additional user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "slack": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to auth.users
  CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Integrations table
-- Stores connected platform accounts per user
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider provider NOT NULL,
  account_identifier TEXT NOT NULL, -- email, workspace ID, handle, etc.
  account_name TEXT, -- Display name for the account
  access_token TEXT, -- Encrypted storage recommended
  refresh_token TEXT, -- Encrypted storage recommended
  token_expiry TIMESTAMP WITH TIME ZONE,
  status integration_status DEFAULT 'active',
  metadata JSONB DEFAULT '{}', -- Platform-specific data
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_provider_account UNIQUE(user_id, provider, account_identifier)
);

-- Messages table
-- Unified message store across all platforms
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  external_message_id TEXT NOT NULL, -- Original message ID from platform
  platform provider NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  sender_avatar TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- text, html, markdown
  status message_status DEFAULT 'unread',
  metadata JSONB DEFAULT '{}', -- Platform-specific data, attachments, etc.
  thread_id TEXT, -- For grouping related messages
  parent_message_id UUID REFERENCES messages(id), -- For replies
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_integration_message UNIQUE(integration_id, external_message_id)
);

-- Threads table
-- Groups related messages for better organization
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform provider NOT NULL,
  external_thread_id TEXT,
  subject TEXT,
  participant_count INTEGER DEFAULT 1,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_platform_thread UNIQUE(user_id, platform, external_thread_id)
);

-- Message attachments table
-- Stores file attachments across platforms
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT, -- in bytes
  file_url TEXT, -- URL to download/access the file
  thumbnail_url TEXT, -- For images
  metadata JSONB DEFAULT '{}', -- MIME type, dimensions, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);

-- Integrations indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_user_provider ON integrations(user_id, provider);

-- Messages indexes
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_integration_id ON messages(integration_id);
CREATE INDEX idx_messages_platform ON messages(platform);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_received_at ON messages(received_at DESC);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_user_status_received ON messages(user_id, status, received_at DESC);
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Threads indexes
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_platform ON threads(platform);
CREATE INDEX idx_threads_last_message_at ON threads(last_message_at DESC);
CREATE INDEX idx_threads_user_archived ON threads(user_id, is_archived);

-- Attachments indexes
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_attachments_file_type ON attachments(file_type);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Integrations RLS policies
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages RLS policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);

-- Threads RLS policies
CREATE POLICY "Users can view own threads" ON threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads" ON threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads" ON threads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads" ON threads
  FOR DELETE USING (auth.uid() = user_id);

-- Attachments RLS policies
CREATE POLICY "Users can view own attachments" ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = attachments.message_id 
      AND messages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own attachments" ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = attachments.message_id 
      AND messages.user_id = auth.uid()
    )
  );

-- ===========================================
-- TRIGGERS AND FUNCTIONS
-- ===========================================

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    new.id,
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update thread message count and last message info
CREATE OR REPLACE FUNCTION public.update_thread_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update thread stats when new message is added
    -- Only update if thread_id is not null and a matching thread exists
    UPDATE threads 
    SET 
      message_count = message_count + 1,
      last_message_at = NEW.received_at,
      last_message_preview = LEFT(NEW.content, 100),
      updated_at = NOW()
    WHERE external_thread_id = NEW.thread_id::text
    AND user_id = NEW.user_id
    AND platform = NEW.platform;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update thread stats when message is deleted
    -- Only update if thread_id is not null and a matching thread exists
    UPDATE threads 
    SET 
      message_count = message_count - 1,
      updated_at = NOW()
    WHERE external_thread_id = OLD.thread_id::text
    AND user_id = OLD.user_id
    AND platform = OLD.platform;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for thread stats updates
CREATE TRIGGER update_thread_stats_trigger
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_stats();

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- View for messages with integration details
CREATE VIEW message_details AS
SELECT 
  m.*,
  i.provider as integration_provider,
  i.account_name as integration_account_name,
  i.account_identifier as integration_account_identifier
FROM messages m
JOIN integrations i ON m.integration_id = i.id;

-- View for unread message counts per user
CREATE VIEW unread_counts AS
SELECT 
  user_id,
  COUNT(*) as unread_count,
  COUNT(*) FILTER (WHERE platform = 'email') as email_unread,
  COUNT(*) FILTER (WHERE platform = 'slack') as slack_unread,
  COUNT(*) FILTER (WHERE platform = 'twitter') as twitter_unread,
  COUNT(*) FILTER (WHERE platform = 'teams') as teams_unread,
  COUNT(*) FILTER (WHERE platform = 'meet') as meet_unread
FROM messages
WHERE status = 'unread'
GROUP BY user_id;

-- ===========================================
-- SECURITY NOTES
-- ===========================================

-- 1. Tokens in integrations table should be encrypted at application level
-- 2. Consider using Supabase Vault for storing sensitive credentials
-- 3. All tables have RLS enabled with strict user isolation
-- 4. Indexes are optimized for common query patterns
-- 5. Full-text search is enabled on message content
-- 6. Timestamps are automatically managed via triggers
