-- Check if properties were updated after approval

-- 1. Check the properties that had verifications
SELECT 
  p.id,
  p.title,
  p.listing_type,
  p.verification_status,
  p.verified_at,
  pv.status as verification_request_status,
  pv.reviewed_at
FROM properties p
INNER JOIN property_verifications pv ON pv.property_id = p.id
ORDER BY pv.reviewed_at DESC NULLS LAST;

-- 2. Check specific properties by ID (replace with your property IDs)
SELECT 
  id,
  title,
  listing_type,
  verification_status,
  verified_at,
  listing_expires_at,
  featured,
  featured_until,
  priority_until
FROM properties
WHERE id IN (
  SELECT property_id FROM property_verifications
);

-- 3. Check verification records status
SELECT 
  id,
  property_id,
  verification_type,
  status,
  requested_at,
  reviewed_at,
  admin_notes
FROM property_verifications
ORDER BY reviewed_at DESC NULLS LAST;
