-- Fixed: Admin Setup SQL
-- This version handles the existing user_role enum

-- STEP 1: Check what values are in the user_role enum
-- Run this first to see what's available:
SELECT enum_range(NULL::user_role);

-- You'll likely see something like: {tenant,landlord,admin}


-- STEP 2: Drop the old users table if it exists from previous attempt
DROP TABLE IF EXISTS public.users CASCADE;


-- STEP 3: Create users table using the existing enum (or TEXT if no enum exists)
-- Option A: If user_role enum exists and has 'tenant', 'landlord', 'admin':
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role user_role DEFAULT 'tenant', -- Change default based on what you see in step 1
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Option B: If the enum doesn't have the values you want, use TEXT instead:
-- CREATE TABLE public.users (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email TEXT,
--   role TEXT DEFAULT 'tenant',
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );


-- STEP 4: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- STEP 6: Create function to auto-create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'tenant') -- Use 'tenant' or whatever is the default role
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- STEP 7: Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- STEP 8: Copy existing auth users to users table
-- Use 'tenant' or whatever is a valid enum value
INSERT INTO public.users (id, email, role)
SELECT id, email, 'tenant'::user_role  -- Cast to user_role enum
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- STEP 9: Make yourself admin (REPLACE WITH YOUR EMAIL!)
UPDATE public.users 
SET role = 'admin'::user_role  -- Cast to user_role enum
WHERE email = 'your-email@example.com';


-- STEP 10: Verify it worked
SELECT id, email, role 
FROM public.users 
WHERE email = 'your-email@example.com';
