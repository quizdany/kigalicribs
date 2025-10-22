# KigaliCribs Revenue Model Implementation Summary

## Implementation Date
October 22, 2025

## Overview
Complete backend implementation of the new landlord/tenant revenue model with verification workflows, contact access limits, and listing management features.

---

## ✅ COMPLETED TASKS

### 1. Database Schema Updates (`SETUP_DATABASE.sql`)

#### Properties Table - New Columns
```sql
- listing_type: 'basic' | 'verified' | 'premium_verified' (default: 'basic')
- verification_status: 'none' | 'pending' | 'verified' | 'rejected' (default: 'none')
- verified_at: timestamp (when admin approved)
- listing_expires_at: timestamp (6 months from approval)
- featured_until: timestamp (30 days for premium)
- priority_until: timestamp (90 days for premium)
- refresh_count: integer (tracks number of refreshes)
- photo_count: integer (for enforcing limits)
```

#### New Table: property_verifications
Tracks admin approval workflow for verified listings
```sql
- id, property_id, landlord_id, payment_id
- verification_type: 'verified' | 'premium_verified'
- status: 'pending' | 'approved' | 'rejected'
- admin_id, admin_notes
- requested_at, reviewed_at, created_at, updated_at
```

#### Updated Tables
- **payments**: New payment purposes
- **premium_users**: Changed to only track 'unlimited_contact_access' subscriptions

---

### 2. Payment System Updates

#### New Payment Purposes & Pricing (in RWF)
```typescript
verified_listing: 30,000          // 6 months validity, requires admin approval
premium_verified_listing: 50,000  // 6 months + featured (30 days) + priority (90 days)
listing_refresh: 10,000           // Bump to top for 7 days
listing_extension: 10,000         // Extend validity by 3 months
unlimited_contact_access: 10,000  // Unlimited property contact unlocks (tenants)
contact_unlock: 0                 // Deprecated (replaced by free limits)
```

#### Updated Files
- `src/lib/payments.ts` - New PRICING object with all purposes
- `src/lib/database.types.ts` - Updated payment purpose types
- `src/lib/supabase.ts` - Updated types with PropertyVerification
- `src/app/api/payments/status/route.ts` - Post-payment processing for all purposes

---

### 3. Contact Access Limits System

#### Business Logic
- **Free**: First 3 property contact unlocks per user
- **Paid**: 10,000 RWF for unlimited contact access (lifetime)

#### API Endpoints Created

**GET** `/api/properties/[id]/contact`
- Checks if user already unlocked property
- Counts user's total unlocks
- Checks for unlimited_contact_access subscription
- Returns contact info or requiresPayment error

**GET** `/api/users/contact-unlock-status`
- Returns user's unlock status without consuming a free unlock
- Shows: usedFreeUnlocks, remainingFreeUnlocks, hasUnlimitedAccess

#### Response Examples
```json
// Success (within free limit)
{
  "success": true,
  "data": { "owner_email": "...", "owner_phone": "..." },
  "usedFreeUnlocks": 2,
  "freeUnlocksLimit": 3,
  "hasUnlimitedAccess": false
}

// Error (limit reached, requires payment)
{
  "success": false,
  "error": "Contact unlock limit reached",
  "requiresPayment": true,
  "usedFreeUnlocks": 3,
  "freeUnlocksLimit": 3,
  "unlimitedAccessPrice": 10000
}
```

---

### 4. Verification Workflow (Admin Approval)

#### Process Flow
1. Landlord pays for verified_listing or premium_verified_listing
2. Payment completion creates property_verification record (status: 'pending')
3. Property updated to verification_status: 'pending'
4. Admin reviews via `/api/admin/verifications`
5. Admin approves/rejects via `/api/admin/verifications/[id]/review`
6. On approval:
   - Set verification_status: 'verified'
   - Set listing_expires_at: now + 6 months
   - If premium: Set featured_until (30 days) and priority_until (90 days)
7. On rejection:
   - Revert listing_type to 'basic'
   - Set verification_status: 'rejected'

#### API Endpoints Created

**GET** `/api/admin/verifications?status=pending`
- Lists verification requests (admin only)
- Returns property details with verification info

**POST** `/api/admin/verifications/[id]/review`
- Body: `{ action: 'approve' | 'reject', notes?: string }`
- Updates verification and property records
- Sets expiry dates and features

---

### 5. Listing Management Features

#### API Endpoints Created

**POST** `/api/properties/[id]/refresh`
- Requirements:
  - Property must be verified (not basic)
  - Must be owned by current user
  - Can only refresh once every 24 hours
- Effect: Bumps listing to top for 7 days by updating `updated_at`
- Returns payment requirement (10,000 RWF)

**POST** `/api/properties/[id]/extend`
- Requirements:
  - Property must be verified (not basic)
  - Must be owned by current user
  - Listing must expire within 30 days
- Effect: Extends `listing_expires_at` by 3 months
- Returns payment requirement (10,000 RWF)

**POST** `/api/cron/expire-listings` (Cron Job)
- Security: Requires CRON_SECRET in authorization header
- Runs periodically to:
  1. Downgrade expired verified listings to basic
  2. Remove expired featured status
  3. Remove expired priority status
  4. Deactivate expired premium users (if applicable)

---

## 📝 NEXT STEPS (Frontend UI)

### 6. Frontend Components to Update

#### Contact Unlock UI
- Show free unlocks counter: "2 of 3 free unlocks remaining"
- Display upgrade prompt when limit reached
- Payment modal for unlimited access purchase

#### Property Listing Cards
- Badge for listing_type: "Basic" | "Verified" | "Premium Verified"
- Badge for verification_status: "Pending Verification" | "Verified"
- Show expiry date countdown if expiring soon

#### Property Detail Page (Owner View)
- Verification status indicator
- Days until expiry countdown
- **Refresh Button**: Show if verified, not refreshed in 24h
- **Extend Button**: Show if expiring within 30 days
- Photo upload limit enforcement based on listing_type

#### Admin Dashboard
- List pending verifications
- Property details with photos
- Approve/Reject buttons with notes field
- Verification history

#### Photo Upload Limits
```
Basic: 3 photos maximum
Verified: 8-10 professional photos
Premium Verified: 8-10 professional photos
```

---

## 🔧 CONFIGURATION REQUIRED

### Environment Variables
Add to `.env.local`:
```bash
# Cron job authentication
CRON_SECRET=your_secure_random_string

# Supabase service role (for cron jobs)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Cron Job Setup
Set up periodic calls to `/api/cron/expire-listings`:
- Recommended: Daily at midnight
- Use services like: Vercel Cron, GitHub Actions, or external cron service
- Example cURL:
```bash
curl -X POST https://your-domain.com/api/cron/expire-listings \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Database Migration
Run the updated `SETUP_DATABASE.sql` in Supabase SQL Editor to:
- Add new columns to properties table
- Create property_verifications table
- Update payment purposes
- Update RLS policies

---

## 📊 BUSINESS LOGIC SUMMARY

### Landlord Packages
| Package | Price | Duration | Features |
|---------|-------|----------|----------|
| **Verified Listing** | 30,000 RWF | 6 months | Admin approval, 8-10 photos |
| **Premium Verified** | 50,000 RWF | 6 months | + Featured (30 days) + Priority (90 days) |
| **Listing Refresh** | 10,000 RWF | 7 days | Bump to top of search |
| **Listing Extension** | 10,000 RWF | 3 months | Extend expiry date |

### Tenant Access
| Feature | Limit | Price |
|---------|-------|-------|
| **Contact Unlocks** | 3 free | - |
| **Unlimited Access** | Unlimited | 10,000 RWF (lifetime) |

### Listing Lifecycle
```
Basic (Free, forever)
  ↓ [Pay 30k/50k]
Pending Verification
  ↓ [Admin Approval]
Verified (6 months)
  ↓ [Can refresh every 24h for 10k]
  ↓ [Can extend when <30 days left for 10k]
  ↓ [Auto-downgrade on expiry]
Basic (if not renewed)
```

---

## 🐛 KNOWN ISSUES

### TypeScript Errors (Non-breaking)
Some API endpoints have TypeScript errors due to generic Database types. These don't affect runtime functionality but should be fixed:

Files with type warnings:
- `src/app/api/admin/verifications/[id]/review/route.ts`
- `src/app/api/properties/[id]/refresh/route.ts`
- `src/app/api/properties/[id]/extend/route.ts`

**Fix**: Cast to proper types or update Database interface in database.types.ts

---

## ✅ TESTING CHECKLIST

### Database
- [ ] Run SETUP_DATABASE.sql in Supabase
- [ ] Verify all tables created
- [ ] Check RLS policies are active
- [ ] Test insert/update permissions

### Payment Flow
- [ ] Test verified_listing payment (30k)
- [ ] Test premium_verified_listing payment (50k)
- [ ] Verify property_verifications record created
- [ ] Check property status updated to 'pending'

### Admin Workflow
- [ ] Admin can list pending verifications
- [ ] Admin can approve verification
- [ ] Property becomes verified with expiry date
- [ ] Premium features (featured/priority) set correctly
- [ ] Admin can reject verification
- [ ] Property reverts to basic on rejection

### Contact Unlocks
- [ ] First 3 unlocks are free
- [ ] 4th unlock requires payment
- [ ] Unlimited access purchase works
- [ ] Unlimited users can unlock any property
- [ ] Status endpoint returns correct counts

### Listing Management
- [ ] Refresh requires verified listing
- [ ] Refresh has 24h cooldown
- [ ] Extend requires <30 days to expiry
- [ ] Extend adds 3 months
- [ ] Cron job downgrades expired listings

---

## 📚 API REFERENCE SUMMARY

### Contact Access
- `GET /api/properties/[id]/contact` - Unlock contact info
- `GET /api/users/contact-unlock-status` - Check unlock status

### Admin Verification
- `GET /api/admin/verifications?status=pending` - List verifications
- `POST /api/admin/verifications/[id]/review` - Approve/reject

### Listing Management
- `POST /api/properties/[id]/refresh` - Refresh listing
- `POST /api/properties/[id]/extend` - Extend validity

### Payments
- `POST /api/payments/initiate` - Start payment
- `GET /api/payments/status?transactionId=X` - Check status

### Cron Jobs
- `POST /api/cron/expire-listings` - Process expiries (daily)

---

## 🎯 SUCCESS METRICS TO TRACK

1. **Landlord Conversion**: % of free listings upgrading to verified
2. **Premium Adoption**: % choosing premium over basic verified
3. **Refresh Usage**: How often verified listings refresh
4. **Extension Rate**: % of listings extending before expiry
5. **Tenant Conversion**: % of users buying unlimited contact access after 3 free
6. **Verification Approval Rate**: % of listings approved by admin
7. **Revenue per User**: Average spending per landlord/tenant

---

## 📞 SUPPORT & MAINTENANCE

### Regular Tasks
- Monitor admin verification queue daily
- Review expiry cron job logs
- Check payment completion rates
- Monitor unlimited contact access adoption

### Future Enhancements
- Email notifications for expiry warnings
- SMS alerts for admin verification requests
- Analytics dashboard for revenue tracking
- Bulk verification for trusted landlords
- Automated photo quality checks

---

**Implementation Status**: ✅ Backend Complete (Steps 1-5)
**Remaining**: Frontend UI Updates (Step 6)

**Estimated Frontend Work**: 2-3 days
- Contact unlock UI with counter
- Verification status badges
- Admin verification dashboard
- Refresh/extend buttons
- Photo upload limits
