-- =====================================================
-- KigaliCribs Database Migration Script
-- =====================================================
-- This script sets up all required tables for the payment system
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. ADD MISSING COLUMNS TO PROPERTIES TABLE
-- These columns are used for contact information
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20);

-- 2. CREATE PAYMENTS TABLE (for premium features)
-- This is separate from the lease payments table
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('momo', 'airtel')),
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_id VARCHAR(100) UNIQUE,
  external_reference VARCHAR(100),
  purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('premium_monthly', 'premium_yearly', 'contact_unlock', 'featured_listing')),
  property_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);

-- 3. CREATE PREMIUM_USERS TABLE
-- Tracks active premium subscriptions
DROP TABLE IF EXISTS premium_users CASCADE;

CREATE TABLE premium_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  subscription_type VARCHAR(20) NOT NULL CHECK (subscription_type IN ('monthly', 'yearly')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_expires_at ON premium_users(expires_at);

-- 4. CREATE CONTACT_UNLOCKS TABLE
-- Tracks which users have unlocked contact info for which properties
DROP TABLE IF EXISTS contact_unlocks CASCADE;

CREATE TABLE contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  payment_id UUID REFERENCES payments(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_unlocks_user_id ON contact_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_property_id ON contact_unlocks(property_id);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_unlocks ENABLE ROW LEVEL SECURITY;

-- 6. DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON payments;
DROP POLICY IF EXISTS "Users can view their own premium status" ON premium_users;
DROP POLICY IF EXISTS "Users can view their own unlocks" ON contact_unlocks;
DROP POLICY IF EXISTS "Users can create their own unlocks" ON contact_unlocks;

-- 7. CREATE RLS POLICIES FOR PAYMENTS
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can update payments"
  ON payments FOR UPDATE
  TO service_role
  USING (true);

-- 8. CREATE RLS POLICIES FOR PREMIUM_USERS
CREATE POLICY "Users can view their own premium status"
  ON premium_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage premium_users"
  ON premium_users FOR ALL
  TO service_role
  USING (true);

-- 9. CREATE RLS POLICIES FOR CONTACT_UNLOCKS
CREATE POLICY "Users can view their own unlocks"
  ON contact_unlocks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own unlocks"
  ON contact_unlocks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 10. CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_users_updated_at ON premium_users;
CREATE TRIGGER update_premium_users_updated_at
  BEFORE UPDATE ON premium_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. ADD HELPFUL COMMENTS
COMMENT ON TABLE payments IS 'Tracks payment transactions for premium features (subscriptions, contact unlocks, featured listings)';
COMMENT ON TABLE premium_users IS 'Tracks active premium subscriptions for users';
COMMENT ON TABLE contact_unlocks IS 'Tracks which users have unlocked contact information for properties';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Check that RLS policies are active
-- 3. Test the payment flow in your application
-- =====================================================
