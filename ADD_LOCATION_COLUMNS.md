# Add Sector and Cell Columns to Properties Table

## Problem
The application is trying to use `sector` and `cell` columns that don't exist in the `properties` table in your Supabase database.

## Solution
Run the SQL migration to add these columns.

## Steps

### 1. Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (kigalicribs)
3. Click on "SQL Editor" in the left sidebar

### 2. Run the Migration
Copy and paste this SQL code into the SQL Editor:

```sql
-- Add sector and cell columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS sector varchar(100),
ADD COLUMN IF NOT EXISTS cell varchar(100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_sector ON properties(sector);
CREATE INDEX IF NOT EXISTS idx_properties_cell ON properties(cell);
```

### 3. Execute
Click the "Run" button to execute the SQL.

### 4. Verify
You can verify the columns were added by running:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('sector', 'cell', 'district')
ORDER BY column_name;
```

You should see all three location columns listed.

### 5. Restart Your Application
After adding the columns, restart your development server:
- Stop the current server (Ctrl+C)
- Run `npm run dev` again

## What These Columns Store
- **sector**: The sector name within the selected district (e.g., "Kacyiru", "Kimironko")
- **cell**: The cell name within the selected sector (e.g., "Kibagabaga", "Kagugu")
- Both are optional fields (nullable) that provide more precise location information

## Alternative: Use SQL File
You can also find the migration in the file: `supabase-add-location-fields.sql`
