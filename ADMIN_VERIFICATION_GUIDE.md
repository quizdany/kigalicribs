# Admin Verification Approval Guide

## Step 1: Set Your User as Admin

First, you need to set your user account as an admin in the database.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ciedcesfclfqukhrnqrp`
3. Click on **SQL Editor** in the left sidebar
4. Run this SQL command (replace with your actual user email):

```sql
-- Update your user to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

### Option B: Using pgAdmin or any PostgreSQL client

Connect to your database and run the same SQL above.

---

## Step 2: Access the Admin Dashboard

Once you're set as admin:

1. Make sure your dev server is running: `npm run dev`
2. Navigate to: **http://localhost:3001/admin/verifications**
3. You should see the admin verification dashboard

---

## Step 3: Review and Approve Verifications

### Dashboard Features:

**Three Tabs:**
- **Pending** - Shows all verification requests waiting for review
- **Approved** - Shows previously approved verifications
- **Rejected** - Shows rejected verifications

### For Each Verification Request:

1. **Review the property details:**
   - Property images (should have 8-10 quality photos)
   - Title, description, location
   - Price and property type
   - Request date

2. **View the full property:**
   - Click "View Property" to see the complete listing
   - Verify the information is accurate and complete
   - Check photo quality

3. **Take Action:**

   **To Approve:**
   - Click the green "Approve" button
   - Optionally add admin notes
   - Click "Approve" in the modal
   - ✅ **Property will be updated:**
     - `listing_type` changes to 'verified' or 'premium_verified'
     - `verification_status` changes to 'verified'
     - `verified_at` timestamp is set
     - Verified badge appears immediately
     - Valid for 6 months
     - Premium verified gets 30 days featured + 90 days priority

   **To Reject:**
   - Click the red "Reject" button
   - Property reverts to basic listing
   - Landlord will need to fix issues and reapply

---

## Step 4: Verify the Badge Appears

After approving a verification:

1. The page will refresh automatically
2. Go to the property detail page
3. You should see the verified badge:
   - **Blue badge with checkmark** = Verified Listing
   - **Purple gradient badge with star** = Premium Verified

---

## Verification Criteria Checklist

Before approving, ensure:

- [ ] Property has 8-10 high-quality photos
- [ ] Title is descriptive and accurate
- [ ] Description provides sufficient detail
- [ ] Location and district are correct
- [ ] Price is reasonable for the market
- [ ] Property type is correctly categorized
- [ ] All amenities listed are believable
- [ ] Contact information exists (you can test by viewing the property)
- [ ] No duplicate listings
- [ ] No fake/stock photos

---

## Quick Test Flow

1. Create a test property (or use existing)
2. Pay for verification (use sandbox MoMo: any 250-prefixed phone)
3. Property shows "Awaiting Verification"
4. Go to `/admin/verifications`
5. See the pending request
6. Click "Approve"
7. Refresh the property page
8. See the verified badge! ✅

---

## Troubleshooting

**Can't access `/admin/verifications`:**
- Make sure you ran the SQL to set your role to 'admin'
- Check your browser console for errors
- Verify you're logged in

**Don't see any pending verifications:**
- Check if any payments have been made
- Look at the `property_verifications` table in Supabase
- Check the console logs for errors

**Badge not showing after approval:**
- Hard refresh the page (Ctrl+F5)
- Check the property in Supabase - should show listing_type = 'verified'
- Check PropertyBadges component is being rendered

---

## Database Schema Reference

**property_verifications table:**
```sql
id UUID PRIMARY KEY
property_id UUID → references properties(id)
landlord_id UUID → references users(id)
payment_id UUID → references payments(id)
verification_type TEXT ('verified' | 'premium_verified')
status TEXT ('pending' | 'approved' | 'rejected')
requested_at TIMESTAMP
reviewed_at TIMESTAMP
admin_id UUID → references users(id)
admin_notes TEXT
```

**Properties updated fields:**
```sql
listing_type → 'verified' or 'premium_verified'
verification_status → 'verified'
verified_at → timestamp
listing_expires_at → +6 months
featured (premium only) → true
featured_until (premium only) → +30 days
priority_until (premium only) → +90 days
```
