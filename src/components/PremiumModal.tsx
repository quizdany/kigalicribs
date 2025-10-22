'use client'

import { useState } from 'react'
import { X, Crown, Star, Check, Zap } from 'lucide-react'
import PaymentModal from './PaymentModal'
import { PaymentPurpose } from '@/lib/payments'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPurpose>('premium_monthly')

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
          onClose()
        }}
        purpose={selectedPlan}
        onSuccess={() => {
          setShowPayment(false)
          onClose()
          // Reload to update premium status
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
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8 text-center">
            Unlock unlimited access and premium features to find your perfect home faster
          </p>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Plan */}
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-red-500 transition-all">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">5,000</span>
                  <span className="text-gray-600"> RWF</span>
                </div>
                <p className="text-sm text-gray-500">Billed monthly</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited contact views</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited property listings</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Advanced search filters</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Save favorite properties</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('premium_monthly')}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
              >
                Choose Monthly
              </button>
            </div>

            {/* Yearly Plan - Highlighted */}
            <div className="border-2 border-red-600 rounded-lg p-6 relative bg-red-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                BEST VALUE - SAVE 17%
              </div>

              <div className="text-center mb-4 pt-2">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yearly</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-red-600">50,000</span>
                  <span className="text-gray-600"> RWF</span>
                </div>
                <p className="text-sm text-green-600 font-medium">Save 10,000 RWF per year</p>
                <p className="text-xs text-gray-500 mt-1">Billed annually</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Star className="h-5 w-5 text-red-600 fill-current mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">All monthly features</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">2 months free</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">Featured listing discount (20% off)</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">VIP support (priority)</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">Early access to new features</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('premium_yearly')}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
              >
                Choose Yearly - Best Deal
              </button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-center">Why Go Premium?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Unlimited Access</h4>
                <p className="text-sm text-gray-600">View all property contacts without limits</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Find Faster</h4>
                <p className="text-sm text-gray-600">Advanced filters and priority listings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Premium Support</h4>
                <p className="text-sm text-gray-600">Get help when you need it most</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Payment via MTN Mobile Money or Airtel Money</p>
            <p className="mt-1">Cancel anytime • Money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}
