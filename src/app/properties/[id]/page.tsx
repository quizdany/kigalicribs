"use client"

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MapPin, Bed, Bath, Square, Phone, Mail, Edit, ArrowLeft, X, ChevronLeft, ChevronRight, Heart, Loader2, Copy } from 'lucide-react'
import PropertyBadges from '@/components/PropertyBadges'
import ContactUnlockButton from '@/components/ContactUnlockButton'
import OwnerActions from '@/components/OwnerActions'
import ListingUpgradeModal from '@/components/PremiumModal'
import { useSearchParams } from 'next/navigation'

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactInfo, setContactInfo] = useState<any | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProperty()
    checkAuth()
  }, [id])
  
  useEffect(() => {
    // Auto-open upgrade modal if coming from property creation
    if (searchParams.get('showUpgrade') === 'true' && isOwner && property?.listing_type === 'basic') {
      setShowUpgradeModal(true)
    }
  }, [searchParams, isOwner, property])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUser(session?.user || null)
    } catch (err) {
      console.error('Auth check error:', err)
    }
  }

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/properties/${id}`)
      const json = await res.json()
      
      if (!json?.success) {
        throw new Error(json?.error || 'Failed to load property')
      }
      
      console.log('Property data fetched:', {
        listing_type: json.data?.listing_type,
        verification_status: json.data?.verification_status,
        verified_at: json.data?.verified_at
      })
      
      setProperty(json.data)
      
      // Check if current user is the owner
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user && json.data?.owner_id === session.user.id) {
        setIsOwner(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const openContact = async () => {
    try {
      setShowContactModal(true)
      setContactLoading(true)
      setContactError(null)
      setContactInfo(null)
      const res = await fetch(`/api/properties/${id}/contact`)
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

  const openImageGallery = (index: number) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
  }

  const nextImage = () => {
    if (property?.images && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
          <Link href="/properties" className="text-red-600 hover:text-red-700">
            Back to properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link href="/properties" className="flex items-center text-gray-700 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to properties
              </Link>
            </div>
            {isOwner && (
              <Link
                href={`/properties/${id}/edit`}
                className="flex items-center px-6 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Property
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Images Gallery */}
        <div className="mb-8">
          {property.images && property.images.length > 0 ? (
            <div className="relative">
              {/* Desktop Grid Layout */}
              <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[500px] rounded-lg overflow-hidden">
                {/* Large left image */}
                <div 
                  className="col-span-2 row-span-2 relative cursor-pointer group"
                  onClick={() => openImageGallery(0)}
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                  />
                </div>
                
                {/* Right grid - 4 smaller images */}
                {property.images.slice(1, 5).map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    className="relative cursor-pointer group"
                    onClick={() => openImageGallery(idx + 1)}
                  >
                    <img
                      src={img}
                      alt={`${property.title} - ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                    />
                    {/* Show all photos button on last visible image if more exist */}
                    {idx === 3 && property.images.length > 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-white text-center">
                          <span className="text-lg font-semibold">+{property.images.length - 5} more</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Fill empty slots if less than 5 images */}
                {property.images.length < 5 && Array.from({ length: 5 - property.images.length }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="bg-gray-200"></div>
                ))}
              </div>

              {/* Mobile: Single image carousel */}
              <div className="md:hidden relative">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-64 object-cover rounded-lg cursor-pointer"
                  onClick={() => openImageGallery(0)}
                />
                {property.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-70 text-white text-sm rounded-full">
                    1 / {property.images.length}
                  </div>
                )}
              </div>

              {/* Show all photos button - bottom right corner */}
              <button
                onClick={() => openImageGallery(0)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-white border border-gray-900 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Show all photos
              </button>

              {/* Favorite button - top right */}
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="w-full h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No images available</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title and Price */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address || property.location}, {property.district}</span>
                  </div>
                  {/* Property Badges */}
                  <PropertyBadges
                    listing_type={property.listing_type}
                    verification_status={property.verification_status}
                    listing_expires_at={property.listing_expires_at}
                    featured_until={property.featured_until}
                    priority_until={property.priority_until}
                    isOwner={isOwner}
                  />
                </div>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {Number(property.price).toLocaleString()}
                </span>
                <span className="text-base text-gray-600 ml-2">RWF/month</span>
              </div>
            </div>

            {/* Features */}
            {(property.bedrooms || property.bathrooms || property.size) && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Property Features</h2>
                <div className="grid grid-cols-3 gap-4">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 mr-2 text-gray-600" />
                      <div>
                        <div className="text-xl font-bold text-gray-900">{property.bedrooms}</div>
                        <div className="text-xs text-gray-600">Bedrooms</div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 mr-2 text-gray-600" />
                      <div>
                        <div className="text-xl font-bold text-gray-900">{property.bathrooms}</div>
                        <div className="text-xs text-gray-600">Bathrooms</div>
                      </div>
                    </div>
                  )}
                  {property.size && (
                    <div className="flex items-center">
                      <Square className="h-5 w-5 mr-2 text-gray-600" />
                      <div>
                        <div className="text-xl font-bold text-gray-900">{property.size}</div>
                        <div className="text-xs text-gray-600">sqft</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center text-gray-700 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Section for Non-Owners */}
            {!isOwner && (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested in this property?</h3>
                
                <ContactUnlockButton
                  propertyId={id}
                  propertyTitle={property.title}
                  propertyPrice={property.price}
                  propertyDistrict={property.district}
                  onSuccess={(contactInfo) => setContactInfo(contactInfo)}
                />
                
                {currentUser && (
                  <Link
                    href={`/contracts/new?propertyId=${id}`}
                    className="mt-3 w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Start Lease Agreement
                  </Link>
                )}
              </div>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">You own this property</p>
                  <p className="text-xs text-green-600 mt-1">Manage your listing below</p>
                </div>
                
                {/* Upgrade to Verified/Premium */}
                {property.listing_type === 'basic' && property.verification_status !== 'pending' && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          Get Your Property Verified
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Stand out from the crowd with a verified badge and premium features
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-sm"
                    >
                      Upgrade Listing
                    </button>
                    
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-green-600 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Verified badge & trust
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-green-600 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        6 months validity
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-green-600 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        From 30,000 RWF
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Awaiting Verification Notice - Replaces upgrade card after payment */}
                {property.verification_status === 'pending' && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Awaiting Verification
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">
                          Your payment has been received! Our admin team is reviewing your property for verification.
                        </p>
                        <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-2">
                          <div className="flex items-start">
                            <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-xs text-gray-700">
                              <strong>Payment confirmed</strong> - Thank you for upgrading
                            </p>
                          </div>
                          <div className="flex items-start">
                            <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-xs text-gray-700">
                              <strong>Under review</strong> - Usually takes 1-2 business days
                            </p>
                          </div>
                          <div className="flex items-start">
                            <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-xs text-gray-700">
                              <strong>Get verified</strong> - You'll receive an email notification
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-4">
                      <p className="text-xs text-blue-900 flex items-start">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                        <span>
                          Once approved, your property will display a <strong>verified badge</strong> and receive priority placement in search results.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                
                <OwnerActions
                  propertyId={id}
                  listing_type={property.listing_type}
                  listing_expires_at={property.listing_expires_at}
                  updated_at={property.updated_at}
                  onSuccess={fetchProperty}
                />
              </>
            )}

            {/* Property Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="pt-2">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium capitalize">{property.property_type || property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">District</span>
                    <span className="font-medium">{property.district}</span>
                  </div>
                  {property.created_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed</span>
                      <span className="font-medium">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageModal && property.images && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <button
            onClick={prevImage}
            disabled={currentImageIndex === 0}
            className="absolute left-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <div className="max-w-4xl w-full flex flex-col items-center">
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-lg"
            />
            <div className="text-white text-center mt-4 text-lg font-medium">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </div>
          
          <button
            onClick={nextImage}
            disabled={currentImageIndex === property.images.length - 1}
            className="absolute right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Owner Contact</h3>
              <button
                onClick={() => {
                  setShowContactModal(false)
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
                          className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 flex items-center"
                        >
                          Email
                        </a>
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
                          className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 flex items-center"
                        >
                          Call
                        </a>
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
              {currentUser && (
                <Link
                  href={`/contracts/new?propertyId=${id}`}
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
      
      {/* Listing Upgrade Modal */}
      {showUpgradeModal && (
        <ListingUpgradeModal
          isOpen={showUpgradeModal}
          onCloseAction={() => setShowUpgradeModal(false)}
          propertyId={id}
          currentListingType={property?.listing_type}
        />
      )}
    </div>
  )
}
