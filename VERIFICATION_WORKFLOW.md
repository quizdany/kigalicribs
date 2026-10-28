# Property Verification Workflow Documentation

## Overview
This document describes the complete property verification workflow for landlords who want to upgrade their listings from basic to verified or premium verified.

## Verification Flow

### 1. Payment Initiation
**Location:** Property detail page, new property page, edit property page

**User Actions:**
- Landlord clicks "Upgrade Listing" button
- `ListingUpgradeModal` opens showing two tiers:
  - **Verified Listing**: 30,000 RWF
  - **Premium Verified Listing**: 50,000 RWF (includes 30 days featured, 90 days priority)
- Landlord selects a tier and clicks "Upgrade Now"
- `PaymentModal` opens for payment via MTN MoMo or Airtel Money

### 2. Payment Completion
**API:** `POST /api/payments/initiate` → `GET /api/payments/status`

**Backend Actions (src/app/api/payments/status/route.ts):**
```typescript
// When payment is confirmed successful:
// 1. Create verification request
await supabase.from('property_verifications').insert({
  property_id,
  landlord_id: user_id,
  payment_id: payment.id,
  verification_type: 'verified' | 'premium_verified',
  status: 'pending',
  requested_at: new Date().toISOString()
})

// 2. Update property to pending status
await supabase
  .from('properties')
  .update({
    verification_status: 'pending'  // ✅ Stays 'basic' listing_type until admin approves
  })
  .eq('id', property_id)
```

**Property State After Payment:**
- `listing_type`: 'basic' (unchanged)
- `verification_status`: 'pending'
- `property_verifications` record created with status 'pending'

### 3. Pending Verification Display
**Location:** Property detail page, property edit page

**UI Display:**
- PropertyBadges component shows:
  ```tsx
  <span className="bg-yellow-100 text-yellow-700">
    <Clock className="h-4 w-4" />
    Pending Verification
  </span>
  ```
- Yellow notice: "Your verification request is being reviewed by our admin team."
- Upgrade button is hidden for pending properties

### 4. Admin Review
**API:** `POST /api/admin/verifications/[id]/review`

**Admin Actions:**
- Admin reviews verification request
- Can approve or reject with optional notes

**On Approval (src/app/api/admin/verifications/[id]/review/route.ts):**
```typescript
const updates: any = {
  listing_type: verification.verification_type === 'verified' ? 'verified' : 'premium_verified',
  verification_status: 'verified',
  verified_at: now,
  listing_expires_at: expiresAt.toISOString() // +6 months
}

// For premium_verified only:
if (verification.verification_type === 'premium_verified') {
  updates.featured_until = featuredUntil.toISOString()  // +30 days
  updates.priority_until = priorityUntil.toISOString()  // +90 days
  updates.featured = true
}

await supabase.from('properties').update(updates).eq('id', verification.property_id)
```

**Property State After Approval:**
- `listing_type`: 'verified' or 'premium_verified' (now upgraded!)
- `verification_status`: 'verified'
- `verified_at`: timestamp
- `listing_expires_at`: +6 months from approval
- Additional fields for premium_verified:
  - `featured`: true
  - `featured_until`: +30 days
  - `priority_until`: +90 days

**On Rejection:**
```typescript
await supabase
  .from('properties')
  .update({
    listing_type: 'basic',
    verification_status: 'rejected'
  })
  .eq('id', verification.property_id)
```

### 5. Verified Display
**Location:** Property detail page, property listings, search results

**UI Display:**
- For verified listings:
  ```tsx
  <span className="bg-blue-100 text-blue-700">
    <ShieldCheck className="h-4 w-4" />
    Verified Listing
  </span>
  ```
- For premium verified listings:
  ```tsx
  <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
    <Star className="h-4 w-4" />
    Premium Verified
  </span>
  ```
- Additional badges:
  - Featured badge (yellow with filled star)
  - Priority badge (indigo with up arrow)

## Database Schema

### property_verifications Table
```sql
CREATE TABLE property_verifications (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  landlord_id UUID REFERENCES users(id),
  payment_id UUID REFERENCES payments(id),
  verification_type TEXT, -- 'verified' or 'premium_verified'
  status TEXT, -- 'pending', 'approved', 'rejected'
  requested_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  admin_id UUID REFERENCES users(id),
  admin_notes TEXT
);
```

### properties Table (Relevant Fields)
```sql
listing_type TEXT DEFAULT 'basic', -- 'basic', 'verified', 'premium_verified'
verification_status TEXT DEFAULT 'none', -- 'none', 'pending', 'verified', 'rejected'
verified_at TIMESTAMP,
listing_expires_at TIMESTAMP,
featured BOOLEAN DEFAULT false,
featured_until TIMESTAMP,
priority_until TIMESTAMP
```

## Component Integration

### ListingUpgradeModal (src/components/PremiumModal.tsx)
- Displays upgrade tiers
- Triggers PaymentModal with correct payment purpose
- Reloads page after successful payment

### PropertyBadges (src/components/PropertyBadges.tsx)
- Shows listing type badge
- Shows verification status badge (pending, verified, rejected)
- Shows featured/priority badges based on dates

### Property Pages
1. **Detail Page** - Upgrade card in sidebar, auto-opens on ?showUpgrade=true
2. **New Property Page** - Redirects to detail with ?showUpgrade=true after creation
3. **Edit Page** - Upgrade banner at top of form

## Payment Purposes
- `verified_listing`: 30,000 RWF - Standard verification with badge
- `premium_verified_listing`: 50,000 RWF - Verification + 30 days featured + 90 days priority

## Key Features
✅ Listings start as 'basic' after creation
✅ Payment creates verification request, sets status to 'pending'
✅ Pending badge displays during review
✅ Admin approval upgrades listing_type and sets verified status
✅ Verified badge displays after approval
✅ Premium verified gets featured/priority placement
✅ 6-month verification validity period
✅ Auto-revert to basic when expired (via cron job)

## Testing Checklist
- [ ] Create basic property
- [ ] See upgrade option on detail page
- [ ] Click upgrade, select tier, complete payment
- [ ] See "Pending Verification" badge after payment
- [ ] Admin approves verification
- [ ] See "Verified Listing" or "Premium Verified" badge
- [ ] Check featured/priority badges for premium
- [ ] Verify expiry after 6 months
