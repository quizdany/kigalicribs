-- Enable Row Level Security on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (optional, only if you need to recreate)
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Anyone can view properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;

-- Policy 1: Allow authenticated users to insert their own properties
CREATE POLICY "Users can insert their own properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Policy 2: Allow anyone to view all properties (public read)
CREATE POLICY "Anyone can view properties"
ON properties FOR SELECT
TO public
USING (true);

-- Policy 3: Allow users to update only their own properties
CREATE POLICY "Users can update their own properties"
ON properties FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy 4: Allow users to delete only their own properties
CREATE POLICY "Users can delete their own properties"
ON properties FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);
