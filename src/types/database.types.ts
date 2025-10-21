export type User = {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'tenant' | 'landlord' | 'admin'
  verified: boolean
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
  document_url: string
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