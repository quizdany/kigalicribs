export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Row']>
      }
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
    }
  }
}