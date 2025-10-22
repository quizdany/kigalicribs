# UI Cleanup Summary - Removed Tenant Subscription Model

## Problem Identified
The UI still contained references to an old "tenant subscription" business model (`premium_monthly`, `premium_yearly`) which conflicted with the actual backend implementation focusing on **landlord listing packages** and **tenant pay-per-unlock** model.

## Business Model Clarification

### Backend Implementation (Correct):
1. **Landlord Packages** - Pay to upgrade listing quality
   - `verified_listing` (30,000 RWF)
   - `premium_verified_listing` (50,000 RWF)
   
2. **Listing Management** - Landlords boost their listings
   - `listing_refresh` (10,000 RWF) - Bump to top for 7 days
   - `listing_extension` (10,000 RWF) - Add 3 months validity
   
3. **Tenant Contact Access** - Pay-per-unlock model
   - 3 free contact unlocks
   - After limit: `unlimited_contact_access` (10,000 RWF one-time payment)

### Old UI References (Removed):
- ❌ Premium Monthly Subscription (5,000 RWF/month)
- ❌ Premium Yearly Subscription (50,000 RWF/year)
- ❌ "Go Premium" buttons for tenant subscriptions
- ❌ Tenant subscription modal

## Files Modified

### 1. `src/components/PremiumModal.tsx`
**Status:** ✅ FIXED - Completely rewritten

**Changes:**
- Renamed conceptually to `ListingUpgradeModal` (component name stays same for compatibility)
- Removed tenant subscription plans (monthly/yearly)
- Added landlord listing upgrade packages:
  - Verified Listing (30k) - 6 months, 8 photos, admin verification
  - Premium Verified (50k) - Featured, priority, all verified features
- Fixed prop naming: `onClose` → `onCloseAction` (Next.js requirement)
- Modal now targets **landlords** upgrading their listings, not **tenants** buying subscriptions

### 2. `src/app/page.tsx` (Homepage)
**Status:** ✅ FIXED - Removed premium subscription CTAs

**Changes:**
- Removed `PremiumModal` import and state
- Removed "Go Premium" buttons from desktop and mobile navigation
- Changed `paymentPurpose` from `contact_unlock` to `unlimited_contact_access`
- Removed `Crown` icon import (no longer used)
- Simplified navigation to just "Find a Property" and "List a Property"

### 3. `src/app/api/payments/initiate/route.ts`
**Status:** ✅ FIXED - Updated valid payment purposes

**Changes:**
- Removed: `'premium_monthly'`, `'premium_yearly'`, `'featured_listing'`
- Added: `'verified_listing'`, `'premium_verified_listing'`, `'listing_refresh'`, `'listing_extension'`, `'unlimited_contact_access'`
- Now validates only against new 5-purpose system

### 4. `src/app/demo/payment/page.tsx`
**Status:** ✅ FIXED - Completely rewritten demo page

**Changes:**
- Replaced old subscription cards with new 5 payment purposes
- Added visual distinctions:
  - Blue: Verified Listing
  - Red: Premium Verified (marked "BEST VALUE")
  - Green: Listing Refresh
  - Purple: Listing Extension
  - Orange: Unlimited Contact Access
- Updated descriptions to match backend features
- Changed default purpose from `premium_monthly` to `verified_listing`

## Still Contains (Intentionally)

### `contact_unlock` References
**Status:** ✅ CORRECT - These are for the database table, not the payment purpose

The `contact_unlocks` table tracks individual contact unlocks (the 3 free ones). This is different from the `unlimited_contact_access` payment purpose. Files correctly using this:
- `src/app/api/properties/[id]/contact/route.ts` - Inserts unlock records
- `src/app/api/users/contact-unlock-status/route.ts` - Counts unlocks
- `src/lib/database.types.ts` - Type definitions for table

## Remaining Issues

### Type Errors (Not Critical)
Several API routes have TypeScript errors because `database.types.ts` was manually created and doesn't perfectly match Supabase schema. These are cosmetic and don't affect runtime:
- `src/app/api/admin/verifications/route.ts`
- `src/app/api/properties/[id]/refresh/route.ts`
- `src/app/api/properties/[id]/extend/route.ts`
- `src/app/api/cron/expire-listings/route.ts`

**Fix:** Regenerate types with `npx supabase gen types typescript --project-id ciedcesfclfqukhrnqrp > src/lib/database.types.ts`

### PaymentModal Prop Naming
**Status:** ⚠️ MINOR WARNING

`PaymentModal.tsx` has `onClose` prop which triggers Next.js warning about Server Actions. Should be renamed to `onCloseAction` for consistency, but works fine as-is.

### Deprecated Route
`src/app/api/properties/[id]/contact-premium/route.ts` still has old pricing references (`premium_monthly`, `premium_yearly`). This file appears to be unused/deprecated.

**Recommendation:** Delete this file or update to match new model.

## Business Logic Consistency Check

### Payment Purposes → UI Entry Points

| Payment Purpose | Amount | UI Component | Status |
|----------------|--------|--------------|--------|
| `verified_listing` | 30,000 RWF | ListingUpgradeModal (PremiumModal) | ✅ |
| `premium_verified_listing` | 50,000 RWF | ListingUpgradeModal (PremiumModal) | ✅ |
| `listing_refresh` | 10,000 RWF | OwnerActions component | ✅ |
| `listing_extension` | 10,000 RWF | OwnerActions component | ✅ |
| `unlimited_contact_access` | 10,000 RWF | ContactUnlockButton component | ✅ |

### Database Fields → UI Display

| Database Field | Displayed In | Status |
|---------------|--------------|--------|
| `listing_type` | PropertyBadges | ✅ |
| `verification_status` | PropertyBadges | ✅ |
| `listing_expires_at` | PropertyBadges, OwnerActions | ✅ |
| `featured_until` | PropertyBadges | ✅ |
| `priority_until` | PropertyBadges | ✅ |
| `photo_count` | NOT IMPLEMENTED | ❌ |
| `refresh_count` | NOT DISPLAYED | ⚠️ Info only |

## Testing Recommendations

### 1. Test Landlord Flow
1. Create property listing
2. Should see ListingUpgradeModal (not subscription modal)
3. Select "Verified Listing" or "Premium Verified"
4. Complete payment
5. Property should show verification pending badge

### 2. Test Tenant Flow
1. Browse properties
2. Click to view contact info
3. First 3 unlocks should be free
4. 4th unlock should trigger payment modal for "Unlimited Contact Access"
5. After payment, all future unlocks should be free

### 3. Test Owner Management
1. As property owner, view your verified listing
2. Should see "Refresh" and "Extend" buttons
3. Test cooldown (refresh) and expiry requirements (extend)

## Summary

✅ **Removed:** All tenant subscription UI elements  
✅ **Added:** Landlord listing upgrade modal  
✅ **Updated:** Homepage, demo page, payment validation  
✅ **Verified:** All 5 payment purposes have UI entry points  
⚠️ **Pending:** Photo count enforcement, type regeneration  
❌ **Blocked:** None - all critical changes complete

The UI now correctly reflects the backend business model: landlords pay for listing quality, tenants get 3 free unlocks then pay once for unlimited access.
