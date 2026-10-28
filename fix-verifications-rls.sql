-- Fix RLS policies for property_verifications table

-- 1. Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'property_verifications';

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Landlords can view own verifications" ON property_verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON property_verifications;
DROP POLICY IF EXISTS "Service role can manage verifications" ON property_verifications;
DROP POLICY IF EXISTS "Users can view own verification requests" ON property_verifications;

-- 3. Create new policies that allow admin access

-- Allow landlords to view their own verification requests
CREATE POLICY "Landlords can view own verifications" ON property_verifications
  FOR SELECT
  USING (
    auth.uid() = landlord_id
  );

-- Allow admins to view all verifications (check against users table)
CREATE POLICY "Admins can view all verifications" ON property_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Allow admins to update verifications (for approval/rejection)
CREATE POLICY "Admins can update verifications" ON property_verifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'::user_role
    )
  );

-- Allow system to insert verifications (for payment processing)
CREATE POLICY "Allow insert for authenticated users" ON property_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = landlord_id);

-- 4. Test if admin can now see verifications
SELECT 
  pv.*,
  p.title
FROM property_verifications pv
LEFT JOIN properties p ON p.id = pv.property_id
WHERE pv.status = 'pending'
ORDER BY pv.requested_at DESC;
