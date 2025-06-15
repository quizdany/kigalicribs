import type { Property, TenantProfile } from '@/types';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Kiyovu',
    description: 'A stunning 2-bedroom apartment with breathtaking city views, located in the heart of Kiyovu. Fully furnished and equipped with modern amenities.',
    price: 1200,
    currency: 'USD',
    location: 'Kigali, Kiyovu',
    address: 'KN 3 Ave, Kigali',
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    amenities: ['WiFi', 'Parking', 'Security System', 'Balcony/Patio', 'Furnished', 'Air Conditioning', 'Kitchen Appliances', 'City View'],
    photos: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    propertyType: 'Apartment',
    listedDate: '2024-05-01T10:00:00Z',
    agent: { name: 'Kigali Homes', phone: '+250788123456', email: 'info@kigalihomes.rw' },
    features: '2 bedrooms, 2 bathrooms, 120 sqm, city views, modern kitchen, AC, furnished, security, parking, balcony.',
    marketTrends: 'Average rent for 2-bed apartments in Kiyovu is $1100-$1400. High demand area.',
    aiData: {
      fairPrice: { suggestedPrice: 1250, priceJustification: 'Based on location, size, amenities, and current market rates, $1250 is a fair price.' },
      matchScore: { score: 85, reasoning: 'Excellent match for tenants seeking modern, furnished apartments in a prime location with city views.' }
    }
  },
  {
    id: '2',
    title: 'Spacious Family House in Nyarutarama',
    description: 'Beautiful 4-bedroom family house with a large garden, swimming pool, and staff quarters. Ideal for families looking for comfort and space.',
    price: 2500000,
    currency: 'RWF',
    location: 'Kigali, Nyarutarama',
    address: 'KG 9 Ave, Kigali',
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    amenities: ['Parking', 'Swimming Pool', 'Gym', 'Security System', 'Garden/Yard', 'Balcony/Patio', 'Pet Friendly', 'Backup Generator'],
    photos: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    propertyType: 'House',
    listedDate: '2024-04-15T14:30:00Z',
    agent: { name: 'Rwanda Properties Ltd', phone: '+250788654321', email: 'sales@rwandaproperties.com' },
    features: '4 bedrooms, 3 bathrooms, 350 sqm, large garden, swimming pool, staff quarters, backup generator, pet friendly.',
    marketTrends: '4-bedroom houses in Nyarutarama range from 2,000,000 RWF to 3,500,000 RWF. Secure and popular residential area.',
    aiData: {
      fairPrice: { suggestedPrice: 2600000, priceJustification: 'The property offers premium amenities like a pool and generator in a desirable area, justifying a price slightly above average.' },
      matchScore: { score: 92, reasoning: 'Strong match for families needing ample space and outdoor amenities in a secure neighborhood.' }
    }
  },
  {
    id: '3',
    title: 'Affordable Studio in Remera',
    description: 'Cozy and affordable studio apartment in Remera, close to Amahoro Stadium and public transport. Perfect for a single professional or student.',
    price: 300000,
    currency: 'RWF',
    location: 'Kigali, Remera',
    address: 'KG 17 Ave, Kigali',
    bedrooms: 1, // Studio considered 1 bed for simplicity
    bathrooms: 1,
    area: 45,
    amenities: ['WiFi', 'Parking', 'Kitchen Appliances', 'Water Heater'],
    photos: ['https://placehold.co/600x400.png'],
    propertyType: 'Apartment',
    listedDate: '2024-05-10T09:00:00Z',
    features: 'Studio, 1 bathroom, 45 sqm, kitchenette, near public transport and stadium.',
    marketTrends: 'Studios in Remera average 250,000-350,000 RWF. High demand due to affordability.',
    aiData: {
      fairPrice: { suggestedPrice: 280000, priceJustification: 'Good value for its location and size, priced competitively within the market range.' },
      matchScore: { score: 78, reasoning: 'Good fit for budget-conscious individuals seeking a central and accessible location.' }
    }
  },
   {
    id: '4',
    title: 'Commercial Office Space in City Center',
    description: 'Prime office space located in the bustling city center of Kigali. Offers flexible floor plans and modern facilities, ideal for growing businesses.',
    price: 15,
    currency: 'USD', // Price per sqm
    location: 'Kigali, City Center',
    address: 'KN 4 St, Kigali',
    bedrooms: 0, // Not applicable for office
    bathrooms: 2, // Common restrooms
    area: 200, // Total available area
    amenities: ['Parking', 'Security System', 'Elevator', 'Air Conditioning', 'Backup Generator', 'WiFi'],
    photos: [
      'https://placehold.co/600x400.png',
      'https://placehold.co/600x400.png',
    ],
    propertyType: 'Office',
    listedDate: '2024-03-20T11:00:00Z',
    agent: { name: 'Kigali Business Spaces', phone: '+250788990011', email: 'leasing@kbs.rw' },
    features: '200 sqm office, flexible layout, city center, modern facilities, elevator, AC, generator, high-speed internet ready.',
    marketTrends: 'Office space in Kigali city center averages $12-$20 per sqm. Location is key for businesses.',
    aiData: {
      fairPrice: { suggestedPrice: 16, priceJustification: 'Competitive pricing for a Grade A office location with excellent amenities.' },
      matchScore: { score: 90, reasoning: 'Highly suitable for businesses prioritizing a central location and professional environment.' }
    }
  }
];

export const mockTenantProfiles: TenantProfile[] = [
  {
    id: 'tenant1',
    fullName: 'Aline Uwase',
    email: 'aline.uwase@example.com',
    budget: { min: 800, max: 1300, currency: 'USD' },
    preferredLocations: ['Kiyovu', 'Kimihurura'],
    propertyPreferences: {
      types: ['Apartment'],
      minBedrooms: 2,
      minBathrooms: 1,
      amenities: ['WiFi', 'Parking', 'Furnished', 'Balcony/Patio'],
      additionalNotes: 'Looking for a modern, bright apartment with good security. City view is a plus.'
    },
  },
  {
    id: 'tenant2',
    fullName: 'Jean Luc Mugisha',
    email: 'jl.mugisha@example.com',
    budget: { min: 1800000, max: 2800000, currency: 'RWF' },
    preferredLocations: ['Nyarutarama', 'Kibagabaga', 'Gacuriro'],
    propertyPreferences: {
      types: ['House', 'Villa'],
      minBedrooms: 3,
      minBathrooms: 2,
      amenities: ['Garden/Yard', 'Swimming Pool', 'Security System', 'Pet Friendly'],
      additionalNotes: 'Need a spacious home for my family with a safe outdoor area for kids. Good schools nearby would be ideal.'
    },
  }
];

export function getPropertyById(id: string): Property | undefined {
  return mockProperties.find(p => p.id === id);
}

export function getTenantPreferencesForAI(tenant: TenantProfile): string {
  return `Budget: ${tenant.budget.min}-${tenant.budget.max} ${tenant.budget.currency}. Locations: ${tenant.preferredLocations.join(', ')}. Property types: ${tenant.propertyPreferences.types.join(', ')}. Min bedrooms: ${tenant.propertyPreferences.minBedrooms}. Min bathrooms: ${tenant.propertyPreferences.minBathrooms}. Must-have amenities: ${tenant.propertyPreferences.amenities.join(', ')}. Additional Notes: ${tenant.propertyPreferences.additionalNotes || 'None'}.`;
}
