# Database Setup Instructions

## Issue Fixed
The payment system was failing with "Payment failed: {}" because the required database tables (`payments`, `premium_users`, `contact_unlocks`) did not exist in your Supabase database.

## What Was Done

### 1. Created Database Migration Script
- File: `SETUP_DATABASE.sql`
- This creates all required tables for the payment system

### 2. Updated TypeScript Types
- Updated `src/lib/database.types.ts` to include new payment tables
- Updated `src/lib/supabase.ts` to add proper type definitions
- Renamed old `payments` table type to `lease_payments` to avoid conflicts

### 3. Fixed Schema Issues
- Added `owner_email` and `owner_phone` columns to properties table
- Created proper RLS policies for security
- Added indexes for performance

## How to Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `ciedcesfclfqukhrnqrp`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration
1. Click "New Query"
2. Open the file `SETUP_DATABASE.sql` from your project root
3. Copy all the SQL code
4. Paste it into the SQL Editor
5. Click "Run" or press Ctrl+Enter

### Step 3: Verify Tables Were Created
After running the migration, verify the tables exist:

```sql
-- Run this query to check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'premium_users', 'contact_unlocks');
```

You should see 3 rows returned.

### Step 4: Restart Your Dev Server
1. Stop the current dev server (Ctrl+C in terminal)
2. Start it again:
   ```powershell
   npm run dev
   ```

## Testing the Payment Flow

### Option 1: Demo Page
Visit: http://localhost:3001/demo/payment

This page has buttons to test all payment types.

### Option 2: Main App
1. Visit: http://localhost:3001
2. Click on any property
3. Try to unlock contact information
4. Or click "Upgrade to Premium"

### Expected Behavior (Mock Mode)
- Phone number can be any format (e.g., 0781234567)
- Payment will be initiated successfully
- Status will show "Processing"
- After 30 seconds in mock mode, payment completes automatically
- Console logs will show detailed information instead of empty `{}`

### Test Scenarios in Mock Mode
- **Normal phone**: Any number → Success after 30 seconds
- **Test failure**: Phone ending in `111` → Immediate failure
- **Test error**: Phone ending in `000` → Network error simulation

## What Changed in the Code

### Database Tables Created
1. **payments** - Tracks MoMo/Airtel transactions
2. **premium_users** - Tracks active subscriptions
3. **contact_unlocks** - Tracks which users unlocked which properties

### Type System Updates
- Separated lease payments from premium payments
- Added proper TypeScript types for all new tables
- Fixed property type to include owner contact fields

### Security (RLS Policies)
- Users can only see their own payments
- Users can only create payments for themselves
- Service role can update payment status (for webhooks)

## Troubleshooting

### If migration fails:
1. Check if tables already exist (they might from old SQL files)
2. The script uses `DROP TABLE IF EXISTS` to clean up first
3. Run the verify query to see which tables exist

### If payment still fails:
1. Check browser console for detailed error messages
2. Check terminal logs for API errors
3. Verify `.env.local` has `PAYMENT_MOCK_MODE=true`
4. Check Supabase dashboard → Authentication → Users (make sure you're logged in)

### If RLS errors occur:
Make sure you're authenticated:
1. Go to http://localhost:3001/auth
2. Sign up or log in
3. Try the payment flow again

## Next Steps

### For Production (Real Payments)
1. Get MTN MoMo API credentials from https://momodeveloper.mtn.com
2. Get Airtel Money API credentials from https://developers.airtel.africa
3. Update `.env.local` with real credentials
4. Set `PAYMENT_MOCK_MODE=false`
5. Test with small amounts first

### For Testing Now
- Everything should work with mock mode enabled
- You can test the full payment flow
- Database records will be created
- Check Supabase dashboard → Table Editor to see payment records

## Summary
✅ Database schema fixed
✅ TypeScript types updated  
✅ RLS policies configured
✅ Mock payment mode enabled
✅ Detailed error logging added

**Next:** Run `SETUP_DATABASE.sql` in Supabase SQL Editor, then test the payment flow!
