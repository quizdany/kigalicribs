'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestContactUnlockPage() {
  const [user, setUser] = useState<any>(null)
  const [unlockStatus, setUnlockStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      await fetchUnlockStatus()
    }
    setLoading(false)
  }

  const fetchUnlockStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('No session found')
        return
      }

      const response = await fetch('/api/users/contact-unlock-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setUnlockStatus(data.data)
      } else {
        setError(data.error || 'Failed to fetch unlock status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Test Contact Unlock API</h1>
          <p className="text-red-600 mb-4">You need to be logged in to test this feature.</p>
          <a 
            href="/auth" 
            className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contact Unlock Status Test</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Current User</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Unlock Status */}
        {unlockStatus && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Contact Unlock Status</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Used Free Unlocks</p>
                <p className="text-3xl font-bold text-blue-600">
                  {unlockStatus.usedFreeUnlocks}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Remaining Free</p>
                <p className="text-3xl font-bold text-green-600">
                  {unlockStatus.remainingFreeUnlocks}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Free Unlock Limit:</span>
                <span className="font-semibold">{unlockStatus.freeUnlocksLimit}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Has Unlimited Access:</span>
                <span className={`font-semibold ${unlockStatus.hasUnlimitedAccess ? 'text-green-600' : 'text-gray-400'}`}>
                  {unlockStatus.hasUnlimitedAccess ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Can Unlock Properties:</span>
                <span className={`font-semibold ${unlockStatus.canUnlock ? 'text-green-600' : 'text-red-600'}`}>
                  {unlockStatus.canUnlock ? '✓ Yes' : '✗ No (Payment Required)'}
                </span>
              </div>
              
              {!unlockStatus.hasUnlimitedAccess && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Unlimited Access Price:</span>
                  <span className="font-semibold">{unlockStatus.unlimitedAccessPrice.toLocaleString()} RWF</span>
                </div>
              )}
            </div>

            {!unlockStatus.canUnlock && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ You've used all {unlockStatus.freeUnlocksLimit} free unlocks. 
                  Purchase unlimited access for {unlockStatus.unlimitedAccessPrice.toLocaleString()} RWF to continue.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={fetchUnlockStatus}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Refresh Status
          </button>
          
          <a
            href="/properties"
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            View Properties
          </a>
        </div>

        {/* API Response */}
        {unlockStatus && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Raw API Response:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(unlockStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
