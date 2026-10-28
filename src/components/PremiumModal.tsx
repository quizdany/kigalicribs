'use client'

import { useState } from 'react'
import { X, Seal, SealCheck, Star, Check } from '@phosphor-icons/react'
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
      <div className="tk-surface bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="tk-section-title text-2xl font-bold text-gray-900">Upgrade your listing</h2>
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
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                Current listing type: <strong className="capitalize">{currentListingType.replace('_', ' ')}</strong>
              </p>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Verified Listing */}
            <div className="border-2 border-emerald-500 rounded-lg p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <SealCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">Verified listing</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">30,000</span>
                <span className="text-gray-600 ml-2">RWF</span>
                <p className="text-sm text-gray-600 mt-1">Valid for 6 months</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Admin verification required</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">8-10 professional photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Verified badge on listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Higher trust from tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">6 months validity</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('verified_listing')}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                disabled={currentListingType === 'verified' || currentListingType === 'premium_verified'}
              >
                {currentListingType === 'basic' ? 'Upgrade listing' : 'Current Plan'}
              </button>
            </div>

            {/* Premium Verified Listing */}
            <div className="border-2 border-emerald-500 rounded-lg p-6 relative bg-gradient-to-br from-emerald-50 to-amber-50">
              <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-emerald-600 to-amber-600 text-white text-sm font-bold rounded-full">
                BEST VALUE
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">Premium verified</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">50,000</span>
                <span className="text-gray-600 ml-2">RWF</span>
                <p className="text-sm text-gray-600 mt-1">Valid for 6 months</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Everything in Verified</strong> +</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Featured for 30 days</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority listing for 90 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Premium badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Top search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Maximum visibility</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('premium_verified_listing')}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-amber-600 text-white rounded-lg hover:from-emerald-700 hover:to-amber-700 font-medium transition-colors"
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
