-- Update properties table schema to support all new fields
-- Run this in your Supabase SQL Editor

-- First, let's see what columns exist
-- You can run: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties';

-- Add missing columns if they don't exist (modify as needed based on your existing schema)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS type varchar(20),
ADD COLUMN IF NOT EXISTS bedrooms integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS bathrooms integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS size decimal,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS district varchar(50),
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Make sure we have the required columns
-- Assuming you already have: id, owner_id, title, description, price, location, created_at, updated_at

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
