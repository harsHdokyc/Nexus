-- ===========================================
-- Nexus - Authentication Schema & RLS Policies
-- Production-Grade Security Implementation
-- ===========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- PROFILES TABLE (User Management)
-- ===========================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "slack": false}',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to auth.users
  CONSTRAINT fk_profile_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ===========================================
-- USER ACTIVITY LOGGING (Security)
-- ===========================================

-- Create user activity log table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'otp_sent', 'otp_verified', 'password_change'
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_action CHECK (action IN ('login', 'logout', 'otp_sent', 'otp_verified', 'password_change', 'session_expired', 'magic_link_sent'))
);

-- ===========================================
-- SESSION MANAGEMENT (Custom 30-Day Control)
-- ===========================================

-- Create custom session tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token_hash VARCHAR(255) NOT NULL, -- Hashed session identifier
  login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT future_expiry CHECK (expires_at > created_at),
  CONSTRAINT valid_session_hash CHECK (length(session_token_hash) >= 32)
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);

-- User activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON user_activity_logs(user_id, action);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(session_token_hash);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) - CRITICAL
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON user_activity_logs;

DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;

-- ===========================================
-- PROFILES RLS POLICIES
-- ===========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for auto-creation)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can manage all profiles (for admin functions)
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ===========================================
-- USER ACTIVITY LOGS RLS POLICIES
-- ===========================================

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activity logs (for tracking)
CREATE POLICY "Users can insert own activity logs" ON user_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can view all activity logs
CREATE POLICY "Service role can view all activity logs" ON user_activity_logs
  FOR SELECT USING (auth.role() = 'service_role');

-- Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs" ON user_activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ===========================================
-- USER SESSIONS RLS POLICIES
-- ===========================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions (for activity tracking)
CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions (for logout)
CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can manage all sessions
CREATE POLICY "Service role can manage all sessions" ON user_sessions
  FOR ALL USING (auth.role() = 'service_role');

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
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, email_verified)
  VALUES (
    new.id,
    new.email,
    new.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = new.email,
    email_verified = new.email_confirmed_at IS NOT NULL,
    updated_at = NOW();
  
  -- Log user creation activity
  INSERT INTO public.user_activity_logs (user_id, action, metadata)
  VALUES (
    new.id,
    'login',
    json_build_object('method', 'signup', 'email_confirmed', new.email_confirmed_at IS NOT NULL)
  );
  
  RETURN new;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile on login
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last login timestamp
  UPDATE public.profiles 
  SET 
    last_login_at = NOW(),
    updated_at = NOW()
  WHERE id = auth.uid();
  
  -- Log login activity
  INSERT INTO public.user_activity_logs (user_id, action, ip_address, user_agent)
  VALUES (
    auth.uid(),
    'login',
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN NEW;
END;
$$;

-- Function to log user logout
CREATE OR REPLACE FUNCTION public.handle_user_logout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log logout activity
  INSERT INTO public.user_activity_logs (user_id, action, ip_address, user_agent)
  VALUES (
    auth.uid(),
    'logout',
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN NEW;
END;
$$;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate expired sessions
  UPDATE public.user_sessions 
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE is_active = true 
  AND expires_at < NOW();
  
  -- Log session cleanup
  INSERT INTO public.user_activity_logs (user_id, action, metadata)
  SELECT 
    user_id,
    'session_expired',
    json_build_object('expired_sessions', COUNT(*))
  FROM public.user_sessions 
  WHERE is_active = false 
  AND updated_at = NOW()
  GROUP BY user_id;
END;
$$;

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- View for user profile with session info
CREATE OR REPLACE VIEW user_profile_with_session AS
SELECT 
  p.*,
  s.expires_at,
  s.last_activity_at,
  s.is_active as session_active,
  CASE 
    WHEN s.expires_at > NOW() THEN true 
    ELSE false 
  END as session_valid
FROM profiles p
LEFT JOIN user_sessions s ON p.id = s.user_id AND s.is_active = true
WHERE p.id = auth.uid();

-- View for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.last_login_at,
  COUNT(al.id) as total_activities,
  MAX(al.created_at) as last_activity,
  COUNT(CASE WHEN al.action = 'login' THEN 1 END) as login_count,
  COUNT(CASE WHEN al.action = 'otp_sent' THEN 1 END) as otp_requests
FROM profiles p
LEFT JOIN user_activity_logs al ON p.id = al.user_id
WHERE p.id = auth.uid()
GROUP BY p.id, p.email, p.full_name, p.last_login_at;

-- ===========================================
-- SECURITY FUNCTIONS
-- ===========================================

-- Function to validate session token
CREATE OR REPLACE FUNCTION public.validate_session_token(token_hash VARCHAR(255))
RETURNS TABLE (user_id UUID, is_valid BOOLEAN, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    s.is_active AND s.expires_at > NOW() as is_valid,
    s.expires_at
  FROM user_sessions s
  WHERE s.session_token_hash = token_hash
  AND s.is_active = true;
END;
$$;

-- Function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  token_hash VARCHAR(255),
  expires_days INTEGER DEFAULT 30
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Create new session
  INSERT INTO user_sessions (
    user_id,
    session_token_hash,
    expires_at,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    token_hash,
    NOW() + (expires_days || ' days')::INTERVAL,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  )
  RETURNING id INTO session_id;
  
  -- Log session creation
  INSERT INTO user_activity_logs (user_id, action, metadata)
  VALUES (
    auth.uid(),
    'login',
    json_build_object('session_id', session_id, 'expires_days', expires_days)
  );
  
  RETURN session_id;
END;
$$;

-- ===========================================
-- MAINTENANCE AND CLEANUP
-- ===========================================

-- Function to clean up old activity logs (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM user_activity_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Schedule cleanup job (requires pg_cron extension)
-- Uncomment if you have pg_cron installed:
-- SELECT cron.schedule('cleanup-expired-sessions', '0 */6 * * *', 'SELECT public.cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-old-logs', '0 2 * * *', 'SELECT public.cleanup_old_activity_logs();');

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Nexus authentication schema created successfully!';
    RAISE NOTICE 'Tables: profiles, user_activity_logs, user_sessions';
    RAISE NOTICE 'Views: user_profile_with_session, user_activity_summary';
    RAISE NOTICE 'RLS: Enabled on all tables with strict user isolation';
    RAISE NOTICE 'Triggers: Auto-profile creation, activity logging';
    RAISE NOTICE 'Functions: Session validation, cleanup utilities';
END
$$;
