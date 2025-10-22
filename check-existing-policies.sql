-- Check if payments and premium_users tables exist and their current policies
-- Run this FIRST to see what we're working with

-- Check table existence
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'premium_users');

-- Check existing policies on payments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'payments';

-- Check existing policies on premium_users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'premium_users';
