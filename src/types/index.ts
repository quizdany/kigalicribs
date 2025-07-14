export interface Review {
  id: string;
  propertyId: string;
  tenantName: string; // Or userId in a real app
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date string
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string; // e.g., "RWF", "USD"
  location: string; // General location, e.g., "Kigali, Kiyovu"
  address: string; // Specific address
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq meters
  amenities: string[];
  photos: string[]; // URLs of photos
  propertyType?: string; // camelCase for legacy/mock
  property_type?: string; // snake_case for Supabase
  listedDate?: string;
  agent?: { // Can be agent or owner info
    name: string;
    phone: string;
    email: string;
  };
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  agent_name?: string;
  agent_email?: string;
  agent_phone?: string;
  aiData?: any;
  features?: string;
  features_for_ai?: string;
  marketTrends?: string;
  market_trends_for_ai?: string;
  reviews?: any[];
  averageRating?: number;
  landlord_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TenantProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  preferredLocations: string[];
  propertyPreferences: {
    types: Property['propertyType'][];
    minBedrooms: number;
    minBathrooms: number;
    amenities: string[];
    additionalNotes?: string; // For AI tenant preferences string
  };
}

// Corresponds to the Zod schema in PropertyForm.tsx
export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  currency: typeof currenciesList[number];
  location: typeof kigaliLocationsList[number];
  address: string;
  propertyType: typeof propertyTypesList[number];
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities?: string[];
  photos?: string[]; 
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  otherImportantDetails?: string;
}

export const amenityList = [
  "WiFi", "Parking", "Swimming Pool", "Gym", "Security System", "Balcony/Patio", "Garden/Yard", 
  "Furnished", "Air Conditioning", "Washing Machine", "Kitchen Appliances", "Elevator", 
  "Pet Friendly", "City View", "Water Heater", "Backup Generator", "Near Bus Station", "Tarmac Road Access"
];

export const propertyTypes: Property['propertyType'][] = ["Apartment", "House", "Office", "Retail", "Villa", "Commercial"];

export const kigaliLocations = [
  "Kiyovu", "Kimihurura", "Nyarutarama", "Kibagabaga", "Gacuriro", "Remera", "Kicukiro", "Kanombe", "Gisozi", "Nyamirambo"
];

export const currencies = ["RWF", "USD"];

export const SELECT_ANY_VALUE = "%%ANY%%";

export type Language = {
  code: 'en' | 'fr' | 'rw'; // Standardized language codes
  name: string;
};

export const propertyTypesList = ["Apartment", "House", "Office", "Retail", "Villa", "Commercial"] as const;
export const currenciesList = ["RWF", "USD"] as const;
export const kigaliLocationsList = [
  "Kiyovu", "Kimihurura", "Nyarutarama", "Kibagabaga", "Gacuriro", "Remera", "Kicukiro", "Kanombe", "Gisozi", "Nyamirambo"
] as const;
