export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          role: 'tenant' | 'landlord' | 'admin'
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      properties: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Row']>
      }
      payments: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Row']>
      }
      premium_users: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['premium_users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['premium_users']['Row']>
      }
      contact_unlocks: {
        Row: {
          id: string
          user_id: string
          property_id: string
          payment_id?: string
          unlocked_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_unlocks']['Row'], 'id' | 'unlocked_at'>
        Update: Partial<Database['public']['Tables']['contact_unlocks']['Row']>
      }
      property_verifications: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['property_verifications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['property_verifications']['Row']>
      }
      leases: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          landlord_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          security_deposit: number
          status: 'draft' | 'active' | 'terminated' | 'expired'
          document_url: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leases']['Row']>
      }
      lease_payments: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['lease_payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lease_payments']['Row']>
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          reviewer_id: string
          rating: number
          comment: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Row']>
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