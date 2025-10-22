-- Fix RLS policy to allow status updates
-- Run this in Supabase SQL Editor

-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Service role can update payments" ON payments;
DROP POLICY IF EXISTS "Users can update their payment status" ON payments;

-- Allow authenticated users to update their own payments (for status polling)
CREATE POLICY "Users can update their own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow service role full access for webhook updates
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  TO service_role
  USING (true);
