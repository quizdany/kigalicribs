# Database Migration Guide

## IMPORTANT: Run this BEFORE testing the new features

### Step 1: Backup Current Database
In Supabase Dashboard:
1. Go to Database → Backups
2. Create a manual backup (optional but recommended)

### Step 2: Run Migration Script
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `SETUP_DATABASE.sql`
3. Paste into SQL Editor
4. Click "Run" button
5. Wait for completion (should take 10-30 seconds)

### Step 3: Verify Tables Created
Run this query in SQL Editor:
```sql
-- Check if new columns exist in properties
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('listing_type', 'verification_status', 'verified_at', 'listing_expires_at', 'featured_until', 'priority_until', 'refresh_count', 'photo_count');

-- Check if property_verifications table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'property_verifications'
);

-- Check payment purposes are updated
SELECT DISTINCT purpose FROM payments;
```

Expected results:
- 8 columns should be returned for properties
- property_verifications should exist (returns true)
- Payment purposes should include new values

### Step 4: Update Existing Properties (Optional)
If you have existing properties, set default values:
```sql
-- Set default listing type and verification status for existing properties
UPDATE properties 
SET 
  listing_type = 'basic',
  verification_status = 'none',
  refresh_count = 0,
  photo_count = COALESCE(array_length(images, 1), 0)
WHERE listing_type IS NULL;
```

### Step 5: Test RLS Policies
```sql
-- Test that policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('payments', 'premium_users', 'contact_unlocks', 'property_verifications');
```

You should see multiple policies for each table.

### Step 6: Add Environment Variables
Add to your `.env.local`:
```bash
# For cron job authentication
CRON_SECRET=generate_a_secure_random_string_here

# Service role key (get from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 7: Restart Development Server
```bash
npm run dev
```

## Troubleshooting

### Error: "column already exists"
This is normal if you're re-running the script. The `ADD COLUMN IF NOT EXISTS` will skip existing columns.

### Error: "table already exists"
The script uses `DROP TABLE IF EXISTS CASCADE` so this shouldn't happen. If it does, you can manually drop the tables:
```sql
DROP TABLE IF EXISTS property_verifications CASCADE;
DROP TABLE IF EXISTS contact_unlocks CASCADE;
DROP TABLE IF EXISTS premium_users CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
```
Then re-run the migration.

### Error: "permission denied"
Make sure you're running the SQL as the database owner (usually the project owner).

### RLS Policies Not Working
Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('payments', 'premium_users', 'contact_unlocks', 'property_verifications');
```

All should show `rowsecurity = true`.

## Rollback (if needed)

If you need to undo the changes:
```sql
-- Remove new columns from properties
ALTER TABLE properties 
DROP COLUMN IF EXISTS listing_type,
DROP COLUMN IF EXISTS verification_status,
DROP COLUMN IF EXISTS verified_at,
DROP COLUMN IF EXISTS listing_expires_at,
DROP COLUMN IF EXISTS featured_until,
DROP COLUMN IF EXISTS priority_until,
DROP COLUMN IF EXISTS refresh_count,
DROP COLUMN IF EXISTS photo_count;

-- Drop new tables
DROP TABLE IF EXISTS property_verifications CASCADE;

-- Note: Don't drop payments, premium_users, contact_unlocks as they may have existing data
-- Instead, you'd need to manually update payment purposes back to old values
```

## Post-Migration Checks

1. **Properties Table**: New columns visible in Supabase Table Editor
2. **Property Verifications**: New table appears in left sidebar
3. **Payments**: Can insert new payment purposes without errors
4. **API Tests**: Test payment initiation with new purposes

## Success Criteria

✅ Migration script runs without errors
✅ All new columns exist in properties table
✅ property_verifications table created
✅ RLS policies active on all tables
✅ Payment API accepts new purposes
✅ No TypeScript build errors (warnings OK)

---

**Next Steps After Migration:**
1. Test payment flow with new purposes
2. Test contact unlock limits
3. Create test verification request
4. Test admin approval workflow
5. Test refresh/extend APIs
6. Set up cron job for expiry monitoring
