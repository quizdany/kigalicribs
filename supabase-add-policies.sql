-- Create premium_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS premium_users (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_expires_at ON premium_users(expires_at);

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_premium_users_updated_at ON premium_users;
CREATE TRIGGER update_premium_users_updated_at
  BEFORE UPDATE ON premium_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE premium_users IS 'Tracks active premium subscriptions';

-- For now, disable RLS to allow testing
-- We'll add proper RLS policies after confirming the payment flow works
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users DISABLE ROW LEVEL SECURITY;
