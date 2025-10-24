-- Add sector and cell columns to properties table
-- Run this in your Supabase SQL Editor

-- Add the new location columns
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS sector varchar(100),
ADD COLUMN IF NOT EXISTS cell varchar(100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_sector ON properties(sector);
CREATE INDEX IF NOT EXISTS idx_properties_cell ON properties(cell);

-- Verify the columns were added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'properties' 
-- AND column_name IN ('sector', 'cell', 'district');
