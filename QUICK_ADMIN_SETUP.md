# Quick Admin Setup Guide

## You're getting "Admin access required" because the users table with roles doesn't exist yet.

Follow these steps to fix it:

---

## Step 1: Create the users table with roles

Go to Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select your project: `ciedcesfclfqukhrnqrp`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create users table for roles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'landlord', 'tenant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Service role can manage all users
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Auto-create user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Copy existing auth users to users table
INSERT INTO public.users (id, email, role)
SELECT id, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

---

## Step 2: Make yourself an admin

Still in SQL Editor, run this (replace with YOUR email):

```sql
-- Set your account as admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'YOUR-EMAIL@EXAMPLE.COM';

-- Verify it worked
SELECT id, email, role 
FROM public.users 
WHERE email = 'YOUR-EMAIL@EXAMPLE.COM';
```

You should see your user with role = 'admin'

---

## Step 3: Access the admin dashboard

Now go back to your app:
1. Make sure you're logged in with that email
2. Navigate to: http://localhost:3001/admin/verifications
3. You should see the admin dashboard! 🎉

---

## If you still get "Admin access required":

1. **Clear your browser cache/cookies** or try incognito mode
2. **Log out and log back in** to refresh your session
3. **Check in Supabase** that your user has role = 'admin':
   ```sql
   SELECT email, role FROM public.users;
   ```
4. **Check browser console** for any error messages

---

## Quick Test:

To test the whole flow:
1. Create a property or use an existing one
2. Click "Upgrade Listing" 
3. Pay for verification (use sandbox: any 250-prefixed phone)
4. Go to `/admin/verifications`
5. You should see the pending request
6. Click "Approve"
7. Refresh the property page - verified badge appears! ✅
