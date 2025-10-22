'use client'

import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import { CreditCard, Crown, Lock, Star } from 'lucide-react'
import { PaymentPurpose } from '@/lib/payments'

export default function PaymentDemoPage() {
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPurpose, setSelectedPurpose] = useState<PaymentPurpose>('premium_monthly')

  const openPayment = (purpose: PaymentPurpose) => {
    setSelectedPurpose(purpose)
    setShowPayment(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment System Demo</h1>
          <p className="text-lg text-gray-600">
            Test the payment modal without real API integration
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a demo page. Payment APIs are not connected yet. 
              To enable real payments, configure your environment variables (see PAYMENT_SETUP.md)
            </p>
          </div>
        </div>

        {/* Payment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Premium Monthly */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Crown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Premium Monthly</h3>
                <p className="text-sm text-gray-500">Subscription</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">5,000</span>
              <span className="text-gray-600"> RWF/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                Unlimited contact views
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                Unlimited property listings
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                Advanced search filters
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                Priority support
              </li>
            </ul>
            <button
              onClick={() => openPayment('premium_monthly')}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Try Monthly Payment
            </button>
          </div>

          {/* Premium Yearly */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-red-500 relative">
            <div className="absolute -top-3 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              SAVE 17%
            </div>
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Crown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Premium Yearly</h3>
                <p className="text-sm text-gray-500">Best Value</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">50,000</span>
              <span className="text-gray-600"> RWF/year</span>
              <p className="text-sm text-green-600 mt-1">Save 10,000 RWF vs monthly</p>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                All monthly features
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                2 months free
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                Featured listing discount
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 mr-2" />
                VIP support
              </li>
            </ul>
            <button
              onClick={() => openPayment('premium_yearly')}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Try Yearly Payment
            </button>
          </div>

          {/* Contact Unlock */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Contact Unlock</h3>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">500</span>
              <span className="text-gray-600"> RWF</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              View owner contact information for a specific property. Perfect for one-time inquiries.
            </p>
            <button
              onClick={() => openPayment('contact_unlock')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Try Contact Unlock
            </button>
          </div>

          {/* Featured Listing */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">Featured Listing</h3>
                <p className="text-sm text-gray-500">Boost visibility</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">10,000</span>
              <span className="text-gray-600"> RWF/week</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-purple-500 mr-2" />
                Top position in search results
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-purple-500 mr-2" />
                Highlighted badge
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-purple-500 mr-2" />
                5x more views
              </li>
            </ul>
            <button
              onClick={() => openPayment('featured_listing')}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Try Featured Listing
            </button>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use This Demo</h2>
          <ol className="space-y-3 text-gray-600">
            <li className="flex">
              <span className="font-bold text-red-600 mr-3">1.</span>
              <span>Click any "Try Payment" button above to open the payment modal</span>
            </li>
            <li className="flex">
              <span className="font-bold text-red-600 mr-3">2.</span>
              <span>Select your payment provider (MTN MoMo or Airtel Money)</span>
            </li>
            <li className="flex">
              <span className="font-bold text-red-600 mr-3">3.</span>
              <span>Enter any phone number format (250XXXXXXXXX or 078XXXXXXX)</span>
            </li>
            <li className="flex">
              <span className="font-bold text-red-600 mr-3">4.</span>
              <span>
                <strong>Note:</strong> The payment will fail with "Invalid token" error because 
                this demo doesn't require authentication. This is expected behavior.
              </span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">To Enable Real Payments:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Get MTN MoMo and Airtel Money API credentials</li>
              <li>2. Add them to your .env.local file</li>
              <li>3. Run the database migration (supabase-payments-table.sql)</li>
              <li>4. Login to the app before testing payments</li>
            </ol>
            <p className="text-sm text-blue-600 mt-3">
              See <code className="bg-blue-100 px-2 py-1 rounded">PAYMENT_SETUP.md</code> for detailed instructions
            </p>
          </div>
        </div>

        {/* Payment Providers Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">📱 MTN Mobile Money</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Most popular in Rwanda</li>
              <li>• Instant payment processing</li>
              <li>• Phone: *182# to check balance</li>
              <li>• Sandbox test numbers available</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
          alert('Payment would be successful! (Demo mode)')
          setShowPayment(false)
        }}
      />
    </div>
  )
}
