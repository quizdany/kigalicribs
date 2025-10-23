'use client'

import { useState } from 'react'
import { X, Shield, ShieldCheck, Star, Check } from 'lucide-react'
import PaymentModal from './PaymentModal'
import { PaymentPurpose } from '@/lib/payments'

interface ListingUpgradeModalProps {
  isOpen: boolean
  onCloseAction: () => void
  propertyId?: string
  currentListingType?: 'basic' | 'verified' | 'premium_verified'
}

export default function ListingUpgradeModal({ 
  isOpen, 
  onCloseAction, 
  propertyId,
  currentListingType = 'basic'
}: ListingUpgradeModalProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPurpose>('verified_listing')

  const handleUpgrade = (plan: PaymentPurpose) => {
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  if (!isOpen && !showPayment) return null

  if (showPayment) {
    return (
      <PaymentModal
        isOpen={showPayment}
        onClose={() => {
          setShowPayment(false)
          onCloseAction()
        }}
        purpose={selectedPlan}
        propertyId={propertyId}
        onSuccess={() => {
          setShowPayment(false)
          onCloseAction()
          // Reload to update listing status
          window.location.reload()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Listing</h2>
              <p className="text-gray-600 mt-1">Choose the best plan for your property</p>
            </div>
            <button
              onClick={onCloseAction}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current Status */}
          {currentListingType !== 'basic' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Current listing type: <strong className="capitalize">{currentListingType.replace('_', ' ')}</strong>
              </p>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Verified Listing */}
            <div className="border-2 border-blue-500 rounded-lg p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Verified Listing</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">30,000</span>
                <span className="text-gray-600 ml-2">RWF</span>
                <p className="text-sm text-gray-600 mt-1">Valid for 6 months</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Admin verification required</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">8-10 professional photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Verified badge on listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Higher trust from tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">6 months validity</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('verified_listing')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                disabled={currentListingType === 'verified' || currentListingType === 'premium_verified'}
              >
                {currentListingType === 'basic' ? 'Upgrade Now' : 'Current Plan'}
              </button>
            </div>

            {/* Premium Verified Listing */}
            <div className="border-2 border-purple-500 rounded-lg p-6 relative bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full">
                BEST VALUE
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Premium Verified</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">50,000</span>
                <span className="text-gray-600 ml-2">RWF</span>
                <p className="text-sm text-gray-600 mt-1">Valid for 6 months</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Everything in Verified</strong> +</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Featured for 30 days</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority listing for 90 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Premium badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Top search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Maximum visibility</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('premium_verified_listing')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-colors"
                disabled={currentListingType === 'premium_verified'}
              >
                {currentListingType === 'premium_verified' ? 'Current Plan' : 'Get Premium'}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note:</strong> After payment, your listing will be marked as "Pending Verification". 
              Our admin team will review and approve your listing within 24-48 hours.
            </p>
            <p>
              All verified listings are valid for 6 months. You can extend validity before expiry for 10,000 RWF per 3 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
