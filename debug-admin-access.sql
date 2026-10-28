-- Diagnostic SQL - Run these one by one to debug

-- 1. Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) AS users_table_exists;

-- 2. Check table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 3. Check what's in the users table
SELECT id, email, role, created_at 
FROM public.users 
LIMIT 10;

-- 4. Check if YOUR user exists and has admin role (REPLACE EMAIL)
SELECT id, email, role 
FROM public.users 
WHERE email = 'your-email@example.com';

-- 5. Get your auth user ID
SELECT id, email 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- 6. Check if the IDs match between auth.users and public.users
SELECT 
  a.id AS auth_id,
  a.email AS auth_email,
  u.id AS users_id,
  u.email AS users_email,
  u.role AS role
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.id
WHERE a.email = 'your-email@example.com';
