'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, Lock, Unlock, AlertCircle, Loader2 } from 'lucide-react'
import PaymentModal from './PaymentModal'
import { supabase } from '@/lib/supabase'

interface ContactUnlockButtonProps {
  propertyId: string
  propertyTitle: string
  onSuccess?: (contactInfo: any) => void
}

export default function ContactUnlockButton({ propertyId, propertyTitle, onSuccess }: ContactUnlockButtonProps) {
  const [unlockStatus, setUnlockStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState('')
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
    
    if (session) {
      fetchUnlockStatus()
    }
  }

  const fetchUnlockStatus = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/users/contact-unlock-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setUnlockStatus(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch unlock status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    try {
      setUnlocking(true)
      setError('')
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please login to continue')
        return
      }

      const response = await fetch(`/api/properties/${propertyId}/contact`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setContactInfo(data.data)
        if (onSuccess) {
          onSuccess(data.data)
        }
        // Refresh unlock status
        fetchUnlockStatus()
      } else if (data.requiresPayment) {
        // Show payment modal for unlimited access
        setShowPaymentModal(true)
      } else {
        setError(data.error || 'Failed to unlock contact')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock contact')
    } finally {
      setUnlocking(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/auth"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Lock className="h-5 w-5" />
        Login to View Contact
      </a>
    )
  }

  if (loading) {
    return (
      <div className="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading...
      </div>
    )
  }

  if (contactInfo) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
          <Unlock className="h-5 w-5" />
          Contact Information
        </div>
        {contactInfo.owner_email && (
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${contactInfo.owner_email}`} className="hover:underline">
              {contactInfo.owner_email}
            </a>
          </div>
        )}
        {contactInfo.owner_phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="h-4 w-4" />
            <a href={`tel:${contactInfo.owner_phone}`} className="hover:underline">
              {contactInfo.owner_phone}
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Unlock Status */}
        {unlockStatus && !unlockStatus.hasUnlimitedAccess && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span>Free unlocks remaining:</span>
              <span className="font-bold text-blue-600">
                {unlockStatus.remainingFreeUnlocks} of {unlockStatus.freeUnlocksLimit}
              </span>
            </div>
          </div>
        )}

        {unlockStatus?.hasUnlimitedAccess && (
          <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <Unlock className="h-4 w-4" />
            <span className="font-semibold">You have unlimited access</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Unlock Button */}
        <button
          onClick={handleUnlock}
          disabled={unlocking}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {unlocking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Unlocking...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              View Contact Information
            </>
          )}
        </button>

        {/* Pricing Info */}
        {unlockStatus && !unlockStatus.hasUnlimitedAccess && unlockStatus.remainingFreeUnlocks === 0 && (
          <p className="text-xs text-gray-500 text-center">
            Get unlimited access for {unlockStatus.unlimitedAccessPrice?.toLocaleString()} RWF
          </p>
        )}
      </div>

      {/* Payment Modal for Unlimited Access */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        purpose="unlimited_contact_access"
        onSuccess={() => {
          setShowPaymentModal(false)
          fetchUnlockStatus()
        }}
      />
    </>
  )
}
