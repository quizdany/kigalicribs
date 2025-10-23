-- Check verification data

-- 1. Check if property_verifications table has any data
SELECT COUNT(*) as total_verifications 
FROM property_verifications;

-- 2. See all verifications with status
SELECT 
  id,
  property_id,
  verification_type,
  status,
  requested_at,
  reviewed_at
FROM property_verifications
ORDER BY requested_at DESC;

-- 3. Check if there are pending verifications
SELECT 
  pv.id,
  pv.property_id,
  pv.verification_type,
  pv.status,
  pv.requested_at,
  p.title,
  p.location,
  p.district
FROM property_verifications pv
LEFT JOIN properties p ON p.id = pv.property_id
WHERE pv.status = 'pending'
ORDER BY pv.requested_at DESC;

-- 4. Check payments that should have created verifications
SELECT 
  p.id,
  p.user_id,
  p.purpose,
  p.property_id,
  p.status,
  p.created_at
FROM payments p
WHERE p.purpose IN ('verified_listing', 'premium_verified_listing')
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Cross-check: payments without verifications
SELECT 
  p.id as payment_id,
  p.purpose,
  p.property_id,
  p.status as payment_status,
  p.created_at,
  pv.id as verification_id,
  pv.status as verification_status
FROM payments p
LEFT JOIN property_verifications pv ON pv.payment_id = p.id
WHERE p.purpose IN ('verified_listing', 'premium_verified_listing')
ORDER BY p.created_at DESC
LIMIT 10;
