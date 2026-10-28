'use client'

import { Search, MapPin, Heart, Star, X, Copy, ChevronDown, BadgeCheck } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import KigaliSlideshow from '@/components/KigaliSlideshow'
import PaymentModal from '@/components/PaymentModal'
import PropertyBadges from '@/components/PropertyBadges'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [listingError, setListingError] = useState<string | null>(null)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentPurpose, setPaymentPurpose] = useState<'unlimited_contact_access'>('unlimited_contact_access')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactInfo, setContactInfo] = useState<any | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [showAmenitiesDropdown, setShowAmenitiesDropdown] = useState(false)
  const amenitiesRef = useRef<HTMLDivElement | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  // Search filters state
  type FiltersState = {
    location: string
    propertyType: string
    budget: string
    amenities: string[]
    bedrooms: string
    bathrooms: string
  }
  const [filters, setFilters] = useState<FiltersState>({
    location: '',
    propertyType: 'all',
    budget: 'any',
    amenities: [],
    bedrooms: '',
    bathrooms: ''
  })
  useEffect(() => {
    fetchFeaturedProperties()
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

  // Close amenities dropdown on outside click
  // Close amenities dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (amenitiesRef.current && !amenitiesRef.current.contains(e.target as Node)) {
        setShowAmenitiesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      setListingError(null)
      const res = await fetch('/api/properties?perPage=3')
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error('Unable to load listings')
      if (json?.success) {
        setProperties(json.data || [])
      }
    } catch (err) {
      setListingError('We could not load the homes. Please try again.')
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setListingError(null)
    setLoading(true)
    
    try {
      const params = new URLSearchParams()
      
      if (filters.location) params.append('location', filters.location)
      if (filters.propertyType !== 'all') params.append('propertyType', filters.propertyType)
      
      // Budget ranges
      if (filters.budget !== 'any') {
        const budgetMap: Record<string, { min?: number; max?: number }> = {
          'under-50k': { max: 50000 },
          '50k-100k': { min: 50000, max: 100000 },
          '100k-200k': { min: 100000, max: 200000 },
          '200k-500k': { min: 200000, max: 500000 },
          'above-500k': { min: 500000 },
        }
        
        const range = budgetMap[filters.budget]
        if (range) {
          if (range.min) params.append('minPrice', range.min.toString())
          if (range.max) params.append('maxPrice', range.max.toString())
        }
      }
      
      if (filters.amenities.length > 0) {
        params.append('amenities', filters.amenities.join(','))
      }
      // Bedrooms/Bathrooms filters
      if (filters.bedrooms) {
        if (filters.bedrooms === '5+') params.append('minBedrooms', '5')
        else params.append('bedrooms', filters.bedrooms)
      }
      if (filters.bathrooms) {
        if (filters.bathrooms === '5+') params.append('minBathrooms', '5')
        else params.append('bathrooms', filters.bathrooms)
      }
      
      params.append('perPage', '20')
      
      const res = await fetch(`/api/properties?${params.toString()}`)
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error('Unable to load listings')
      if (json?.success) {
        setProperties(json.data || [])
      }
    } catch (err) {
      setListingError('Your search could not be completed. Please try again.')
      console.error('Error searching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const openContact = async (propertyId: string) => {
    try {
      setSelectedPropertyId(propertyId)
      setShowContactModal(true)
      setContactLoading(true)
      setContactError(null)
      setContactInfo(null)
      
      // Get auth token
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      const res = await fetch(`/api/properties/${propertyId}/contact-premium`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const json = await res.json()
      
      // Handle payment required
      if (res.status === 402) {
        setShowContactModal(false)
        setPaymentPurpose('unlimited_contact_access')
        setShowPaymentModal(true)
        return
      }
      
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
    <div className="min-h-[60vh] bg-gray-50">

      
      <KigaliSlideshow>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <BadgeCheck className="h-4 w-4" /> KIGALI, RWANDA · DIRECT FROM OWNERS
          </div>
          {/* Hero Text */}
          <h1 className="hero-title font-bold text-white mb-5">
            Find your place<br /> in Kigali.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Browse trusted rental listings and connect directly with property owners across Kigali.
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-3xl" role="search">
            {/* Main Search Box */}
            <div className="bg-white rounded-2xl sm:rounded-full shadow-2xl p-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Try Kimironko, Kacyiru, or Remera"
                  aria-label="Search by location or point of interest"
                  className="w-full pl-12 pr-4 py-3 rounded-full focus:outline-none text-base"
                />
              </div>
              <button 
                type="submit" 
                className="bg-emerald-600 text-white rounded-full p-3 hover:bg-emerald-700 transition-colors flex-shrink-0"
                aria-label="Search properties"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Additional Filters - Show when location has text */}
            {filters.location && (
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select 
                      value={filters.propertyType}
                      onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                      <option value="room">Room</option>
                    </select>
                  </div>
                  
                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget
                    </label>
                    <select 
                      value={filters.budget}
                      onChange={(e) => setFilters(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="any">Any Budget</option>
                      <option value="under-50k">Under 50K</option>
                      <option value="50k-100k">50K - 100K</option>
                      <option value="100k-200k">100K - 200K</option>
                      <option value="200k-500k">200K - 500K</option>
                      <option value="above-500k">Above 500K</option>
                    </select>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <select 
                      value={filters.bedrooms}
                      onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <select 
                      value={filters.bathrooms}
                      onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="">Any</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>

                  {/* Amenities Dropdown */}
                  <div className="relative" ref={amenitiesRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAmenitiesDropdown(prev => !prev)}
                      className="relative w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                      aria-expanded={showAmenitiesDropdown}
                      aria-haspopup="true"
                    >
                      <span className="pointer-events-none">All</span>
                      {filters.amenities.length > 0 && (
                        <span className="absolute right-10 px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                          {filters.amenities.length}
                        </span>
                      )}
                      <ChevronDown className={`absolute right-4 h-4 w-4 transition-transform ${showAmenitiesDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showAmenitiesDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20 text-left">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            'furnished',
                            'parking',
                            'security',
                            'internet',
                            'water tank',
                            'generator',
                            'garden',
                            'balcony',
                            'swimming pool'
                          ].map((amenity) => (
                            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity)}
                                onChange={() => toggleAmenity(amenity)}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700 capitalize">{amenity}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setFilters(prev => ({ ...prev, amenities: [] }))}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAmenitiesDropdown(false); handleSearch(); }}
                            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
            <Link href="/properties" className="rounded-full bg-white px-5 py-2.5 text-gray-900 transition hover:bg-gray-100">Browse all homes</Link>
            <Link href="/properties/new" className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-white backdrop-blur transition hover:bg-white/20">List your property</Link>
          </div>
          </div>
        </div>
      </KigaliSlideshow>

      {/* More Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">More Filters</h3>
                <button 
                  onClick={() => setShowFiltersModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    'furnished',
                    'parking',
                    'security',
                    'internet',
                    'water tank',
                    'generator',
                    'garden',
                    'balcony',
                    'swimming pool'
                  ].map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, amenities: [] }))
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setShowFiltersModal(false)
                    handleSearch()
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Properties */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filters.location || filters.propertyType !== 'all' || filters.budget !== 'any' || filters.amenities.length > 0
                ? 'Search Results'
                : 'Featured Properties in Kigali'}
            </h2>
            {(filters.location || filters.propertyType !== 'all' || filters.budget !== 'any' || filters.amenities.length > 0) && (
              <p className="text-sm text-gray-600 mt-1">{properties.length} properties found</p>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : listingError ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center" role="alert"><p>{listingError}</p><button type="button" className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 text-white" onClick={() => handleSearch()}>Try again</button></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No properties available yet.</p>
            <Link 
              href="/properties/new" 
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              List the First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link 
                key={property.id} 
                href={`/properties/${property.id}`}
                className="property-card group cursor-pointer"
              >
                <div className="relative mb-3">
                  {/* Image with rounded corners */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Heart icon - top right */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
                  >
                    <Heart className="h-5 w-5 text-white stroke-white stroke-2 fill-transparent hover:fill-emerald-500 transition-colors" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                  </button>
                </div>

                {/* Property details */}
                <div className="space-y-1">
                  {/* Verification Badges */}
                  <PropertyBadges 
                    listing_type={property.listing_type}
                    verification_status={property.verification_status}
                    isOwner={currentUserId === property.owner_id}
                  />
                  
                  {/* Title and rating */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:underline">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="h-3.5 w-3.5 text-gray-900 fill-current" />
                      <span className="text-sm text-gray-900 font-medium">
                        {property.rating || '5.0'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {property.district}, Kigali
                  </p>
                  
                  {/* Price */}
                  <div className="pt-1">
                    <span className="font-semibold text-gray-900">
                      {Number(property.price).toLocaleString()} RWF
                    </span>
                    <span className="text-gray-600 text-sm"> / month</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
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
                <p className="text-rose-600 text-sm">{contactError}</p>
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
                          className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
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
                          className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
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
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct-rental value proposition */}
      <section aria-label="Why rent through TuraKGL" className="bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-xl border border-emerald-100 bg-emerald-50/70 px-6 py-7 text-center shadow-sm sm:px-10">
            <p className="text-lg italic leading-relaxed text-gray-700 sm:text-xl">
              Your rent should go toward your home—not a broker’s commission. Explore Kigali rentals and connect directly with property owners to make finding your next place simpler and more affordable.
            </p>
          </div>
        </div>
      </section>



      {/* Payment Modal */}
      {selectedPropertyId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          purpose={paymentPurpose}
          onSuccess={() => {
            setShowPaymentModal(false)
            // Retry fetching contact info after payment
            if (selectedPropertyId) {
              openContact(selectedPropertyId)
            }
          }}
        />
      )}
    </div>
  )
}
