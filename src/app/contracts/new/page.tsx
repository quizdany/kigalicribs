"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function NewContractPage() {
  const params = useSearchParams()
  const propertyId = params.get('propertyId')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-gray-900 font-semibold">KigaliCribs</Link>
          <Link href="/properties" className="text-sm text-gray-600 hover:text-gray-900">Back to properties</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Start a lease agreement</h1>
        {propertyId && (
          <p className="text-sm text-gray-600 mb-6">For property ID: <span className="font-mono">{propertyId}</span></p>
        )}

        <div className="bg-white border rounded-lg p-6">
          <p className="text-gray-700 mb-4">This feature is coming soon.</p>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            <li>Fill tenant details and terms</li>
            <li>Generate a lease document</li>
            <li>Collect e-signatures from both parties</li>
            <li>Store the signed agreement securely</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
