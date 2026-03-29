-- ===========================================
-- Nexus - Schema Update Script
-- Use this to update existing schema without conflicts
-- ===========================================

-- ===========================================
-- DROP EXISTING OBJECTS (Use with caution!)
-- ===========================================
-- Uncomment these lines if you want to completely reset the schema

-- DROP TRIGGER IF EXISTS update_thread_stats_trigger ON messages;
-- DROP FUNCTION IF EXISTS public.update_thread_stats();
-- DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
-- DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
-- DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
-- DROP TRIGGER IF EXISTS update_threads_updated_at ON threads;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- DROP VIEW IF EXISTS message_details;
-- DROP VIEW IF EXISTS unread_counts;

-- DROP TABLE IF EXISTS attachments;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS threads;
-- DROP TABLE IF EXISTS integrations;
-- DROP TABLE IF EXISTS profiles;

-- DROP TYPE IF EXISTS integration_status;
-- DROP TYPE IF EXISTS message_status;
-- DROP TYPE IF EXISTS provider;

-- ===========================================
-- CREATE/UPDATE ENUMS (Safe for updates)
-- ===========================================

-- Check if enum exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider') THEN
        CREATE TYPE provider AS ENUM (
            'email',
            'slack', 
            'twitter',
            'teams',
            'meet'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
        CREATE TYPE message_status AS ENUM (
            'unread',
            'read',
            'archived',
            'deleted'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'integration_status') THEN
        CREATE TYPE integration_status AS ENUM (
            'active',
            'inactive',
            'error',
            'expired'
        );
    END IF;
END
$$;

-- ===========================================
-- CREATE/UPDATE TABLES (Safe for updates)
-- ===========================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create integrations table if not exists
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider provider NOT NULL,
  account_identifier TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  status integration_status DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_provider_account UNIQUE(user_id, provider, account_identifier)
);

-- Create messages table if not exists
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  external_message_id TEXT NOT NULL,
  platform provider NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  sender_avatar TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text',
  status message_status DEFAULT 'unread',
  metadata JSONB DEFAULT '{}',
  thread_id TEXT,
  parent_message_id UUID REFERENCES messages(id),
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_integration_message UNIQUE(integration_id, external_message_id)
);

-- Create threads table if not exists
CREATE TABLE IF NOT EXISTS threads (
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

-- Create attachments table if not exists
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  file_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES (Safe to run multiple times)
-- ===========================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON integrations(user_id, provider);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_integration_id ON messages(integration_id);
CREATE INDEX IF NOT EXISTS idx_messages_platform ON messages(platform);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_status_received ON messages(user_id, status, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Threads indexes
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_platform ON threads(platform);
CREATE INDEX IF NOT EXISTS idx_threads_last_message_at ON threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_user_archived ON threads(user_id, is_archived);

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_file_type ON attachments(file_type);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
DROP POLICY IF EXISTS "Users can view own threads" ON threads;
DROP POLICY IF EXISTS "Users can insert own threads" ON threads;
DROP POLICY IF EXISTS "Users can update own threads" ON threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON threads;
DROP POLICY IF EXISTS "Users can view own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert own attachments" ON attachments;

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
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS message_details;
DROP VIEW IF EXISTS unread_counts;

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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_threads_updated_at ON threads;
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
DROP TRIGGER IF EXISTS update_thread_stats_trigger ON messages;
CREATE TRIGGER update_thread_stats_trigger
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_stats();

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Nexus schema update completed successfully!';
    RAISE NOTICE 'Tables: profiles, integrations, messages, threads, attachments';
    RAISE NOTICE 'Views: message_details, unread_counts';
    RAISE NOTICE 'RLS: Enabled on all tables';
    RAISE NOTICE 'Triggers: Auto-profile creation, timestamp updates, thread stats';
END
$$;
