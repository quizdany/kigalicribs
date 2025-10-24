'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { PaymentPurpose, PaymentProvider, PRICING } from '@/lib/payments'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  purpose: PaymentPurpose
  propertyId?: string
  onSuccess?: () => void
}

export default function PaymentModal({ isOpen, onClose, purpose, propertyId, onSuccess }: PaymentModalProps) {
  const [provider, setProvider] = useState<PaymentProvider>('momo')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [message, setMessage] = useState('')
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const amount = PRICING[purpose]

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStatus('idle')
      setMessage('')
      setTransactionId(null)
      setPhoneNumber('')
    }
  }, [isOpen])

  useEffect(() => {
    if (status === 'processing' && transactionId) {
      const interval = setInterval(async () => {
        await checkPaymentStatus()
      }, 5000) // Check every 5 seconds

      return () => clearInterval(interval)
    }
  }, [status, transactionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Get Supabase session token
      const { supabase } = await import('@/lib/supabase')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        setMessage('Please login to continue')
        setStatus('failed')
        setLoading(false)
        return
      }

      const token = session.access_token

      console.log('Initiating payment:', { phoneNumber, purpose, provider })

      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber,
          purpose,
          provider,
          propertyId // Include propertyId for listing-related payments
        })
      })

      console.log('Raw response status:', response.status, response.statusText)

      let data: any = {}
      try {
        data = await response.json()
      } catch (parseError: any) {
        console.log('Failed to parse response as JSON:', parseError.message)
        setStatus('failed')
        setMessage('Server response error. Please try again.')
        return
      }

      console.log('Payment response:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      })

      if (response.ok && data.success) {
        setTransactionId(data.payment.transactionId)
        setStatus('processing')
        setMessage('Payment initiated. Please check your phone and enter your PIN to complete the transaction.')
      } else {
        setStatus('failed')
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        setMessage(errorMessage)
        // Log to console but don't use console.error to avoid error overlay
        console.log('[Payment Failed]', {
          httpStatus: response.status,
          httpStatusText: response.statusText,
          responseData: data,
          errorMessage
        })
      }
    } catch (error: any) {
      setStatus('failed')
      const errorMessage = error.message || 'An unexpected error occurred'
      setMessage(errorMessage)
      // Log to console but don't use console.error
      console.log('[Payment Error]', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        errorObject: error
      })
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!transactionId) return

    try {
      // Get Supabase session token
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) return

      const response = await fetch(
        `/api/payments/status?transactionId=${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      )

      const data = await response.json()
      console.log('Payment status check response:', {
        status: response.status,
        data
      })

      if (response.ok && data.success) {
        if (data.payment.status === 'completed') {
          setStatus('completed')
          setMessage('Payment completed successfully!')
          if (onSuccess) {
            setTimeout(() => {
              onSuccess()
              onClose()
            }, 2000)
          }
        } else if (data.payment.status === 'failed') {
          setStatus('failed')
          setMessage('Payment failed. Please try again.')
        }
      } else {
        console.log('[Payment Status Check Failed]', {
          httpStatus: response.status,
          responseData: data
        })
      }
    } catch (error: any) {
      console.log('[Status Check Error]', {
        name: error.name,
        message: error.message,
        errorObject: error
      })
    }
  }

  const getPurposeTitle = () => {
    const titles: Record<PaymentPurpose, string> = {
      verified_listing: 'Verified Property Listing',
      premium_verified_listing: 'Premium Verified Listing',
      listing_refresh: 'Refresh Property Listing',
      listing_extension: 'Extend Listing Validity',
      unlimited_contact_access: 'Unlimited Contact Access',
      contact_unlock: 'Unlock Property Contact'
    }
    return titles[purpose]
  }

  const getPurposeDescription = () => {
    const descriptions: Record<PaymentPurpose, string> = {
      verified_listing: '6 months validity with admin verification. Up to 10 professional photos.',
      premium_verified_listing: '6 months validity + Featured for 30 days + Priority listing for 90 days.',
      listing_refresh: 'Bump your listing to the top of search results for 7 days.',
      listing_extension: 'Extend your listing validity by 3 more months.',
      unlimited_contact_access: 'Unlock unlimited property contact information (lifetime access).',
      contact_unlock: 'Unlock contact information for this property.'
    }
    return descriptions[purpose]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Complete Payment</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading || status === 'processing'}
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Payment Details */}
          <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment For</p>
            <p className="font-bold text-gray-900 text-lg mb-1">{getPurposeTitle()}</p>
            <p className="text-sm text-gray-600 mb-4">{getPurposeDescription()}</p>
            <p className="text-3xl font-bold text-gray-900">
              {amount.toLocaleString()} <span className="text-xl font-semibold text-gray-600">RWF</span>
            </p>
          </div>

          {status === 'idle' && (
            <form onSubmit={handleSubmit}>
              {/* Provider Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  {/* Airtel Money Option */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      provider === 'airtel'
                        ? 'border-red-500 bg-red-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="airtel"
                      checked={provider === 'airtel'}
                      onChange={(e) => setProvider(e.target.value as PaymentProvider)}
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-4 flex items-center flex-1">
                      <div className="flex items-center justify-center bg-white rounded-lg p-2 min-w-[80px]">
                        <svg viewBox="0 0 120 50" className="h-10 w-auto">
                          {/* Airtel logo */}
                          <text x="10" y="28" fill="#ED1C24" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">airtel</text>
                          <text x="10" y="42" fill="#ED1C24" fontFamily="Arial, sans-serif" fontSize="12">money</text>
                        </svg>
                      </div>
                      <span className="ml-4 font-semibold text-gray-900">Airtel|RW</span>
                    </div>
                  </label>

                  {/* MTN Mobile Money Option */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      provider === 'momo'
                        ? 'border-yellow-500 bg-yellow-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="momo"
                      checked={provider === 'momo'}
                      onChange={(e) => setProvider(e.target.value as PaymentProvider)}
                      className="w-5 h-5 text-yellow-500 focus:ring-yellow-500"
                    />
                    <div className="ml-4 flex items-center flex-1">
                      <div className="flex items-center justify-center bg-[#FFCB05] rounded-lg p-2.5 min-w-[80px]">
                        <svg viewBox="0 0 120 50" className="h-10 w-auto">
                          {/* MTN Mobile Money logo */}
                          <image 
                            href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 50'%3E%3Ctext x='10' y='30' fill='%23000' font-family='Arial' font-size='18' font-weight='bold'%3EMTN%3C/text%3E%3Ctext x='8' y='45' fill='%23000' font-family='Arial' font-size='10'%3EMobile Money%3C/text%3E%3C/svg%3E"
                            width="120"
                            height="50"
                          />
                        </svg>
                      </div>
                      <span className="ml-4 font-semibold text-gray-900">MTN</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="078XXXXXXX or 250XXXXXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Enter the phone number registered with {provider === 'momo' ? 'MTN MoMo' : 'Airtel Money'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-orange-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="text-center py-8">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <Loader2 className="relative animate-spin h-16 w-16 text-orange-500 mx-auto mb-4" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">Processing Payment</p>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">{message}</p>
            </div>
          )}

          {/* Success State */}
          {status === 'completed' && (
            <div className="text-center py-8">
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</p>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className="text-center py-8">
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-red-100 rounded-full p-3">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">Payment Failed</p>
              <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">{message}</p>
              <button
                onClick={() => setStatus('idle')}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold transition-all shadow-lg shadow-orange-500/30"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
