
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
  propertyType: 'Apartment' | 'House' | 'Office' | 'Retail' | 'Villa' | 'Commercial';
  listedDate: string; // ISO date string
  agent?: {
    name: string;
    phone: string;
    email: string;
  };
  aiData?: {
    fairPrice?: {
      suggestedPrice: number;
      priceJustification: string;
    };
    matchScore?: { // Assuming tenant context is available when this is populated
      score: number; // 0-100
      reasoning: string;
    };
  };
  features?: string; // Combined string of features for AI
  marketTrends?: string; // Info for AI
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

export const amenityList = [
  "WiFi", "Parking", "Swimming Pool", "Gym", "Security System", "Balcony/Patio", "Garden/Yard", 
  "Furnished", "Air Conditioning", "Washing Machine", "Kitchen Appliances", "Elevator", 
  "Pet Friendly", "City View", "Water Heater", "Backup Generator"
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
