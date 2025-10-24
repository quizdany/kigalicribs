'use client'

import { Search, MapPin, Filter, Heart, Star, Bed, Bath, Square, Phone, User, Menu, X, Shield, Copy, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import PaymentModal from '@/components/PaymentModal'
import PropertyBadges from '@/components/PropertyBadges'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      const res = await fetch('/api/properties?perPage=3')
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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
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
      if (json?.success) {
        setProperties(json.data || [])
      }
    } catch (err) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto pl-0 pr-4 sm:pr-6 lg:pr-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/images/kigalicribsLogo.png"
                alt="KigaliCribs Logo"
                width={200}
                height={75}
                priority
                className="h-12 w-auto object-contain"
              />
              <span className="ml-3 text-2xl tracking-tighter">
                <span className="font-bold text-gray-900">K</span>
                <span className="text-gray-600">igali</span>
                <span className="font-bold text-gray-900">C</span>
                <span className="text-gray-600">ribs</span>
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/properties" className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border border-transparent hover:border-red-100">Find a Property</Link>
              <Link href="/properties/new" className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border border-transparent hover:border-red-100">List a Property</Link>
            </div>

            {/* Auth Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <AuthButton />
              </div>
              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="p-3 space-y-2">
              <Link href="/properties" className="w-full text-left px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border border-transparent hover:border-red-100 block">Find a Property</Link>
              <Link href="/properties/new" className="w-full text-left px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border border-transparent hover:border-red-100 block">List Property</Link>
              <Link href="/auth" className="w-full text-left px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border border-transparent hover:border-red-100 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      
      <div className="relative py-16 min-h-[500px]" style={{ backgroundImage: 'url(/images/kigali-city.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hero Text */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Discover Your New Home
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Directly connect with home owners in Kigali.
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            {/* Main Search Box */}
            <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location, School, or Point of Interest"
                  className="w-full pl-12 pr-4 py-3 rounded-full focus:outline-none text-base"
                />
              </div>
              <button 
                type="submit" 
                className="bg-red-600 text-white rounded-full p-3 hover:bg-red-700 transition-colors flex-shrink-0"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Additional Filters - Show when location has text */}
            {filters.location && (
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select 
                      value={filters.propertyType}
                      onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
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
                        <span className="absolute right-10 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
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
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
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
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        </div>
      </div>

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
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
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
          <Link href="/properties" className="text-red-600 hover:text-red-700 font-medium">View All</Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No properties available yet.</p>
            <Link 
              href="/properties/new" 
              className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              List the First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link 
                key={property.id} 
                href={`/properties/${property.id}`}
                className="group cursor-pointer"
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
                    <Heart className="h-5 w-5 text-white stroke-white stroke-2 fill-transparent hover:fill-red-500 transition-colors" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
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

      {/* Why Choose TuraNeza */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why KigaliCribs?</h2>
            <p className="text-lg text-gray-600">Efficient. Reliable. Affordable</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Properties</h3>
              <p className="text-gray-600">All properties and owners are verified for your safety</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brokerage</h3>
              <p className="text-gray-600">Direct contact with property owners, no hidden fees</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round the clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left md:col-span-1">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Image
                  src="/images/kigalicribsLogo.png"
                  alt="KigaliCribs Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
                <span className="ml-3 text-xl tracking-tighter">
                  <span className="font-bold">K</span>
                  <span className="text-gray-400">igali</span>
                  <span className="font-bold">C</span>
                  <span className="text-gray-400">ribs</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Efficient. Reliable. Affordable
              </p>
              <div className="flex space-x-4 mt-4 justify-center md:justify-start">
                <a href="https://facebook.com/kigalicribs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77,7.46H14.5V5.9c0-.86.72-1.58,1.58-1.58h2.7V0H14.5C11.14,0,8.45,2.69,8.45,6.03v1.43H5.5v4.38h2.95v11.37h6V11.84h3.77L18.77,7.46z"/>
                  </svg>
                </a>
                <a href="https://x.com/kigalicribs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/kigalicribs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Career</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Kigali, Rwanda</li>
                <li>info@kigalicribs.com</li>
                <li>
                  <a 
                    href="https://wa.me/250788123456?text=Hello%20KigaliCribs%2C%20I%20need%20help%20with..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-start gap-2 text-green-400 hover:text-green-300 transition-colors font-medium"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 KigaliCribs. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
