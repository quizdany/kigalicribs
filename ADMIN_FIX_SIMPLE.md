# Quick Fix for Admin Access

## The Problem
Your database has a `user_role` enum that doesn't accept 'user' as a value.

---

## Solution: Find and Use the Correct Enum Values

### Step 1: Check what enum values exist

In Supabase SQL Editor, run:

```sql
-- See what values are allowed
SELECT enum_range(NULL::user_role);
```

You'll probably see something like:
- `{tenant,landlord,admin}` OR
- `{user,landlord,admin}` OR  
- Something else

---

### Step 2: Create the users table (SIMPLIFIED)

Based on the enum values you see, run this SQL:

**If your enum has 'tenant', 'landlord', 'admin':**

```sql
-- Drop old table if exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role user_role DEFAULT 'tenant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Copy existing users with 'tenant' as default
INSERT INTO public.users (id, email, role)
SELECT id, email, 'tenant'::user_role
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

---

### Step 3: Make yourself admin

Replace with YOUR email:

```sql
UPDATE public.users 
SET role = 'admin'::user_role
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, role FROM public.users;
```

---

### Step 4: If enum doesn't have 'admin'

If the enum doesn't have 'admin' as a value, add it:

```sql
-- Add 'admin' to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Then make yourself admin
UPDATE public.users 
SET role = 'admin'::user_role
WHERE email = 'your-email@example.com';
```

---

### Step 5: Test

1. Log out and log back in
2. Go to: http://localhost:3001/admin/verifications
3. Should work! ✅

---

## Alternative: Check if users table already exists

Maybe the table already exists! Run this:

```sql
-- Check if users table exists and what's in it
SELECT * FROM public.users LIMIT 5;

-- If it exists, just make yourself admin:
UPDATE public.users 
SET role = 'admin'::user_role
WHERE email = 'your-email@example.com';
```

---

## Still having issues?

Share the output of:
```sql
-- 1. What enum values exist?
SELECT enum_range(NULL::user_role);

-- 2. Does users table exist?
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- 3. If it exists, what's the structure?
\d public.users
```
