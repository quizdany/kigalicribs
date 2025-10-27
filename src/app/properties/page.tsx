"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import PropertyBadges from '@/components/PropertyBadges'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Heart, Loader2, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function PropertiesList() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id || null)
    } catch (err) {
      console.error('Error fetching current user:', err)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <img src="/images/kigalicribsLogo.png" alt="KeyLinka Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl tracking-tighter">
                <span className="font-bold text-gray-900">K</span>
                <span className="text-gray-600">ey</span>
                <span className="font-bold text-gray-900">L</span>
                <span className="text-gray-600">inka</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link 
                href="/properties/new" 
                className="px-6 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
              >
                List a Property
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
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
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
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
                
                <div className="p-4 flex flex-col flex-grow">
                  <Link href={`/properties/${property.id}`} className="block">
                    <div className="space-y-1 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 hover:text-red-600 transition-colors cursor-pointer">{property.title}</h3>
                      
                      <p className="text-gray-600 text-sm flex items-center">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{property.address || property.location}, {property.district}</span>
                      </p>
                    </div>
                  </Link>
                  
                  {/* Property Badges - Fixed Height */}
                  <div className="min-h-[32px] mb-2">
                    <PropertyBadges
                      listing_type={property.listing_type}
                      verification_status={property.verification_status}
                      listing_expires_at={property.listing_expires_at}
                      featured_until={property.featured_until}
                      priority_until={property.priority_until}
                      isOwner={currentUserId === property.owner_id}
                    />
                  </div>
                  
                  {/* Property Details - Fixed Height */}
                  <div className="min-h-[24px] mb-2">
                    {(property.bedrooms || property.bathrooms || property.size) && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  </div>
                  
                  {/* Price and Contact - Push to bottom */}
                  <div className="flex justify-between items-center pt-3 border-t mt-auto">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        {Number(property.price).toLocaleString()}
                      </span>
                      <span className="text-gray-600 text-sm"> RWF/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-medium text-sm rounded-lg transition-colors"
                      >
                        Contact Owner
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
