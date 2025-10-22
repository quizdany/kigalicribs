# Payment Integration Setup Guide - Step by Step

This guide will walk you through setting up MTN Mobile Money and Airtel Money integration for your KigaliCribs application.

---

## 📋 Prerequisites

1. ✅ Supabase account (already set up)
2. ✅ Payment integration code (already implemented)
3. ⏳ MTN Mobile Money developer account
4. ⏳ Airtel Money developer account
5. ⏳ Database tables for payments

---

## 🗄️ Step 1: Set Up Database Tables

### 1.1 Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `ciedcesfclfqukhrnqrp`
3. Click on "SQL Editor" in the left sidebar

### 1.2 Run the Payment Schema SQL
1. Click "New Query"
2. Open the file `supabase-payments-table.sql` in your project
3. Copy ALL the content from that file
4. Paste it into the SQL Editor
5. Click "Run" button (or press Ctrl+Enter)

### 1.3 Verify Tables Created
After running the SQL, verify that two new tables were created:
- `payments` - Stores all payment transactions
- `premium_users` - Tracks premium subscriptions

You can check by clicking "Table Editor" in the left sidebar.

**✅ Database Setup Complete!**

---

## 💳 Step 2: MTN Mobile Money Setup (Sandbox)

### 2.1 Create Developer Account
1. Go to https://momodeveloper.mtn.com/
2. Click "Sign Up" or "Register"
3. Fill in your details:
   - Email address
   - Password
   - Accept terms and conditions
4. Verify your email address
5. Log in to your account

### 2.2 Subscribe to Products
1. Once logged in, go to "Products" section
2. Subscribe to **"Collection"** product (this allows you to receive payments)
   - Click "Subscribe"
   - Select "Primary Key" as subscription key type
3. Copy and save your **Subscription Key** (also called Primary Key)
   - This is your `MOMO_SUBSCRIPTION_KEY`

### 2.3 Create API User and API Key
1. Open your terminal/PowerShell
2. Run these commands to create API credentials:

```powershell
# Replace YOUR_SUBSCRIPTION_KEY with the key you copied above
$subscriptionKey = "YOUR_SUBSCRIPTION_KEY"

# Generate a random UUID for API User
$apiUser = [guid]::NewGuid().ToString()
Write-Host "API User: $apiUser"

# Create API User
$headers = @{
    "X-Reference-Id" = $apiUser
    "Ocp-Apim-Subscription-Key" = $subscriptionKey
}
$body = @{
    "providerCallbackHost" = "webhook.site"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser" -Method Post -Headers $headers -Body $body -ContentType "application/json"

# Create API Key
Start-Sleep -Seconds 2
Invoke-RestMethod -Uri "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/$apiUser/apikey" -Method Post -Headers $headers

# The response will show your API Key
```

3. Save the output:
   - **API User** (UUID format): This is your `MOMO_API_USER`
   - **API Key** (returned from second command): This is your `MOMO_API_KEY`

### 2.4 Update .env.local File
Open `.env.local` and update these values:

```bash
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=your_actual_subscription_key
MOMO_API_USER=your_actual_api_user_uuid
MOMO_API_KEY=your_actual_api_key
```

**✅ MTN Mobile Money Setup Complete!**

---

## 📱 Step 3: Airtel Money Setup (Staging)

### 3.1 Create Developer Account
1. Go to https://developers.airtel.africa/
2. Click "Sign Up" or "Register"
3. Fill in your details:
   - Full name
   - Email address
   - Company name (can use "KigaliCribs" or your name)
   - Password
4. Verify your email address
5. Log in to your account

### 3.2 Create an Application
1. Once logged in, go to "My Apps" or "Applications"
2. Click "Create New App" or "Add Application"
3. Fill in the details:
   - **App Name**: KigaliCribs Payment
   - **Description**: Property rental payment integration
   - **Country**: Rwanda
   - **Products**: Select "Airtel Money"
4. Submit the application

### 3.3 Get API Credentials
1. After creating the app, you'll see your credentials:
   - **Client ID**: Copy this value (this is your `AIRTEL_CLIENT_ID`)
   - **Client Secret**: Copy this value (this is your `AIRTEL_CLIENT_SECRET`)
2. Save these credentials securely

### 3.4 Update .env.local File
Open `.env.local` and update these values:

```bash
AIRTEL_API_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_actual_client_id
AIRTEL_CLIENT_SECRET=your_actual_client_secret
```

**✅ Airtel Money Setup Complete!**

---

## 🧪 Step 4: Testing the Integration

### 4.1 Restart Your Development Server
```powershell
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### 4.2 Test MTN Mobile Money (Sandbox)
**Sandbox Test Phone Numbers:**
- Success: `46733123450` to `46733123459` (any of these will succeed)
- Failure: `46733123460` to `46733123469` (any of these will fail)

**Test Flow:**
1. Go to http://localhost:3000
2. Click "Go Premium" button
3. Select a subscription plan
4. Select "MTN" as payment provider
5. Enter sandbox test number: `46733123450`
6. Click "Pay"
7. Wait for status updates (should complete successfully)

### 4.3 Test Airtel Money (Staging)
**Staging Test Phone Numbers:**
- Use any valid Rwandan number format: `250788XXXXXX`
- In staging, transactions may be simulated

**Test Flow:**
1. Go to http://localhost:3000
2. Click on a property you don't own
3. Click "Contact" button
4. Payment modal should appear
5. Select "Airtel Money"
6. Enter a test number: `250788123456`
7. Click "Pay"
8. Monitor the status updates

### 4.4 Test Demo Page
Visit http://localhost:3000/demo/payment to see all payment options without making real API calls.

---

## 🔍 Step 5: Verify Everything Works

### 5.1 Check Database
1. Go to Supabase Dashboard → Table Editor
2. Check `payments` table:
   - Should see new payment records
   - Status should update from `pending` → `processing` → `completed`
3. Check `premium_users` table:
   - Should see new premium subscription records
   - `expires_at` should be set correctly

### 5.2 Check Payment Features
1. **Premium Subscription**:
   - After successful payment, you should have premium status
   - Contact viewing should be free for premium users
   
2. **Contact Unlock**:
   - Non-premium users should see payment modal when clicking "Contact"
   - After payment, contact info should display
   
3. **Go Premium Button**:
   - Should show premium modal with plan options
   - Should open payment modal on plan selection

---

## 🚀 Step 6: Moving to Production

### 6.1 MTN Mobile Money Production
1. Contact MTN Business to upgrade to production API access
2. Complete KYC (Know Your Customer) requirements
3. Get production API credentials
4. Update `.env.local`:
```bash
MOMO_API_URL=https://proxy.momoapi.mtn.com
MOMO_SUBSCRIPTION_KEY=your_production_key
MOMO_API_USER=your_production_user
MOMO_API_KEY=your_production_key
```

### 6.2 Airtel Money Production
1. Contact Airtel Business or complete production onboarding
2. Provide business documentation
3. Get production API credentials
4. Update `.env.local`:
```bash
AIRTEL_API_URL=https://openapi.airtel.africa
AIRTEL_CLIENT_ID=your_production_client_id
AIRTEL_CLIENT_SECRET=your_production_client_secret
```

---

## 📞 Support Contacts

### MTN Mobile Money
- Developer Portal: https://momodeveloper.mtn.com/
- Support Email: api-support@mtn.com
- Documentation: https://momodeveloper.mtn.com/api-documentation/

### Airtel Money
- Developer Portal: https://developers.airtel.africa/
- Support Email: developer@airtel.com
- Documentation: https://developers.airtel.africa/documentation

### Rwanda Specific Contacts
- **MTN Rwanda**: +250 788 162 500
- **Airtel Rwanda**: +250 788 100 100

---

## ❓ Troubleshooting

### Issue: "Invalid subscription key" (MTN)
**Solution:** 
- Verify you subscribed to the "Collection" product
- Check that your subscription key is correctly copied to `.env.local`
- Restart your dev server after updating `.env.local`

### Issue: "Invalid credentials" (Airtel)
**Solution:**
- Verify Client ID and Client Secret are correct
- Check that you selected Rwanda as the country
- Ensure you selected "Airtel Money" product when creating the app

### Issue: "Payment status stuck on 'processing'"
**Solution:**
- In sandbox/staging, some transactions may not auto-complete
- Check the API response in browser console (F12 → Console)
- Verify your API credentials are correct
- Try with a different test phone number

### Issue: Database errors
**Solution:**
- Ensure you ran the `supabase-payments-table.sql` file completely
- Check that both `payments` and `premium_users` tables exist
- Verify RLS policies are enabled

### Issue: "Token expired" or auth errors
**Solution:**
- Log out and log back in
- Check browser console for auth errors
- Verify Supabase credentials in `.env.local`

---

## ✅ Checklist

Before considering setup complete, verify:

- [ ] Database tables created (payments, premium_users)
- [ ] MTN developer account created
- [ ] MTN subscription key obtained
- [ ] MTN API user and key generated
- [ ] MTN credentials added to .env.local
- [ ] Airtel developer account created
- [ ] Airtel application created
- [ ] Airtel Client ID and Secret obtained
- [ ] Airtel credentials added to .env.local
- [ ] Dev server restarted with new credentials
- [ ] Test payment with MTN sandbox number (46733123450)
- [ ] Test payment with Airtel staging number
- [ ] Verify payment record in database
- [ ] Verify premium status updates correctly
- [ ] Test contact unlock feature
- [ ] Test Go Premium button

---

## 📚 Additional Resources

- **PAYMENT_SETUP.md**: Detailed technical documentation
- **TESTING_GUIDE.md**: Comprehensive testing instructions
- **supabase-payments-table.sql**: Database schema
- **/demo/payment**: Demo page for UI testing

---

## 🎉 Success!

Once all steps are complete, your payment integration is fully functional! Users can:
- Subscribe to premium plans (monthly/yearly)
- Unlock property contact information
- Pay with MTN Mobile Money or Airtel Money
- Track their payment history
- Enjoy premium benefits

Good luck! 🚀
