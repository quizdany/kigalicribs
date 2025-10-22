# Payment Integration Setup Guide

## Overview
KigaliCribs uses MTN Mobile Money and Airtel Money for payment processing in Rwanda. This guide will help you set up the payment integration.

## Payment Features
- **Premium Monthly Subscription**: 5,000 RWF/month - Access to premium features
- **Premium Yearly Subscription**: 50,000 RWF/year - Save 17% with annual billing
- **Contact Unlock**: 500 RWF per property - View owner contact information
- **Featured Listing**: 10,000 RWF/week - Boost your property visibility

## Prerequisites

### 1. MTN Mobile Money Setup
1. Visit [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. Create an account and sign in
3. Subscribe to the **Collection** product
4. Generate API credentials:
   - Go to Sandbox/Production
   - Create API User
   - Generate API Key
   - Note your Subscription Key (Ocp-Apim-Subscription-Key)

### 2. Airtel Money Setup
1. Visit [Airtel Africa Developer Portal](https://developers.airtel.africa/)
2. Create an account and register your application
3. Subscribe to the **Money** product
4. Get your credentials:
   - Client ID
   - Client Secret
5. Request production access after testing

## Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# MTN Mobile Money Configuration
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=your_subscription_key_here
MOMO_API_USER=your_api_user_uuid_here
MOMO_API_KEY=your_api_key_here
MOMO_ENVIRONMENT=sandbox

# Airtel Money Configuration
AIRTEL_API_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_client_id_here
AIRTEL_CLIENT_SECRET=your_client_secret_here
AIRTEL_ENVIRONMENT=staging

# Application URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Environment Variables

When deploying to production:

```env
# MTN Mobile Money Production
MOMO_API_URL=https://momodeveloper.mtn.com
MOMO_ENVIRONMENT=production

# Airtel Money Production
AIRTEL_API_URL=https://openapi.airtel.africa
AIRTEL_ENVIRONMENT=production

# Your production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Database Setup

Run the SQL migration to create the necessary tables:

```bash
# Connect to your Supabase project and run:
psql -h your-project.supabase.co -U postgres -d postgres -f supabase-payments-table.sql
```

Or use the Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase-payments-table.sql`
3. Run the query

## Testing Payment Flow

### 1. MTN MoMo Sandbox Testing

Test phone numbers for sandbox:
- Success: `46733123450` - `46733123459`
- Failure: `46733123460` - `46733123469`

Test flow:
```javascript
// Initiate payment
const response = await fetch('/api/payments/initiate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    phoneNumber: '46733123450',
    purpose: 'premium_monthly',
    provider: 'momo'
  })
})

// Check status
const statusResponse = await fetch('/api/payments/status?transactionId=TRANSACTION_ID', {
  headers: {
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  }
})
```

### 2. Airtel Money Testing

Contact Airtel Africa support for test credentials and phone numbers.

## Usage in Your Application

### Example: Premium Subscription

```typescript
'use client'

import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import { checkPremiumStatus } from '@/lib/premium'

export default function PremiumButton() {
  const [showPayment, setShowPayment] = useState(false)
  
  return (
    <>
      <button 
        onClick={() => setShowPayment(true)}
        className="px-6 py-3 bg-red-600 text-white rounded-lg"
      >
        Upgrade to Premium
      </button>
      
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        purpose="premium_monthly"
        onSuccess={() => {
          // Refresh user data or redirect
          window.location.reload()
        }}
      />
    </>
  )
}
```

### Example: Contact Unlock

```typescript
const handleContactView = async (propertyId: string) => {
  const user = await getCurrentUser()
  const isPremium = await checkPremiumStatus(user.id)
  
  if (!isPremium) {
    // Show payment modal
    setShowPayment(true)
    setPaymentPurpose('contact_unlock')
  } else {
    // Show contact directly
    fetchAndShowContact(propertyId)
  }
}
```

## Premium Features Implementation

Features that require premium:
1. **View Contact Information** - Non-premium users pay per contact
2. **Unlimited Property Listings** - Free users limited to 3 listings
3. **Featured Listings** - Boost property visibility
4. **Advanced Search Filters** - Access to more filter options
5. **Priority Support** - Faster response times

## API Endpoints

### POST `/api/payments/initiate`
Initiate a new payment.

Request:
```json
{
  "phoneNumber": "250788123456",
  "purpose": "premium_monthly",
  "provider": "momo"
}
```

Response:
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "transactionId": "KIGCR-xxx",
    "amount": 5000,
    "status": "pending",
    "provider": "momo",
    "message": "Payment initiated..."
  }
}
```

### GET `/api/payments/status?transactionId=xxx`
Check payment status.

Response:
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "status": "completed",
    "amount": 5000,
    "provider": "momo",
    "purpose": "premium_monthly"
  }
}
```

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Validate all requests** on the server side
3. **Use HTTPS** in production
4. **Implement rate limiting** on payment endpoints
5. **Log all transactions** for audit trails
6. **Monitor for fraud** - unusual payment patterns
7. **Test thoroughly** in sandbox before going live

## Troubleshooting

### Common Issues

1. **"Unauthorized" error**
   - Check your API credentials
   - Verify environment variables are loaded
   - Ensure you're using the correct environment (sandbox/production)

2. **Payment stuck in "pending"**
   - User may not have completed the transaction on their phone
   - Check provider dashboard for transaction status
   - Payment expires after 10 minutes

3. **"Invalid phone number" error**
   - Ensure phone number is in correct format: 250XXXXXXXXX
   - Verify number is registered with the provider

4. **Database errors**
   - Check RLS policies are correctly set up
   - Verify user is authenticated
   - Ensure tables exist and have correct schema

## Support

For payment integration support:
- MTN MoMo: [Developer Portal](https://momodeveloper.mtn.com/contact-support)
- Airtel Money: [Developer Portal](https://developers.airtel.africa/)
- KigaliCribs: Check application logs and Supabase dashboard

## Next Steps

1. Set up your developer accounts with MTN and Airtel
2. Configure environment variables
3. Run database migrations
4. Test in sandbox environment
5. Implement premium feature gates
6. Request production access
7. Go live!

## Pricing Configuration

Current pricing (in RWF):
```typescript
export const PRICING = {
  premium_monthly: 5000,
  premium_yearly: 50000,
  contact_unlock: 500,
  featured_listing: 10000
}
```

To update pricing, modify `src/lib/payments.ts`.
