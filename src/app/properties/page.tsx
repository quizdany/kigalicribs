"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Heart, Loader2, Phone, X, Copy } from 'lucide-react'

export default function PropertiesList() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactInfo, setContactInfo] = useState<any | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties')
      const json = await res.json()
      if (json?.success) {
        setProperties(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const openContact = async (propertyId: string) => {
    try {
      setSelectedPropertyId(propertyId)
      setShowContactModal(true)
      setContactLoading(true)
      setContactError(null)
      setContactInfo(null)
      const res = await fetch(`/api/properties/${propertyId}/contact`)
      const json = await res.json()
      if (!json?.success) {
        throw new Error(json?.error || 'Failed to load contact info')
      }
      setContactInfo(json.data)
    } catch (err: any) {
      console.error('Contact fetch error:', err)
      setContactError(err?.message || 'Failed to load contact info')
    } finally {
      setContactLoading(false)
    }
  }

  const copyToClipboard = async (text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.warn('Clipboard copy failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <img src="/images/kigalicribsLogo.png" alt="KigaliCribs Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl tracking-tighter">
                <span className="font-bold text-gray-900">K</span>
                <span className="text-gray-600">igali</span>
                <span className="font-bold text-gray-900">C</span>
                <span className="text-gray-600">ribs</span>
              </span>
            </Link>
            <AuthButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
          <Link 
            href="/properties/new" 
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            List a Property
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-red-600" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No properties available yet.</p>
            <Link 
              href="/properties/new" 
              className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Be the first to list a property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/properties/${property.id}`}>
                  <div className="relative cursor-pointer">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <button 
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link href={`/properties/${property.id}`} className="block mb-3">
                    <div className="flex justify-between items-start mb-2 cursor-pointer">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 hover:text-red-600 transition-colors">{property.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{property.address || property.location}, {property.district}</span>
                    </p>
                  </Link>
                  
                  {(property.bedrooms || property.bathrooms || property.size) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      {property.bedrooms && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.size && (
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{property.size} sqft</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        {Number(property.price).toLocaleString()}
                      </span>
                      <span className="text-gray-600 text-sm"> RWF/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(property.property_type || property.type) && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                          {property.property_type || property.type}
                        </span>
                      )}
                      <button
                        onClick={() => openContact(property.id)}
                        className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Owner contact</h3>
              <button
                onClick={() => {
                  setShowContactModal(false)
                  setSelectedPropertyId(null)
                  setContactInfo(null)
                  setContactError(null)
                }}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {contactLoading && (
                <p className="text-gray-600">Loading contact…</p>
              )}
              {contactError && (
                <p className="text-red-600 text-sm">{contactError}</p>
              )}
              {!contactLoading && !contactError && contactInfo && (
                <div className="space-y-4">
                  {contactInfo.title && (
                    <div>
                      <p className="text-sm text-gray-500">Property</p>
                      <p className="font-medium">{contactInfo.title}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium break-all">{contactInfo.owner_email || 'Not provided'}</p>
                    </div>
                    {contactInfo.owner_email && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${contactInfo.owner_email}`}
                          className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                        >Email</a>
                        <button
                          onClick={() => copyToClipboard(contactInfo.owner_email)}
                          className="p-2 rounded border hover:bg-gray-50"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{contactInfo.owner_phone || 'Not provided'}</p>
                    </div>
                    {contactInfo.owner_phone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${contactInfo.owner_phone}`}
                          className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        >Call</a>
                        <button
                          onClick={() => copyToClipboard(contactInfo.owner_phone)}
                          className="p-2 rounded border hover:bg-gray-50"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              {selectedPropertyId && (
                <Link
                  href={`/contracts/new?propertyId=${selectedPropertyId}`}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Start lease agreement
                </Link>
              )}
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
