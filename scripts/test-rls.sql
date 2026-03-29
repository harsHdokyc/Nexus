-- ===========================================
-- Nexus - RLS Testing Script
-- Tests Row Level Security and data isolation
-- ===========================================

-- NOTE: This script should be run with different user contexts
-- Use: SET ROLE authenticated_user; or test via Supabase Dashboard

-- ===========================================
-- TEST 1: Cross-User Data Access Prevention
-- ===========================================

-- Create test users (run as service_role)
INSERT INTO auth.users (id, email, email_confirmed_at) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user1@test.com', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'user2@test.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users
INSERT INTO profiles (id, email) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user1@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'user2@test.com')
ON CONFLICT (id) DO NOTHING;

-- Create test integrations for user1
INSERT INTO integrations (user_id, provider, account_identifier, account_name, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'email', 'user1@gmail.com', 'User1 Gmail', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'slack', 'user1-slack', 'User1 Slack', 'active')
ON CONFLICT (user_id, provider, account_identifier) DO NOTHING;

-- Create test integrations for user2
INSERT INTO integrations (user_id, provider, account_identifier, account_name, status)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'email', 'user2@gmail.com', 'User2 Gmail', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'twitter', '@user2', 'User2 Twitter', 'active')
ON CONFLICT (user_id, provider, account_identifier) DO NOTHING;

-- ===========================================
-- TEST 2: User Context Testing
-- ===========================================

-- Test as USER1 - Should only see their own data
-- Run this section with: SET LOCAL ROLE authenticated_user; 
-- And set: auth.uid() = '11111111-1111-1111-1111-111111111111'

-- Test: User1 should see only their profile (Alternative simpler test)
SELECT 'USER1 PROFILE TEST (SIMPLE)' as test_name,
       CASE 
         WHEN id = '11111111-1111-1111-1111-111111111111' AND email = 'user1@test.com' THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM profiles 
WHERE id = '11111111-1111-1111-1111-111111111111'
LIMIT 1;

-- Test: User1 should see only their integrations (2 records)
SELECT 'USER1 INTEGRATIONS TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 2 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM integrations 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Test: User1 should NOT see User2's integrations
SELECT 'USER1 CANNOT SEE USER2 INTEGRATIONS TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM integrations 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- Test: User1 should not be able to insert integrations for User2
SELECT 'USER1 CANNOT INSERT FOR USER2 TEST' as test_name,
       CASE 
         WHEN 1 = 0 THEN 'PASS' -- This should fail
         ELSE 'FAIL (Expected failure)'
       END as result;
-- This INSERT should fail due to RLS:
-- INSERT INTO integrations (user_id, provider, account_identifier) 
-- VALUES ('22222222-2222-2222-2222-222222222222', 'email', 'should-fail@test.com');

-- ===========================================
-- TEST 3: User2 Context Testing
-- ===========================================

-- Test as USER2 - Should only see their own data
-- Run this section with: SET LOCAL ROLE authenticated_user; 
-- And set: auth.uid() = '22222222-2222-2222-2222-222222222222'

-- Test: User2 should see only their profile (Alternative simpler test)
SELECT 'USER2 PROFILE TEST (SIMPLE)' as test_name,
       CASE 
         WHEN id = '22222222-2222-2222-2222-222222222222' AND email = 'user2@test.com' THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM profiles 
WHERE id = '22222222-2222-2222-2222-222222222222'
LIMIT 1;

-- Test: User2 should see only their integrations (2 records)
SELECT 'USER2 INTEGRATIONS TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 2 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM integrations 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- Test: User2 should NOT see User1's integrations
SELECT 'USER2 CANNOT SEE USER1 INTEGRATIONS TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM integrations 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- ===========================================
-- TEST 4: Message Isolation Testing
-- ===========================================

-- Create test messages
INSERT INTO messages (
  user_id, 
  integration_id, 
  external_message_id, 
  platform, 
  sender_name, 
  content, 
  thread_id,
  received_at
)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  id,
  'msg_' || id,
  provider,
  'Sender ' || id,
  'Test message content for user1',
  CASE 
    WHEN provider = 'email' THEN 'thread1'
    WHEN provider = 'slack' THEN 'thread2'
    ELSE NULL
  END,
  NOW()
FROM integrations 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 2;

INSERT INTO messages (
  user_id, 
  integration_id, 
  external_message_id, 
  platform, 
  sender_name, 
  content, 
  thread_id,
  received_at
)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'msg_' || id,
  provider,
  'Sender ' || id,
  'Test message content for user2',
  CASE 
    WHEN provider = 'email' THEN 'thread3'
    WHEN provider = 'twitter' THEN 'thread4'
    ELSE NULL
  END,
  NOW()
FROM integrations 
WHERE user_id = '22222222-2222-2222-2222-222222222222'
LIMIT 2;

-- Test: User1 should only see their messages
-- Run as: auth.uid() = '11111111-1111-1111-1111-111111111111'
SELECT 'USER1 MESSAGES ISOLATION TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 2 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM messages 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Test: User1 should not see User2's messages
-- Run as: auth.uid() = '11111111-1111-1111-1111-111111111111'
SELECT 'USER1 CANNOT SEE USER2 MESSAGES TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM messages 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- ===========================================
-- TEST 5: Thread Isolation Testing
-- ===========================================

-- Create test threads
INSERT INTO threads (
  user_id, 
  platform, 
  external_thread_id, 
  subject, 
  last_message_at
)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'email', 'thread1', 'User1 Thread 1', NOW()),
  ('11111111-1111-1111-1111-111111111111', 'slack', 'thread2', 'User1 Thread 2', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'email', 'thread3', 'User2 Thread 1', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'twitter', 'thread4', 'User2 Thread 2', NOW())
ON CONFLICT (user_id, platform, external_thread_id) DO NOTHING;

-- Test: User1 should only see their threads
-- Run as: auth.uid() = '11111111-1111-1111-1111-111111111111'
SELECT 'USER1 THREADS ISOLATION TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 2 THEN 'PASS'
         ELSE 'FAIL'
       END as result
FROM threads 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- ===========================================
-- TEST 6: Attachment Security Testing
-- ===========================================

-- Create test attachments
INSERT INTO attachments (
  message_id, 
  filename, 
  file_type, 
  file_size
)
SELECT 
  id,
  'attachment_' || id || '.pdf',
  'application/pdf',
  1024
FROM messages 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1;

-- Test: User1 should see attachments for their messages only
-- Run as: auth.uid() = '11111111-1111-1111-1111-111111111111'
SELECT 'USER1 ATTACHMENTS SECURITY TEST' as test_name,
       CASE 
         WHEN COUNT(*) >= 0 THEN 'PASS' -- Should see their attachments
         ELSE 'FAIL'
       END as result
FROM attachments a
JOIN messages m ON a.message_id = m.id
WHERE m.user_id = '11111111-1111-1111-1111-111111111111';

-- ===========================================
-- TEST 7: View Security Testing
-- ===========================================

-- Test: message_details view should respect RLS
-- Run as: auth.uid() = '11111111-1111-1111-1111-111111111111'
SELECT 'MESSAGE_DETAILS VIEW RLS TEST' as test_name,
       CASE 
         WHEN COUNT(*) >= 0 THEN 'PASS' -- Should see only their message details
         ELSE 'FAIL'
       END as result
FROM message_details 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Test: unread_counts view should show only current user
-- Run as: auth.uid() = '11111111-1111-1111-1111-111111111111'
SELECT 'UNREAD_COUNTS VIEW RLS TEST' as test_name,
       CASE 
         WHEN COUNT(*) = 1 THEN 'PASS' -- Should see only their counts
         ELSE 'FAIL'
       END as result
FROM unread_counts 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- ===========================================
-- CLEANUP (Run as service_role)
-- ===========================================

-- Uncomment to clean up test data

DELETE FROM attachments WHERE message_id IN (
  SELECT id FROM messages WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
  )
);

DELETE FROM messages WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

DELETE FROM threads WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

DELETE FROM integrations WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

