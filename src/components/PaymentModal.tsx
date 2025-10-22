'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { PaymentPurpose, PaymentProvider, PRICING } from '@/lib/payments'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  purpose: PaymentPurpose
  onSuccess?: () => void
}

export default function PaymentModal({ isOpen, onClose, purpose, onSuccess }: PaymentModalProps) {
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
      const token = localStorage.getItem('supabase_token')
      if (!token) {
        setMessage('Please login to continue')
        setLoading(false)
        return
      }

      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber,
          purpose,
          provider
        })
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.payment.transactionId)
        setStatus('processing')
        setMessage('Payment initiated. Please check your phone and enter your PIN to complete the transaction.')
      } else {
        setStatus('failed')
        setMessage(data.error || 'Payment initiation failed')
      }
    } catch (error: any) {
      setStatus('failed')
      setMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!transactionId) return

    try {
      const token = localStorage.getItem('supabase_token')
      const response = await fetch(
        `/api/payments/status?transactionId=${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (data.success) {
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
      }
    } catch (error) {
      console.error('Status check error:', error)
    }
  }

  const getPurposeTitle = () => {
    const titles: Record<PaymentPurpose, string> = {
      premium_monthly: 'Premium Monthly Subscription',
      premium_yearly: 'Premium Yearly Subscription',
      contact_unlock: 'Unlock Property Contact',
      featured_listing: 'Featured Property Listing'
    }
    return titles[purpose]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading || status === 'processing'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Payment Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Payment For</p>
            <p className="font-semibold text-gray-900">{getPurposeTitle()}</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {amount.toLocaleString()} RWF
            </p>
          </div>

          {status === 'idle' && (
            <form onSubmit={handleSubmit}>
              {/* Provider Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  {/* Airtel Money Option */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      provider === 'airtel'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
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
                    <div className="ml-4 flex items-center">
                      <div className="flex flex-col items-start justify-center px-3 py-2 bg-white rounded border border-gray-200 min-w-[70px]">
                        <svg viewBox="0 0 100 40" className="h-8">
                          <text x="0" y="22" fill="#ED1C24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold">airtel</text>
                          <text x="0" y="35" fill="#ED1C24" fontFamily="Arial, sans-serif" fontSize="11">money</text>
                        </svg>
                      </div>
                      <span className="ml-3 font-medium text-gray-900">Airtel|RW</span>
                    </div>
                  </label>

                  {/* MTN Mobile Money Option */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      provider === 'momo'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value="momo"
                      checked={provider === 'momo'}
                      onChange={(e) => setProvider(e.target.value as PaymentProvider)}
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-4 flex items-center">
                      <div className="flex items-center justify-center px-3 py-2 bg-[#FFCB05] rounded border border-gray-200 min-w-[70px]">
                        <svg viewBox="0 0 80 40" className="h-10">
                          <circle cx="15" cy="15" r="12" fill="#000" opacity="0.3"/>
                          <circle cx="25" cy="15" r="12" fill="#000" opacity="0.3"/>
                          <circle cx="35" cy="15" r="12" fill="#000" opacity="0.3"/>
                          <text x="5" y="35" fill="#000" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="600">Mobile Money</text>
                        </svg>
                      </div>
                      <span className="ml-3 font-medium text-gray-900">MTN</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="078XXXXXXX or 250XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the phone number registered with {provider === 'momo' ? 'MTN MoMo' : 'Airtel Money'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !phoneNumber}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Pay'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</p>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          )}

          {/* Success State */}
          {status === 'completed' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</p>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</p>
              <p className="text-sm text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
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
