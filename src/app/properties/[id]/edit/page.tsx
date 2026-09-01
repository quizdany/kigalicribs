"use client"

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Camera, Loader2, ArrowLeft, X, ShieldCheck } from 'lucide-react'
import ListingUpgradeModal from '@/components/PremiumModal'

// Kigali administrative divisions data
const KIGALI_DIVISIONS = {
  Gasabo: {
    sectors: {
      Bumbogo: ['Bukoro', 'Bumbogo', 'Gikoro', 'Gisozi', 'Jabana', 'Kinyange', 'Murambi', 'Rutunga'],
      Gatsata: ['Gasabo', 'Karuruma', 'Murambi', 'Remera', 'Rusororo'],
      Gikomero: ['Birembo', 'Gihira', 'Gikomero', 'Murama', 'Nyagahinga', 'Nyarutovu'],
      Gisozi: ['Akabahizi', 'Kamatamu', 'Kagugu', 'Nyagatovu', 'Rubungo'],
      Jabana: ['Gashora', 'Jabana', 'Kinyange', 'Nyagahinga'],
      Jali: ['Busanza', 'Gasiza', 'Gishali', 'Jali', 'Kinyana', 'Kiyovu', 'Nyamabuye'],
      Kacyiru: ['Kamatamu', 'Kamutwa', 'Kibagabaga', 'Nyarutarama'],
      Kimihurura: ['Kibaza', 'Kimihurura', 'Ryomboka'],
      Kimironko: ['Bibare', 'Kibagabaga', 'Kimironko', 'Nyabisindu', 'Nyarutarama'],
      Kinyinya: ['Gacurabwenge', 'Kagugu', 'Kinyinya', 'Masoro', 'Musezero'],
      Ndera: ['Kabuga', 'Kinyange', 'Muhazi', 'Muyumbu', 'Nduba'],
      Nduba: ['Gasagara', 'Kageyo', 'Karuruma', 'Muyange', 'Nduba'],
      Remera: ['Gisagara', 'Karuruma', 'Nyabisindu', 'Nyagahinga', 'Rukiri'],
      Rusororo: ['Gasagara', 'Muyange', 'Nganzo', 'Nyagasambu', 'Rusororo'],
      Rutunga: ['Gashikiri', 'Kajevuba', 'Kibaya', 'Nyamabuye', 'Rutunga']
    }
  },
  Kicukiro: {
    sectors: {
      Gahanga: ['Gahanga', 'Karembure', 'Kinyange', 'Muremure', 'Shyembe'],
      Gatenga: ['Gatenga', 'Karama', 'Kibaza', 'Nyanza', 'Rebero'],
      Gikondo: ['Gikondo', 'Kabeza', 'Mamba', 'Nyanza', 'Nyarurama'],
      Kagarama: ['Busanza', 'Gahanga', 'Kagarama', 'Karembure', 'Nyanza'],
      Kanombe: ['Busanza', 'Busoro', 'Gahama', 'Kabeza', 'Kanombe', 'Nyarurama'],
      Kigarama: ['Buhoro', 'Gitega', 'Kigarama', 'Nyagasambu', 'Nyanza'],
      Masaka: ['Gahanga', 'Kabeza', 'Kimisange', 'Masaka', 'Nyarurama'],
      Niboye: ['Kibenga', 'Muyange', 'Niboye', 'Nyanza', 'Rebero'],
      Nyarugunga: ['Kabeza', 'Kagarama', 'Murama', 'Nyarugunga', 'Rurembo']
    }
  },
  Nyarugenge: {
    sectors: {
      Gitega: ['Cyahafi', 'Gasharu', 'Gitega', 'Kanyinya', 'Rubungo'],
      Kanyinya: ['Bibare', 'Gikondo', 'Kanyinya', 'Mburabuturo', 'Ruramba'],
      Kigali: ['Biryogo', 'Gitega', 'Kiyovu', 'Nyabugogo', 'Nyarugenge', 'Rwampara'],
      Kimisagara: ['Biryogo', 'Cyahafi', 'Gitega', 'Kamuhoza', 'Kimisagara'],
      Mageragere: ['Cyahafi', 'Gasabo', 'Kabuye', 'Mageragere', 'Nyamirambo'],
      Muhima: ['Amahoro', 'Gasharu', 'Gitega', 'Muhima', 'Rugenge'],
      Nyakabanda: ['Cyivugiza', 'Gikondo', 'Kabeza', 'Kadahokwa', 'Nyakabanda'],
      Nyamirambo: ['Biryogo', 'Cyahafi', 'Kamuhoza', 'Muhima', 'Nyamirambo', 'Rwezamenyo'],
      Nyarugenge: ['Cyahafi', 'Cyivugiza', 'Nyarugenge', 'Rwampara', 'Ubumwe'],
      Rwezamenyo: ['Cyahafi', 'Gasharu', 'Nyamirambo', 'Rwezamenyo', 'Ubumwe']
    }
  }
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    address: '',
    district: '',
    sector: '',
    cell: '',
    ownerPhone: '',
  })
  const [amenities, setAmenities] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  // Get available sectors based on selected district
  const getAvailableSectors = () => {
    if (!form.district) return []
    return Object.keys(KIGALI_DIVISIONS[form.district as keyof typeof KIGALI_DIVISIONS]?.sectors || {})
  }

  // Get available cells based on selected district and sector
  const getAvailableCells = () => {
    if (!form.district || !form.sector) return []
    const district = KIGALI_DIVISIONS[form.district as keyof typeof KIGALI_DIVISIONS]
    return district?.sectors[form.sector as keyof typeof district.sectors] || []
  }

  useEffect(() => {
    fetchProperty()
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('You must be logged in to edit properties')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/properties/${id}`)
      const json = await res.json()
      
      if (!json?.success) {
        throw new Error(json?.error || 'Failed to load property')
      }
      
      const prop = json.data

      // Check if user is the owner
      if (prop.owner_id !== session.user.id) {
        setError('You do not have permission to edit this property')
        setIsOwner(false)
        setLoading(false)
        return
      }

      setIsOwner(true)
      setProperty(prop)
      
      // Populate form
      setForm({
        title: prop.title || '',
        description: prop.description || '',
        type: prop.property_type || prop.type || '',
        price: prop.price?.toString() || '',
        bedrooms: prop.bedrooms?.toString() || '',
        bathrooms: prop.bathrooms?.toString() || '',
        size: prop.size?.toString() || '',
        address: prop.address || '',
        district: prop.district || '',
        sector: prop.sector || '',
        cell: prop.cell || '',
        ownerPhone: prop.owner_phone || '',
      })
      
      setAmenities(prop.amenities || [])
      setExistingImages(prop.images || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Reset dependent fields when district or sector changes
    if (name === 'district') {
      setForm(prev => ({ ...prev, [name]: value, sector: '', cell: '' }))
    } else if (name === 'sector') {
      setForm(prev => ({ ...prev, [name]: value, cell: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmenities(prev => 
      e.target.checked 
        ? [...prev, value]
        : prev.filter(item => item !== value)
    )
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const totalImages = existingImages.length + newImages.length + files.length
      
      if (totalImages > 10) {
        setError('Maximum 10 images allowed')
        return
      }
      
      setNewImages(prev => [...prev, ...files])
      
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file))
      setNewImagePreviews(prev => [...prev, ...previews])
    }
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to edit properties')
      }

      // Upload new images to Supabase Storage
      let newImageUrls: string[] = []
      if (newImages.length > 0) {
        const uploadPromises = newImages.map(async (image, index) => {
          const fileExt = image.name.split('.').pop()
          const fileName = `${session.user.id}-${Date.now()}-${index}.${fileExt}`
          const filePath = `properties/${fileName}`

          const { data, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, image)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw uploadError
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath)

          return publicUrl
        })

        newImageUrls = await Promise.all(uploadPromises)
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls]

      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          property_type: form.type,
          price: Number(form.price),
          bedrooms: Number(form.bedrooms) || null,
          bathrooms: Number(form.bathrooms) || null,
          size: Number(form.size) || null,
          address: form.address,
          district: form.district,
          sector: form.sector || null,
          cell: form.cell || null,
          amenities,
          images: allImages,
          owner_phone: form.ownerPhone,
        }),
      })

      const json = await res.json()
      if (!json?.success) throw new Error(json?.error || 'Failed to update property')
      
      // Redirect to property detail page
      router.push(`/properties/${id}`)
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    )
  }

  if (error && !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/properties" className="text-red-600 hover:text-red-700">
            Back to properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href={`/properties/${id}`} className="flex items-center text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to property
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Property</h1>
        
        {/* Upgrade Banner for Basic Listings */}
        {property?.listing_type === 'basic' && property?.verification_status !== 'pending' && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Your Property Verified
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upgrade to a verified or premium listing to stand out and attract more tenants. Verified properties get a trust badge and appear higher in search results.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-sm text-sm"
                >
                  Upgrade Now - From 30,000 RWF
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Verification Notice */}
        {property?.verification_status === 'pending' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Verification Pending</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Your verification request is under review. You'll be notified once it's approved.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-sm rounded-lg p-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Property Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Modern 2BR Apartment in Kimihurura"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe your property in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type*
                </label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent (RWF)*
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., 75000"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={form.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                  Size (sqft)
                </label>
                <input
                  type="number"
                  id="size"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Location</h2>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District*
              </label>
              <select
                id="district"
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select district</option>
                <option value="Gasabo">Gasabo</option>
                <option value="Kicukiro">Kicukiro</option>
                <option value="Nyarugenge">Nyarugenge</option>
              </select>
            </div>

            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                value={form.sector}
                onChange={handleChange}
                disabled={!form.district}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{form.district ? 'Select sector' : 'Select district first'}</option>
                {getAvailableSectors().map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cell" className="block text-sm font-medium text-gray-700 mb-1">
                Cell
              </label>
              <select
                id="cell"
                name="cell"
                value={form.cell}
                onChange={handleChange}
                disabled={!form.sector}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{form.sector ? 'Select cell' : 'Select sector first'}</option>
                {getAvailableCells().map(cell => (
                  <option key={cell} value={cell}>{cell}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            
            <div>
              <label htmlFor="ownerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                id="ownerPhone"
                name="ownerPhone"
                value={form.ownerPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="+250 788 123 456"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                'Furnished',
                'Parking',
                'Security',
                'Internet',
                'Water Tank',
                'Generator',
                'Garden',
                'Balcony',
                'Swimming Pool'
              ].map((amenity) => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={amenity.toLowerCase()}
                    name="amenities"
                    value={amenity.toLowerCase()}
                    checked={amenities.includes(amenity.toLowerCase())}
                    onChange={handleAmenityChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor={amenity.toLowerCase()} className="ml-2 text-sm text-gray-700">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Property Images</h2>
            <p className="text-sm text-gray-600">Upload up to 10 images. First image will be the main display.</p>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images ({existingImages.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={img}
                        alt={`Property ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">New Images to Upload ({newImagePreviews.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {newImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`New ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {(existingImages.length + newImages.length) < 10 && (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to add images</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {existingImages.length + newImages.length} / 10 images
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleNewImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link
              href={`/properties/${id}`}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
      
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
