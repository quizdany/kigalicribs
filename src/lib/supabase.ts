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
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id'>>
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
    },
  }
)