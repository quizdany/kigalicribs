# KigaliCribs - Testing Guide

## 🎯 What's Currently Implemented

### ✅ Core Features (WORKING)
1. **Property Listing & Search**
   - Dynamic property cards with Airbnb-style design
   - Search by location, property type, budget
   - Filter by bedrooms, bathrooms, amenities
   - Featured properties on homepage

2. **Property Management**
   - Create new property listings with images
   - Edit existing properties (owner-only)
   - Delete properties (owner-only)
   - Image upload to Supabase Storage
   - Gallery view with Airbnb-style layout

3. **Contact System**
   - View owner contact information
   - Contact modal with owner details
   - Working on homepage and property detail pages

4. **Authentication**
   - User signup/login via Supabase Auth
   - Session management
   - Protected routes

### ✅ Payment Integration (INTEGRATED - NEEDS SETUP)
1. **Payment Infrastructure**
   - MTN Mobile Money integration ✅
   - Airtel Money integration ✅
   - Payment API endpoints ✅
   - Database schema ✅
   - PaymentModal UI component ✅
   - PremiumModal UI component ✅

2. **Premium Features System**
   - Premium subscription tracking ✅
   - Contact unlock system ✅ (wired to UI)
   - Feature gating ✅ (contact viewing now gated)
   - "Go Premium" button in navbar ✅

3. **Demo & Testing Tools**
   - Demo payment page at /demo/payment ✅
   - Shows all payment options without API keys ✅

---

## 🧪 How to Test Current Features

### 1. Homepage & Search

**Test Steps:**
```bash
# Start the dev server if not running
npm run dev

# Navigate to http://localhost:3000
```

**What to Test:**
- ✅ Hero section with Kigali background image
- ✅ Search box (type location to see additional filters)
- ✅ Property type, budget, bedrooms, bathrooms dropdowns appear
- ✅ Amenities dropdown with checkboxes
- ✅ Property cards with images, ratings, prices
- ✅ Click on property cards to view details

**Test Scenarios:**
```
1. Type "Kimihurura" in location → Additional filters appear
2. Select "Apartment" from property type
3. Select "2" bedrooms
4. Click "All" amenities dropdown → Select "parking" and "internet"
5. Click search → Results update
6. Click on a property card → Navigate to detail page
```

---

### 2. Property Creation

**Test Steps:**
```bash
# 1. Login first (required)
http://localhost:3000/auth

# 2. Navigate to property creation
http://localhost:3000/properties/new
```

**What to Test:**
- ✅ Form with all property fields
- ✅ Image upload (multiple images)
- ✅ Image preview before upload
- ✅ Amenities checkboxes
- ✅ Submit creates property in database

**Test Data:**
```
Title: Beautiful 3BR Apartment in Kimihurura
Type: Apartment
Location: Kimihurura
District: Gasabo
Address: KG 123 St
Price: 350000
Bedrooms: 3
Bathrooms: 2
Size: 150
Description: Modern apartment with great views
Owner Phone: 250788123456
Amenities: Check parking, internet, furnished
Images: Upload 2-3 images
```

---

### 3. Property Editing

**Test Steps:**
```bash
# 1. Create a property (if you haven't)
# 2. Navigate to property detail page
http://localhost:3000/properties/[YOUR_PROPERTY_ID]

# 3. Click "Edit Property" button (only visible if you're the owner)
```

**What to Test:**
- ✅ Form pre-filled with existing data
- ✅ Existing images displayed
- ✅ Can remove existing images
- ✅ Can add new images
- ✅ Changes persist after save
- ✅ Non-owners cannot see edit button

---

### 4. Premium Features & Payment UI Demo

**Test Steps:**
```bash
# Visit the demo page (no API keys needed)
http://localhost:3000/demo/payment
```

**What to Test:**
- ✅ Payment modal UI with MTN/Airtel options
- ✅ Monthly and yearly premium plans
- ✅ Contact unlock option (500 RWF)
- ✅ Featured listing option (10,000 RWF)
- ✅ Payment provider selection
- ✅ Phone number input
- ✅ Submit button functionality

**Expected Behavior:**
- Modal opens for each payment option
- Shows "Invalid token" error (expected without API keys)
- UI components render correctly

---

### 5. Premium Contact Gating (NEW - INTEGRATED)

**Test Steps:**
```bash
# 1. Make sure you're logged in
# 2. From homepage, click "Contact" on any property you don't own
```

**What to Test:**
- ✅ Payment modal appears (if not premium, not already unlocked)
- ✅ Shows contact unlock price (500 RWF)
- ✅ Select MTN or Airtel payment
- ✅ Enter phone number (250...)
- ✅ After mock payment, contact info should appear

**Current Endpoint:**
```
GET /api/properties/[id]/contact-premium
```

**Gating Logic:**
- ✅ Property owner: Free access
- ✅ Premium users: Free access
- ✅ Already unlocked: Free access
- ✅ Others: Payment required (402 status)

---

### 6. Go Premium Button

**Test Steps:**
```bash
# From homepage navbar
# Click "Go Premium" button (gradient red with crown icon)
```

**What to Test:**
- ✅ Premium modal opens
- ✅ Shows Monthly (5,000 RWF) and Yearly (50,000 RWF) plans
- ✅ Yearly plan shows "SAVE 17%" badge
- ✅ Lists premium benefits (contact viewing, analytics, etc.)
- ✅ Clicking a plan opens payment modal
- ✅ Payment modal pre-filled with correct purpose

**Mobile Menu:**
- ✅ "Go Premium" button also in mobile menu
- ✅ Same functionality as desktop

---

## 🚀 Payment System Testing (NOT YET INTEGRATED)

### Setup Required Before Testing Payments:

#### 1. Create Environment Variables
```bash
# Create .env.local file in root directory
touch .env.local

# Add these variables (use sandbox for testing):
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=your_key_here
MOMO_API_USER=your_user_uuid_here
MOMO_API_KEY=your_api_key_here
MOMO_ENVIRONMENT=sandbox

AIRTEL_API_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_client_id_here
AIRTEL_CLIENT_SECRET=your_client_secret_here
AIRTEL_ENVIRONMENT=staging

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 2. Run Database Migration
```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase-payments-table.sql
# 3. Execute the query

# This creates:
# - payments table
# - premium_users table
# - RLS policies
```

#### 3. Get Payment Provider Credentials

**MTN MoMo (Sandbox):**
1. Visit https://momodeveloper.mtn.com/
2. Sign up and login
3. Subscribe to "Collection" product
4. Generate API credentials
5. Use sandbox test numbers: `46733123450` (success)

**Airtel Money (Staging):**
1. Visit https://developers.airtel.africa/
2. Register application
3. Get Client ID and Secret
4. Request test credentials

---

### Testing Payment Flow (Once Set Up):

#### Test 1: Payment Modal UI
```typescript
// Add to any page to test the modal
import PaymentModal from '@/components/PaymentModal'

const [showPayment, setShowPayment] = useState(false)

<button onClick={() => setShowPayment(true)}>
  Test Payment
</button>

<PaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  purpose="premium_monthly"
  onSuccess={() => console.log('Payment successful!')}
/>
```

#### Test 2: Payment API Endpoints

**Initiate Payment:**
```bash
# POST /api/payments/initiate
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "phoneNumber": "250788123456",
    "purpose": "premium_monthly",
    "provider": "momo"
  }'
```

**Check Payment Status:**
```bash
# GET /api/payments/status
curl http://localhost:3000/api/payments/status?transactionId=TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### Test 3: Premium-Gated Contact Viewing

**Premium Contact Endpoint:**
```bash
# GET /api/properties/[id]/contact-premium
curl http://localhost:3000/api/properties/PROPERTY_ID/contact-premium \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Responses:
# - 200: Premium user or already unlocked
# - 402: Payment required
# - 401: Unauthorized
```

---

## 📋 Testing Checklist

### Current Features (Test Now):
- [ ] Homepage loads with Kigali background
- [ ] Search box shows filters when typing location
- [ ] All filter dropdowns work (type, budget, beds, baths, amenities)
- [ ] Property cards display correctly
- [ ] Click property card navigates to detail page
- [ ] Property detail page shows all info and gallery
- [ ] Can create new property (when logged in)
- [ ] Can edit own properties (owner only)
- [ ] Contact button shows owner info
- [ ] Images upload successfully
- [ ] Search filters work and update results

### Payment Features (Setup Required):
- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Payment modal opens and displays correctly
- [ ] Can select provider (MoMo/Airtel)
- [ ] Phone number input accepts valid formats
- [ ] Payment initiation returns success/error
- [ ] Status polling works
- [ ] Premium status is checked correctly
- [ ] Contact endpoint returns 402 for non-premium users

---

## 🐛 Common Issues & Solutions

### Issue 1: Images not uploading
**Solution:** Check Supabase Storage bucket exists and RLS policies allow uploads
```sql
-- Run in Supabase SQL Editor
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'property-images';
```

### Issue 2: Contact button shows "Failed to load"
**Solution:** 
1. Check if property has owner_email and owner_phone
2. Verify API endpoint is working
3. Check browser console for errors

### Issue 3: Cannot edit property
**Solution:**
1. Ensure you're logged in as the property owner
2. Check session token is valid
3. Verify RLS policies allow updates

### Issue 4: Search returns no results
**Solution:**
1. Check if properties exist in database
2. Verify filter parameters
3. Check API endpoint logs

### Issue 5: Payment modal not showing
**Solution:**
1. Import PaymentModal component
2. Add to page JSX
3. Check component is in src/components/PaymentModal.tsx

---

## 🔍 Quick Testing Commands

```bash
# Check if server is running
curl http://localhost:3000

# Test properties API
curl http://localhost:3000/api/properties

# Check single property
curl http://localhost:3000/api/properties/PROPERTY_ID

# Test authentication
curl http://localhost:3000/api/auth/session

# Check if payment files exist
ls src/lib/payments.ts
ls src/lib/premium.ts
ls src/components/PaymentModal.tsx
ls src/app/api/payments/initiate/route.ts
ls src/app/api/payments/status/route.ts
```

---

## 📊 Database Queries for Testing

```sql
-- Check properties
SELECT id, title, price, property_type FROM properties LIMIT 10;

-- Check if payments table exists
SELECT * FROM payments LIMIT 1;

-- Check premium users
SELECT * FROM premium_users WHERE is_active = true;

-- Check user's properties
SELECT * FROM properties WHERE owner_id = 'YOUR_USER_ID';
```

---

## 🎬 Quick Start Testing Flow

1. **Start Server:**
   ```bash
   npm run dev
   ```

2. **Test Basic Flow:**
   - Visit http://localhost:3000
   - Type location → See filters appear
   - Click property → View details
   - Login → Create property
   - Click Contact → See owner info

3. **Test Payment (if setup):**
   - Import and add PaymentModal to a page
   - Click to open modal
   - Select provider
   - Enter test phone number
   - Initiate payment

---

## 📞 Need Help?

**Check Logs:**
- Browser Console (F12)
- Terminal where `npm run dev` is running
- Supabase Dashboard → Logs

**Verify Setup:**
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database tables created
- [ ] Storage bucket configured

**Current Working State:**
- ✅ All UI features work
- ✅ Property CRUD works
- ✅ Search/filters work
- ✅ Contact viewing works (free)
- ⏳ Payment system ready but needs setup
