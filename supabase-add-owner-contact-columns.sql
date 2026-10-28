-- Add owner contact columns to properties table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS owner_email TEXT,
ADD COLUMN IF NOT EXISTS owner_phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN properties.owner_email IS 'Owner email for direct contact';
COMMENT ON COLUMN properties.owner_phone IS 'Owner phone number for direct contact';
