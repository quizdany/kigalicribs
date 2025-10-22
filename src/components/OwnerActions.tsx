'use client'

import { useState } from 'react'
import { RefreshCw, Clock, AlertCircle, Loader2 } from 'lucide-react'
import PaymentModal from './PaymentModal'
import { PaymentPurpose } from '@/lib/payments'
import { supabase } from '@/lib/supabase'

interface OwnerActionsProps {
  propertyId: string
  listing_type?: 'basic' | 'verified' | 'premium_verified'
  listing_expires_at?: string
  updated_at?: string
  onSuccess?: () => void
}

export default function OwnerActions({
  propertyId,
  listing_type = 'basic',
  listing_expires_at,
  updated_at,
  onSuccess
}: OwnerActionsProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentPurpose, setPaymentPurpose] = useState<PaymentPurpose>('listing_refresh')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const now = new Date()
  const expiryDate = listing_expires_at ? new Date(listing_expires_at) : null
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  const lastUpdated = updated_at ? new Date(updated_at) : null
  const hoursSinceUpdate = lastUpdated ? (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60) : 999

  const canRefresh = listing_type !== 'basic' && hoursSinceUpdate >= 24
  const canExtend = listing_type !== 'basic' && daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage({ type: 'error', text: 'Please login to continue' })
        return
      }

      const response = await fetch(`/api/properties/${propertyId}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.requiresPayment) {
        setPaymentPurpose('listing_refresh')
        setShowPaymentModal(true)
      } else if (!data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to refresh listing' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to refresh listing' })
    } finally {
      setLoading(false)
    }
  }

  const handleExtend = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage({ type: 'error', text: 'Please login to continue' })
        return
      }

      const response = await fetch(`/api/properties/${propertyId}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.requiresPayment) {
        setPaymentPurpose('listing_extension')
        setShowPaymentModal(true)
      } else if (!data.success) {
        setMessage({ type: 'error', text: data.error || 'Failed to extend listing' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to extend listing' })
    } finally {
      setLoading(false)
    }
  }

  if (listing_type === 'basic') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          💡 Upgrade to a <strong>Verified Listing</strong> to access refresh and extend features
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Listing Management</h3>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Refresh Button */}
        <div>
          <button
            onClick={handleRefresh}
            disabled={!canRefresh || loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Refresh Listing (10,000 RWF)
              </>
            )}
          </button>
          {!canRefresh && hoursSinceUpdate < 24 && (
            <p className="text-xs text-gray-500 mt-2">
              Can refresh again in {Math.ceil(24 - hoursSinceUpdate)} hours
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Bump your listing to the top for 7 days
          </p>
        </div>

        {/* Extend Button */}
        <div>
          <button
            onClick={handleExtend}
            disabled={!canExtend || loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Clock className="h-5 w-5" />
                Extend Validity (10,000 RWF)
              </>
            )}
          </button>
          {daysUntilExpiry !== null && (
            <p className="text-xs text-gray-500 mt-1">
              {canExtend 
                ? `Expires in ${daysUntilExpiry} days - Extend by 3 months`
                : daysUntilExpiry > 30
                ? `Available when listing has less than 30 days remaining`
                : 'Listing has expired'
              }
            </p>
          )}
        </div>

        {/* Expiry Info */}
        {expiryDate && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Listing expires:</span>
              <span className={`font-semibold ${
                daysUntilExpiry && daysUntilExpiry <= 7 ? 'text-red-600' :
                daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-orange-600' :
                'text-gray-900'
              }`}>
                {expiryDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        purpose={paymentPurpose}
        onSuccess={() => {
          setShowPaymentModal(false)
          setMessage({ type: 'success', text: 'Payment successful! Your listing will be updated shortly.' })
          if (onSuccess) {
            setTimeout(() => onSuccess(), 2000)
          }
        }}
      />
    </>
  )
}
