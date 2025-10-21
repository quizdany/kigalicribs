import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Property helpers
export const getProperties = async (filters?: {
  location?: string
  type?: string
  minPrice?: number
  maxPrice?: number
}) => {
  let query = supabase.from('properties').select('*')

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters?.type) {
    query = query.eq('property_type', filters.type)
  }
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  const { data, error } = await query
  return { data, error }
}

export const getFeaturedProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .eq('status', 'available')
    .limit(6)
  
  return { data, error }
}

export const getPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, reviews(*)')
    .eq('id', id)
    .single()
  
  return { data, error }
}

// Lease helpers
export const createLease = async (leaseData: any) => {
  const { data, error } = await supabase
    .from('leases')
    .insert(leaseData)
    .select()
    .single()
  
  return { data, error }
}

// Payment helpers
export const createPayment = async (paymentData: any) => {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()
  
  return { data, error }
}

// Review helpers
export const createReview = async (reviewData: any) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single()
  
  return { data, error }
}