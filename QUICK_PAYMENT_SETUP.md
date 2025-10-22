# Quick Setup Guide - Payment Integration

## 🚀 Quick Start (5 Steps)

### Step 1: Database Setup (5 minutes)
```bash
1. Go to: https://supabase.com/dashboard
2. Open your project: ciedcesfclfqukhrnqrp
3. Click: SQL Editor → New Query
4. Copy content from: supabase-payments-table.sql
5. Click: Run (or Ctrl+Enter)
```

### Step 2: MTN Mobile Money Sandbox (10 minutes)
```bash
1. Sign up: https://momodeveloper.mtn.com/
2. Subscribe to: "Collection" product
3. Copy: Subscription Key (Primary Key)
4. Run in PowerShell to generate API credentials:
```

```powershell
# Replace with your actual subscription key
$subscriptionKey = "YOUR_SUBSCRIPTION_KEY_HERE"
$apiUser = [guid]::NewGuid().ToString()

# Create API User
Invoke-RestMethod -Uri "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser" `
  -Method Post `
  -Headers @{
    "X-Reference-Id" = $apiUser
    "Ocp-Apim-Subscription-Key" = $subscriptionKey
  } `
  -Body '{"providerCallbackHost":"webhook.site"}' `
  -ContentType "application/json"

# Create API Key
Start-Sleep -Seconds 2
$result = Invoke-RestMethod -Uri "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/$apiUser/apikey" `
  -Method Post `
  -Headers @{"Ocp-Apim-Subscription-Key" = $subscriptionKey}

Write-Host "API User: $apiUser"
Write-Host "API Key: $($result.apiKey)"
```

```bash
5. Save the output and update .env.local
```

### Step 3: Airtel Money Staging (10 minutes)
```bash
1. Sign up: https://developers.airtel.africa/
2. Create App: My Apps → Create New App
   - Name: KigaliCribs Payment
   - Country: Rwanda
   - Product: Airtel Money
3. Copy: Client ID and Client Secret
4. Update .env.local
```

### Step 4: Update Environment Variables
Edit `.env.local` with your actual credentials:

```env
# MTN Mobile Money (from Step 2)
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=your_actual_subscription_key
MOMO_API_USER=your_actual_api_user_uuid
MOMO_API_KEY=your_actual_api_key

# Airtel Money (from Step 3)
AIRTEL_API_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_actual_client_id
AIRTEL_CLIENT_SECRET=your_actual_client_secret
```

### Step 5: Test It!
```bash
# Restart dev server
npm run dev

# Test URLs:
- Demo: http://localhost:3000/demo/payment
- Premium: http://localhost:3000 → Click "Go Premium"
- Contact: Click "Contact" on any property

# Sandbox Test Numbers:
- MTN: 46733123450 (success)
- Airtel: 250788123456 (staging)
```

---

## 📋 Credentials Checklist

### MTN Mobile Money
- [ ] Subscription Key: `_________________________________`
- [ ] API User (UUID): `_________________________________`
- [ ] API Key: `_________________________________`

### Airtel Money
- [ ] Client ID: `_________________________________`
- [ ] Client Secret: `_________________________________`

---

## 🧪 Testing Commands

### Test Payment Flow
```bash
# 1. Go Premium
http://localhost:3000 → "Go Premium" button → Select plan → Enter phone

# 2. Unlock Contact
http://localhost:3000 → Click property → "Contact" → Enter phone

# 3. View Demo
http://localhost:3000/demo/payment
```

### Check Database
```sql
-- View all payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;

-- View premium users
SELECT * FROM premium_users WHERE is_active = true;
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid subscription key" | Check MTN subscription key, restart server |
| "Invalid credentials" | Verify Airtel Client ID/Secret |
| "Module not found: axios" | Run `npm install axios` |
| Payment stuck "processing" | Normal in sandbox, wait 10-15 seconds |
| Database error | Run SQL file again in Supabase |

---

## 📞 Quick Contacts

- **MTN Support**: api-support@mtn.com
- **Airtel Support**: developer@airtel.com
- **Documentation**: See `PAYMENT_INTEGRATION_SETUP.md` for detailed guide

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Payment modal opens with MTN/Airtel options
- ✅ After entering sandbox number (46733123450), you see "Processing"
- ✅ Status updates to "Payment completed successfully!"
- ✅ New record appears in `payments` table
- ✅ Premium status activates (for subscription payments)
- ✅ Contact info displays (for contact unlock payments)

---

**🎉 Ready to go!** Follow the steps above and you'll be accepting payments in ~25 minutes.

For detailed explanations, see: `PAYMENT_INTEGRATION_SETUP.md`
