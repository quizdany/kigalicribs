# Payment Integration Test Guide

## 🧪 Testing Steps

### Test 1: Check Dev Server
1. Open browser: http://localhost:3000
2. You should see the homepage with "Go Premium" button

---

### Test 2: Test Premium Modal UI
1. Click the **"Go Premium"** button in the navbar
2. ✅ Premium modal should open
3. ✅ Should show two plans:
   - Monthly: 5,000 RWF
   - Yearly: 50,000 RWF (with "SAVE 17%" badge)
4. Try clicking on each plan - payment modal should open

---

### Test 3: Test MTN Mobile Money Payment (SANDBOX)
**Important:** You MUST be logged in first!

1. **Log in to your account:**
   - Click "Login" button
   - Sign in with your credentials
   - Make sure you're authenticated

2. **Start payment test:**
   - Click "Go Premium" button
   - Select "Monthly" plan (5,000 RWF)
   - Payment modal opens

3. **Select MTN:**
   - Should see Airtel and MTN options
   - MTN should have yellow background logo
   - Click/select MTN radio button

4. **Enter sandbox test number:**
   - Phone number: `46733123450` (this will succeed)
   - Click "Pay" button

5. **Expected flow:**
   - Status: "Processing Payment"
   - Message: "Please check your phone..."
   - After 5-10 seconds: "Payment completed successfully!"
   - Modal closes automatically
   - Page reloads

6. **Verify in database:**
   - Go to Supabase Dashboard → Table Editor
   - Check `payments` table → Should see new record with status "completed"
   - Check `premium_users` table → Should see your user_id with active subscription

---

### Test 4: Test Contact Unlock Feature
**Test the premium contact gating:**

1. **As non-premium user:**
   - Browse properties on homepage
   - Click on a property you DON'T own
   - Click "Contact" button
   - ✅ Payment modal should appear (500 RWF for contact unlock)

2. **Complete payment:**
   - Select MTN
   - Enter: `46733123451` (another sandbox success number)
   - Click "Pay"
   - Wait for completion
   - ✅ Contact info should display after payment

3. **As premium user (after Test 3):**
   - Click "Contact" on any property
   - ✅ Contact info should show immediately (no payment required)

---

### Test 5: Demo Page (No auth required)
1. Go to: http://localhost:3000/demo/payment
2. ✅ Should see 4 payment option cards
3. Click "Pay Now" on any card
4. ✅ Payment modal opens
5. Try entering phone and clicking Pay
6. ✅ Should show "Invalid token" error (expected - demo mode)

---

## 📱 MTN Sandbox Test Numbers

| Phone Number | Result |
|--------------|--------|
| 46733123450-59 | ✅ Success |
| 46733123460-69 | ❌ Failure |

Use these to test different scenarios!

---

## 🔍 Verification Checklist

After testing, verify:
- [ ] Premium modal opens and closes correctly
- [ ] Payment modal shows MTN/Airtel options
- [ ] MTN logo has yellow background
- [ ] Phone number input accepts numbers
- [ ] "Pay" button is clickable
- [ ] Status changes from "idle" → "processing" → "completed"
- [ ] Payment record created in `payments` table
- [ ] Premium subscription created in `premium_users` table
- [ ] Contact unlock works for non-premium users
- [ ] Contact unlock is free for premium users
- [ ] Premium status persists after page reload

---

## 🐛 Troubleshooting

### Issue: "Invalid token" error
**Solution:** Make sure you're logged in! Payment requires authentication.

### Issue: Payment stuck on "processing"
**Solution:** 
- Sandbox can take 10-15 seconds
- Check browser console (F12) for errors
- Verify credentials in .env.local are correct

### Issue: "Failed to initiate payment"
**Solution:**
- Check MTN credentials are correct
- Verify dev server restarted after .env.local changes
- Check browser console for specific error

### Issue: Database errors
**Solution:**
- Verify both tables exist in Supabase
- Check that RLS is disabled for testing
- Look at Supabase logs

---

## 📊 What to Check in Supabase

After a successful payment, check these tables:

### `payments` table should have:
```
id: [UUID]
user_id: [Your user UUID]
amount: 5000.00
currency: RWF
provider: momo
phone_number: 46733123450
status: completed
transaction_id: [UUID]
purpose: premium_monthly
created_at: [timestamp]
```

### `premium_users` table should have:
```
id: [UUID]
user_id: [Your user UUID]
subscription_type: monthly
starts_at: [timestamp]
expires_at: [30 days from now]
is_active: true
payment_id: [references payment id]
```

---

## ✅ Success Criteria

Your payment integration is working if:
1. ✅ You can initiate a payment
2. ✅ Payment status updates automatically
3. ✅ Payment completes successfully with sandbox number
4. ✅ Database records are created correctly
5. ✅ Premium status is activated
6. ✅ Contact unlock respects premium status

---

**Ready to test!** Start with Test 1 and work your way through. Good luck! 🚀
