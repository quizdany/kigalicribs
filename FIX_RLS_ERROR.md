# Fix Row-Level Security Policy Error

## The Issue
You're getting "new row violates row-level security policy for table 'properties'" because RLS is enabled but no policies allow inserts.

## Solution

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-rls-policies.sql`
5. Click **Run** or press `Ctrl+Enter`

### Option 2: Quick Fix - Disable RLS (NOT recommended for production)

If you just want to test quickly (development only):

```sql
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
```

**Warning:** This removes all security! Only use for local testing.

### What the Policies Do:

1. **INSERT Policy**: Allows authenticated users to create properties (with their own user ID as owner)
2. **SELECT Policy**: Allows everyone (public) to view all properties
3. **UPDATE Policy**: Allows users to update only their own properties
4. **DELETE Policy**: Allows users to delete only their own properties

## Verify It Works

After running the SQL:
1. Log in to your app
2. Click "List a Property"
3. Fill in the form
4. Upload images (after setting up storage)
5. Submit

The property should now be created successfully!
