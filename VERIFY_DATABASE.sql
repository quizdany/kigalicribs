-- =====================================================
-- VERIFY DATABASE SETUP
-- =====================================================
-- Run this query AFTER running SETUP_DATABASE.sql
-- to verify everything was created correctly
-- =====================================================

-- 1. Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('payments', 'premium_users', 'contact_unlocks') THEN '✓ CREATED'
    ELSE '○ EXISTING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check if RLS is enabled on payment tables
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('payments', 'premium_users', 'contact_unlocks')
ORDER BY tablename;

-- 3. Count RLS policies on each table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('payments', 'premium_users', 'contact_unlocks')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 4. Check properties table has new columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('owner_email', 'owner_phone')
ORDER BY column_name;

-- 5. List all indexes on payment tables
SELECT 
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('payments', 'premium_users', 'contact_unlocks')
ORDER BY tablename, indexname;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- Query 1: Should show payments, premium_users, contact_unlocks with "✓ CREATED" status
-- Query 2: Should show rls_enabled = true for all 3 tables
-- Query 3: Should show at least 2 policies per table
-- Query 4: Should show owner_email and owner_phone columns
-- Query 5: Should show multiple indexes (idx_payments_user_id, etc.)
-- =====================================================
