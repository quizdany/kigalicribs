'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ShieldCheck, Clock, CheckCircle, XCircle, Loader2, Eye, Image as ImageIcon } from 'lucide-react'

interface Verification {
  id: string
  property_id: string
  landlord_id: string
  payment_id: string
  verification_type: 'verified' | 'premium_verified'
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at?: string
  admin_id?: string
  admin_notes?: string
  properties: {
    id: string
    title: string
    description: string
    location: string
    district: string
    price: number
    property_type: string
    images: string[]
    photo_count?: number
  }
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchVerifications()
    }
  }, [statusFilter, isAdmin])

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('No session found, redirecting to auth')
        router.push('/auth')
        return
      }

      console.log('Checking admin access for user:', session.user.id, session.user.email)

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      console.log('User data query result:', { userData, userError })

      if (userError) {
        console.error('Error fetching user role:', userError)
        setError(`Database error: ${userError.message}`)
        setLoading(false)
        return
      }

      if (!userData) {
        console.error('User not found in users table')
        setError('User profile not found. Please contact support.')
        setLoading(false)
        return
      }

      console.log('User role:', userData.role)

      if (userData?.role !== 'admin') {
        console.error('User is not admin. Role:', userData?.role)
        setError(`Admin access required. Your role: ${userData?.role || 'none'}`)
        setLoading(false)
        return
      }

      console.log('Admin access granted')
      setIsAdmin(true)
    } catch (err) {
      console.error('Admin check error:', err)
      setError(`Access denied: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      console.log(`Fetching ${statusFilter} verifications...`)

      const response = await fetch(`/api/admin/verifications?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      console.log('API response status:', response.status)

      const json = await response.json()
      console.log('API response data:', json)

      if (json.success) {
        console.log(`Found ${json.data?.length || 0} verifications`)
        setVerifications(json.data || [])
      } else {
        console.error('API error:', json.error)
        setError(json.error || 'Failed to load verifications')
      }
    } catch (err: any) {
      console.error('Fetch verifications error:', err)
      setError(err.message || 'Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      setReviewLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/admin/verifications/${verificationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action,
          notes: reviewNotes || undefined
        })
      })

      const json = await response.json()
      if (json.success) {
        alert(`Verification ${action}d successfully!`)
        setSelectedVerification(null)
        setReviewNotes('')
        fetchVerifications()
      } else {
        alert(`Failed to ${action} verification: ${json.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setReviewLoading(false)
    }
  }

  if (!isAdmin && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-red-600 hover:text-red-700">
            Go to homepage
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <ShieldCheck className="h-6 w-6 text-red-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Admin - Property Verifications</h1>
            </div>
            <Link
              href="/properties"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              statusFilter === 'pending'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="inline h-4 w-4 mr-1" />
            Pending ({verifications.filter(v => v.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              statusFilter === 'approved'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="inline h-4 w-4 mr-1" />
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              statusFilter === 'rejected'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <XCircle className="inline h-4 w-4 mr-1" />
            Rejected
          </button>
        </div>

        {/* Verifications List */}
        {verifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No {statusFilter} verifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div key={verification.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Property Image */}
                  <div>
                    {verification.properties.images && verification.properties.images.length > 0 ? (
                      <img
                        src={verification.properties.images[0]}
                        alt={verification.properties.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {verification.properties.photo_count || verification.properties.images?.length || 0} photos
                    </p>
                  </div>

                  {/* Property Details */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {verification.properties.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {verification.properties.location}, {verification.properties.district}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        verification.verification_type === 'premium_verified'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {verification.verification_type === 'premium_verified' ? 'Premium Verified' : 'Verified'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {verification.properties.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold ml-2">
                          {verification.properties.price.toLocaleString()} RWF/month
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold ml-2 capitalize">
                          {verification.properties.property_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Requested:</span>
                        <span className="font-semibold ml-2">
                          {new Date(verification.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      {verification.reviewed_at && (
                        <div>
                          <span className="text-gray-600">Reviewed:</span>
                          <span className="font-semibold ml-2">
                            {new Date(verification.reviewed_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {verification.admin_notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                        <strong className="text-gray-700">Admin Notes:</strong>
                        <p className="text-gray-600 mt-1">{verification.admin_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/properties/${verification.property_id}`}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Property
                      </Link>

                      {statusFilter === 'pending' && (
                        <>
                          <button
                            onClick={() => setSelectedVerification(verification)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVerification(verification)
                              setTimeout(() => handleReview(verification.id, 'reject'), 100)
                            }}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Approve Verification
            </h3>
            <p className="text-gray-700 mb-4">
              You are about to approve verification for:
              <br />
              <strong>{selectedVerification.properties.title}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Add any notes about this verification..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedVerification(null)
                  setReviewNotes('')
                }}
                disabled={reviewLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedVerification.id, 'approve')}
                disabled={reviewLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {reviewLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
