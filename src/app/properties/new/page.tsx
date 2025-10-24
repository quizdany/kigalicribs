"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthButton from '@/components/AuthButton'
import { Camera, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewProperty() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
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
  const [images, setImages] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      if (!session) {
        setError('You must be logged in to list a property')
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setIsAuthenticated(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmenities(prev => 
      e.target.checked 
        ? [...prev, value]
        : prev.filter(item => item !== value)
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (files.length + images.length > 10) {
        setError('Maximum 10 images allowed')
        return
      }
      setImages(prev => [...prev, ...files])
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreview(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setPreview(prev => prev.filter((_, i) => i !== index))
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('You must be logged in to list a property')
      }

      // Upload images to Supabase Storage
      let imageUrls: string[] = []
      if (images.length > 0) {
        const uploadPromises = images.map(async (image, index) => {
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

        imageUrls = await Promise.all(uploadPromises)
      }

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          price: Number(form.price),
          bedrooms: Number(form.bedrooms) || null,
          bathrooms: Number(form.bathrooms) || null,
          size: Number(form.size) || null,
          address: form.address,
          district: form.district,
          sector: form.sector || null,
          cell: form.cell || null,
          amenities,
          images: imageUrls,
          ownerPhone: form.ownerPhone,
        }),
      })

      const json = await res.json()
      if (!json?.success) throw new Error(json?.error || 'Failed to create property')
      
      // Redirect to the new property page with upgrade prompt
      const propertyId = json.data?.id
      if (propertyId) {
        router.push(`/properties/${propertyId}?showUpgrade=true`)
      } else {
        router.push('/properties')
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred')
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

      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isCheckingAuth ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-red-600" />
          </div>
        ) : !isAuthenticated ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to list a property.</p>
            <Link 
              href="/auth" 
              className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Login to Continue
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Property</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-8">
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
                placeholder="e.g., Modern 2BHK Apartment in Kigali Heights"
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
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe your property..."
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select sector</option>
                <option value="Kacyiru">Kacyiru</option>
                <option value="Kimironko">Kimironko</option>
                <option value="Remera">Remera</option>
                <option value="Gisozi">Gisozi</option>
                <option value="Gaculiro">Gaculiro</option>
                <option value="Kinyinya">Kinyinya</option>
                <option value="Ndera">Ndera</option>
                <option value="Nduba">Nduba</option>
                <option value="Rusororo">Rusororo</option>
                <option value="Rutunga">Rutunga</option>
                <option value="Gikondo">Gikondo</option>
                <option value="Niboye">Niboye</option>
                <option value="Kagarama">Kagarama</option>
                <option value="Kanombe">Kanombe</option>
                <option value="Kicukiro">Kicukiro</option>
                <option value="Gatenga">Gatenga</option>
                <option value="Nyarugunga">Nyarugunga</option>
                <option value="Kimihurura">Kimihurura</option>
                <option value="Muhima">Muhima</option>
                <option value="Nyarugenge">Nyarugenge</option>
                <option value="Kigali">Kigali</option>
                <option value="Nyamirambo">Nyamirambo</option>
                <option value="Nyakabanda">Nyakabanda</option>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select cell</option>
                <option value="Kibagabaga">Kibagabaga</option>
                <option value="Kagugu">Kagugu</option>
                <option value="Rugando">Rugando</option>
                <option value="Kamatamu">Kamatamu</option>
                <option value="Nyagatovu">Nyagatovu</option>
                <option value="Rebero">Rebero</option>
                <option value="Nyabisindu">Nyabisindu</option>
                <option value="Kabeza">Kabeza</option>
                <option value="Kagarama">Kagarama</option>
                <option value="Gahanga">Gahanga</option>
                <option value="Kigarama">Kigarama</option>
                <option value="Kanserege">Kanserege</option>
                <option value="Gikondo">Gikondo</option>
                <option value="Biryogo">Biryogo</option>
                <option value="Gitega">Gitega</option>
                <option value="Kiyovu">Kiyovu</option>
                <option value="Nyakabanda">Nyakabanda</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <p className="text-sm text-gray-600">Provide your contact details so interested renters can reach you.</p>
            
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
              <p className="mt-1 text-xs text-gray-500">Your email will be automatically included from your account</p>
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
                'Swimming Pool',
                'Tarmac Road'
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
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Images (Max 10)
              </label>
              
              <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer rounded-md font-medium text-red-600 hover:text-red-500">
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>

              {/* Image previews */}
              {preview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {preview.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification Suggestion Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎯 Recommended: Get Your Property Verified!
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Verified listings get <strong>3x more views</strong> and build trust with potential renters. Choose verification now or upgrade later.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Basic (Free)</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✓ Standard listing</li>
                      <li>✓ Basic visibility</li>
                    </ul>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-400">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Verified (30,000 RWF)</p>
                    <ul className="text-xs text-blue-900 space-y-1">
                      <li>✓ Verified badge</li>
                      <li>✓ 3x more visibility</li>
                      <li>✓ Priority display</li>
                      <li>✓ Valid for 6 months</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons - Side by Side */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Continue with Free Listing</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={async (e) => {
                // First submit the form to create the property
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                Object.defineProperty(submitEvent, 'target', { value: e.currentTarget.form, writable: false })
                await handleSubmit(submitEvent as any)
                // Note: After property is created, user will be redirected with showUpgrade=true
                // which will automatically show the payment modal
              }}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>List with Verification (30,000 RWF)</span>
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  )
}
