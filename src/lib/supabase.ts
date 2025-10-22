import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// Database Types
export type User = {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'tenant' | 'landlord' | 'admin'
  verified: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Property = {
  id: string
  owner_id: string
  owner_email?: string
  owner_phone?: string
  title: string
  description: string
  price: number
  location: string
  district: string
  bedrooms: number
  bathrooms: number
  square_meters: number
  property_type: 'apartment' | 'house' | 'studio' | 'room'
  status: 'available' | 'rented' | 'maintenance'
  amenities: string[]
  images: string[]
  verified: boolean
  featured: boolean
  listing_type: 'basic' | 'verified' | 'premium_verified'
  verification_status: 'none' | 'pending' | 'verified' | 'rejected'
  verified_at?: string
  listing_expires_at?: string
  featured_until?: string
  priority_until?: string
  refresh_count: number
  photo_count: number
  created_at: string
  updated_at: string
}

export type Lease = {
  id: string
  property_id: string
  tenant_id: string
  landlord_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  status: 'draft' | 'active' | 'terminated' | 'expired'
  document_url?: string
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  lease_id: string
  tenant_id: string
  amount: number
  payment_type: 'rent' | 'deposit' | 'other'
  status: 'pending' | 'completed' | 'failed'
  payment_method: 'card' | 'mobile_money' | 'bank_transfer'
  transaction_id: string
  due_date: string
  paid_at: string | null
  created_at: string
}

export type PremiumPayment = {
  id: string
  user_id: string
  amount: number
  currency: string
  provider: 'momo' | 'airtel'
  phone_number: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  transaction_id: string
  external_reference?: string
  purpose: 'verified_listing' | 'premium_verified_listing' | 'listing_refresh' | 'listing_extension' | 'unlimited_contact_access' | 'contact_unlock'
  property_id?: string
  expires_at?: string
  metadata: Json
  created_at: string
  updated_at: string
}

export type PremiumUser = {
  id: string
  user_id: string
  subscription_type: 'unlimited_contact_access'
  starts_at: string
  expires_at?: string
  is_active: boolean
  payment_id?: string
  created_at: string
  updated_at: string
}

export type ContactUnlock = {
  id: string
  user_id: string
  property_id: string
  payment_id?: string
  unlocked_at: string
}

export type PropertyVerification = {
  id: string
  property_id: string
  landlord_id: string
  payment_id?: string
  verification_type: 'verified' | 'premium_verified'
  status: 'pending' | 'approved' | 'rejected'
  admin_id?: string
  admin_notes?: string
  requested_at: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  property_id: string
  reviewer_id: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Property, 'id'>>
      }
      leases: {
        Row: Lease
        Insert: Omit<Lease, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lease, 'id'>>
      }
      lease_payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      payments: {
        Row: PremiumPayment
        Insert: Omit<PremiumPayment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PremiumPayment, 'id'>>
      }
      premium_users: {
        Row: PremiumUser
        Insert: Omit<PremiumUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PremiumUser, 'id'>>
      }
      contact_unlocks: {
        Row: ContactUnlock
        Insert: Omit<ContactUnlock, 'id' | 'unlocked_at'>
        Update: Partial<Omit<ContactUnlock, 'id'>>
      }
      property_verifications: {
        Row: PropertyVerification
        Insert: Omit<PropertyVerification, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PropertyVerification, 'id'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'tenant' | 'landlord' | 'admin'
      property_type: 'apartment' | 'house' | 'studio' | 'room'
      property_status: 'available' | 'rented' | 'maintenance'
      lease_status: 'draft' | 'active' | 'terminated' | 'expired'
      payment_type: 'rent' | 'deposit' | 'other'
      payment_status: 'pending' | 'completed' | 'failed'
      payment_method: 'card' | 'mobile_money' | 'bank_transfer'
    }
  }
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
)

// Global auth state listener to handle expired sessions
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully')
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out, clearing session')
    }
    
    // Handle token refresh errors - if no session after refresh attempt
    if (!session && event !== 'INITIAL_SESSION' && event !== 'SIGNED_OUT') {
      console.warn('Session lost, may need to re-authenticate')
    }
  })
}