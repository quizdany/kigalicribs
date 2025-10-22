'use client'

import { Shield, ShieldCheck, Star, Clock, AlertCircle } from 'lucide-react'

interface PropertyBadgesProps {
  listing_type?: 'basic' | 'verified' | 'premium_verified'
  verification_status?: 'none' | 'pending' | 'verified' | 'rejected'
  listing_expires_at?: string
  featured_until?: string
  priority_until?: string
}

export default function PropertyBadges({
  listing_type = 'basic',
  verification_status = 'none',
  listing_expires_at,
  featured_until,
  priority_until
}: PropertyBadgesProps) {
  const now = new Date()
  const expiryDate = listing_expires_at ? new Date(listing_expires_at) : null
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  
  const isFeatured = featured_until && new Date(featured_until) > now
  const isPriority = priority_until && new Date(priority_until) > now

  return (
    <div className="flex flex-wrap gap-2">
      {/* Listing Type Badge */}
      {listing_type === 'verified' && verification_status === 'verified' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <ShieldCheck className="h-4 w-4" />
          Verified Listing
        </span>
      )}
      
      {listing_type === 'premium_verified' && verification_status === 'verified' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
          <Star className="h-4 w-4" />
          Premium Verified
        </span>
      )}
      
      {listing_type === 'basic' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          Basic Listing
        </span>
      )}

      {/* Verification Status */}
      {verification_status === 'pending' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4" />
          Pending Verification
        </span>
      )}
      
      {verification_status === 'rejected' && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          Verification Rejected
        </span>
      )}

      {/* Featured Badge */}
      {isFeatured && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <Star className="h-4 w-4 fill-yellow-500" />
          Featured
        </span>
      )}

      {/* Priority Badge */}
      {isPriority && !isFeatured && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          ⬆️ Priority
        </span>
      )}

      {/* Expiry Warning */}
      {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4" />
          Expires in {daysUntilExpiry} days
        </span>
      )}
      
      {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          Expired
        </span>
      )}
    </div>
  )
}
