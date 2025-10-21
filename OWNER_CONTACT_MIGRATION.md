# Fix Owner Contact Columns Migration

## Problem
The application was trying to insert `owner_email` and `owner_phone` columns that don't exist in the `properties` table, causing the error:
```
column properties.owner_email does not exist
```

## Solution
Run the SQL migration to add these columns to your database.

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (in the left sidebar)

### 2. Run the Migration
Copy and paste the following SQL command and click **Run**:

```sql
-- Add owner contact columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS owner_email TEXT,
ADD COLUMN IF NOT EXISTS owner_phone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN properties.owner_email IS 'Owner email for direct contact';
COMMENT ON COLUMN properties.owner_phone IS 'Owner phone number for direct contact';
```

### 3. Verify the Migration
Run this query to confirm the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('owner_email', 'owner_phone');
```

You should see both columns listed.

### 4. Test the Application
1. Stop your dev server if it's running (Ctrl+C)
2. Restart it: `npm run dev`
3. Try listing a new property with your phone number
4. Click "Contact" on a property to verify the contact info displays correctly

## What Changed

### Database
- Added `owner_email` column to store the property owner's email
- Added `owner_phone` column to store the property owner's phone number

### Frontend (src/app/properties/new/page.tsx)
- Added phone number field to the listing form
- Made it required for property owners to provide contact info
- Email is automatically collected from the authenticated user's account

### Backend (src/app/api/properties/route.ts)
- Updated POST endpoint to accept and save `ownerPhone` from the request
- Stores both `owner_email` (from auth session) and `owner_phone` (from form)

### Contact Flow (src/app/api/properties/[id]/contact/route.ts)
- Already configured to return these fields
- Will now successfully fetch and display owner contact information

## Notes
- The migration uses `IF NOT EXISTS` so it's safe to run multiple times
- Existing properties will have NULL values for these columns
- New properties will require a phone number and will automatically include the owner's email
