import { z } from 'zod';

export const listingReportSchema = z.object({
  kind: z.literal('listing_report'),
  propertyId: z.string().uuid(),
  reason: z.enum(['broker_or_agent', 'already_rented', 'incorrect_details', 'suspected_scam', 'duplicate']),
  details: z.string().trim().max(1200).optional().default(''),
}).strict();

export const viewingRequestSchema = z.object({
  kind: z.literal('viewing'),
  propertyId: z.string().uuid(),
  message: z.string().trim().min(10).max(2000),
}).strict();

export const requestSchema = z.object({
  kind: z.enum(['support', 'content_draft']),
  propertyId: z.string().uuid().optional(),
  message: z.string().trim().min(10).max(2000),
}).strict();

export const marketplaceRequestSchema = z.discriminatedUnion('kind', [
  listingReportSchema,
  viewingRequestSchema,
  requestSchema,
]);

export const ownerViewingResponseSchema = z.object({
  id: z.string().uuid(),
  reply: z.string().trim().min(2).max(3000),
  decision: z.enum(['reviewed', 'confirmed', 'declined']).default('reviewed'),
}).strict();

export function canContactListing(input: {
  available: boolean;
  isOwner: boolean;
  alreadyUnlocked: boolean;
  hasActiveUnlimitedAccess: boolean;
  usedFreeUnlocks: number;
  freeUnlockLimit?: number;
}) {
  if (!input.available) return { allowed: false, reason: 'unavailable' as const };
  if (input.isOwner) return { allowed: false, reason: 'own_listing' as const };
  if (input.alreadyUnlocked) return { allowed: true, reason: 'already_unlocked' as const };
  if (input.hasActiveUnlimitedAccess) return { allowed: true, reason: 'unlimited_access' as const };
  if (input.usedFreeUnlocks < (input.freeUnlockLimit ?? 3)) return { allowed: true, reason: 'free_allowance' as const };
  return { allowed: false, reason: 'allowance_exhausted' as const };
}

export function isEntitlementActive(input: { isActive: boolean; expiresAt?: string | null; now?: number }) {
  if (!input.isActive) return false;
  if (!input.expiresAt) return true;
  const expiresAt = Date.parse(input.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt >= (input.now ?? Date.now());
}

export function isListingAvailable(input: { status: string; expiresAt?: string | null; now?: number }) {
  if (input.status !== 'available') return false;
  if (!input.expiresAt) return true;
  const expiresAt = Date.parse(input.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt >= (input.now ?? Date.now());
}

export function canOwnerRespondToViewing(status: string) {
  return status === 'pending' || status === 'reviewed';
}
