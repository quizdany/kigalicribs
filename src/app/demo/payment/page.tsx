'use client'

import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import { Shield, ShieldCheck, Star, RefreshCw, Clock } from 'lucide-react'
import { PaymentPurpose } from '@/lib/payments'

export default function PaymentDemoPage() {
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPurpose, setSelectedPurpose] = useState<PaymentPurpose>('verified_listing')

  const openPayment = (purpose: PaymentPurpose) => {
    setSelectedPurpose(purpose)
    setShowPayment(true)
  }

  return (
    <div className="tk-page min-h-[60vh] bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="tk-title text-4xl font-bold text-gray-900 mb-4">Payment System Demo</h1>
          <p className="text-lg text-gray-600">
            Test all payment purposes in the new revenue model
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This is a demo page. Real payments will be processed through MTN MoMo/Airtel Money.
            </p>
          </div>
        </div>

        {/* Payment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Verified Listing */}
          <div className="tk-surface bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Verified Listing</h3>
                <p className="text-sm text-gray-500">Landlord Package</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">30,000</span>
              <span className="text-gray-600"> RWF</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Admin verification
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                6 months validity
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                8 photos allowed
              </li>
            </ul>
            <button
              onClick={() => openPayment('verified_listing')}
              className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
            >
              Try Verified Payment
            </button>
          </div>

          {/* Premium Verified */}
          <div className="tk-surface bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-emerald-500 relative">
            <div className="absolute -top-3 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
              BEST VALUE
            </div>
            <div className="flex items-center mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Premium Verified</h3>
                <p className="text-sm text-gray-500">Top Tier</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">50,000</span>
              <span className="text-gray-600"> RWF</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                All verified features
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Featured placement
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Priority in search
              </li>
            </ul>
            <button
              onClick={() => openPayment('premium_verified_listing')}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
            >
              Try Premium Payment
            </button>
          </div>

          {/* Listing Refresh */}
          <div className="tk-surface bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Listing Refresh</h3>
                <p className="text-sm text-gray-500">Boost visibility</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">10,000</span>
              <span className="text-gray-600"> RWF</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Bump to top of list
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                7 days featured
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                24h cooldown
              </li>
            </ul>
            <button
              onClick={() => openPayment('listing_refresh')}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
            >
              Try Refresh Payment
            </button>
          </div>

          {/* Listing Extension */}
          <div className="tk-surface bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Clock className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Listing Extension</h3>
                <p className="text-sm text-gray-500">Extend validity</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">10,000</span>
              <span className="text-gray-600"> RWF</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                +3 months validity
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Keep listing active
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Available near expiry
              </li>
            </ul>
            <button
              onClick={() => openPayment('listing_extension')}
              className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
            >
              Try Extension Payment
            </button>
          </div>

          {/* Unlimited Contact Access */}
          <div className="tk-surface bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Unlimited Contacts</h3>
                <p className="text-sm text-gray-500">For tenants</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">10,000</span>
              <span className="text-gray-600"> RWF</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                Unlimited unlocks
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                One-time payment
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-emerald-500 mr-2" />
                After 3 free unlocks
              </li>
            </ul>
            <button
              onClick={() => openPayment('unlimited_contact_access')}
              className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors"
            >
              Try Contact Payment
            </button>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="tk-surface bg-white rounded-lg shadow-md p-6">
          <h2 className="tk-section-title text-xl font-bold text-gray-900 mb-4">How to Use This Demo</h2>
          <ol className="space-y-3 text-gray-600">
            <li className="flex">
              <span className="font-bold text-emerald-600 mr-3">1.</span>
              <span>Click any "Try Payment" button above to open the payment modal</span>
            </li>
            <li className="flex">
              <span className="font-bold text-emerald-600 mr-3">2.</span>
              <span>Select your payment provider (MTN MoMo or Airtel Money)</span>
            </li>
            <li className="flex">
              <span className="font-bold text-emerald-600 mr-3">3.</span>
              <span>Enter your phone number (250XXXXXXXXX or 078XXXXXXX)</span>
            </li>
            <li className="flex">
              <span className="font-bold text-emerald-600 mr-3">4.</span>
              <span>
                <strong>Note:</strong> You must be logged in to complete payments. 
                This demo page will show payment modal but API requires authentication.
              </span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h3 className="font-semibold text-teal-900 mb-2">Payment Purposes:</h3>
            <ul className="space-y-2 text-sm text-teal-800">
              <li><strong>Verified/Premium Verified:</strong> Landlord packages for listing upgrades</li>
              <li><strong>Listing Refresh:</strong> Bump property to top for 7 days</li>
              <li><strong>Listing Extension:</strong> Add 3 months to validity period</li>
              <li><strong>Unlimited Contacts:</strong> Unlock all contact info (for tenants)</li>
            </ul>
          </div>
        </div>

        {/* Payment Providers Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">📱 MTN Mobile Money</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Most popular in Rwanda</li>
              <li>• Instant payment processing</li>
              <li>• Phone: *182# to check balance</li>
              <li>• Sandbox test environment available</li>
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">📱 Airtel Money</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Wide coverage across Africa</li>
              <li>• Fast transaction processing</li>
              <li>• Phone: *500# to check balance</li>
              <li>• Staging environment for testing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        purpose={selectedPurpose}
        onSuccess={() => {
          alert('Payment successful! (Demo)')
          setShowPayment(false)
        }}
      />
    </div>
  )
}
