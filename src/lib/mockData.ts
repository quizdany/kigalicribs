
import type { Property, TenantProfile, Review } from '@/types';

// Helper function to calculate average rating
export function calculateAverageRating(reviews: Review[] | undefined): number | undefined {
  if (!reviews || reviews.length === 0) return undefined;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return parseFloat((totalRating / reviews.length).toFixed(1));
}

const initialMockProperties: Omit<Property, 'averageRating' | 'reviews'>[] = [
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
      'https://placehold.co/600x400.png?a=1',
      'https://placehold.co/600x400.png?b=1',
      'https://placehold.co/600x400.png?c=1',
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
      'https://placehold.co/600x400.png?a=2',
      'https://placehold.co/600x400.png?b=2',
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
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    amenities: ['WiFi', 'Parking', 'Kitchen Appliances', 'Water Heater'],
    photos: ['https://placehold.co/600x400.png?a=3'],
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
    price: 15, // USD per sqm
    currency: 'USD',
    location: 'Kigali, City Center',
    address: 'KN 4 St, Kigali',
    bedrooms: 0,
    bathrooms: 2,
    area: 200,
    amenities: ['Parking', 'Security System', 'Elevator', 'Air Conditioning', 'Backup Generator', 'WiFi'],
    photos: [
      'https://placehold.co/600x400.png?a=4',
      'https://placehold.co/600x400.png?b=4',
    ],
    propertyType: 'Office',
    listedDate: '2024-03-20T11:00:00Z',
    agent: { name: 'Kigali Business Spaces', phone: '+250788990011', email: 'leasing@kbs.rw' },
    features: '200 sqm office, flexible layout, city center, modern facilities, elevator, AC, generator, high-speed internet ready.',
    marketTrends: 'Office space in Kigali city center averages $12-$20 per sqm. Location is key for businesses.',
    aiData: {
      fairPrice: { suggestedPrice: 16, priceJustification: 'Competitive pricing for a Grade A office location with excellent amenities.' }, // USD per sqm
      matchScore: { score: 90, reasoning: 'Highly suitable for businesses prioritizing a central location and professional environment.' }
    }
  },
  {
    id: '5',
    title: 'Charming 3-Bedroom House in Remera',
    description: 'A well-maintained 3-bedroom house in a quiet part of Remera. Features a small garden and easy access to local markets and schools.',
    price: 650000,
    currency: 'RWF',
    location: 'Kigali, Remera',
    address: 'KG 201 St, Kigali',
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    amenities: ['Parking', 'Garden/Yard', 'Kitchen Appliances', 'Water Heater', 'Security System'],
    photos: [
        'https://placehold.co/600x400.png?a=5',
        'https://placehold.co/600x400.png?b=5',
    ],
    propertyType: 'House',
    listedDate: '2024-06-01T09:00:00Z',
    agent: { name: 'Remera Rentals', phone: '+250788112233', email: 'info@remerarentals.rw' },
    features: '3 bedrooms, 2 bathrooms, 150 sqm, small garden, quiet neighborhood.',
    marketTrends: '3-bedroom houses in Remera typically rent for 500,000-700,000 RWF. Good for families or shared living.',
    aiData: {
      fairPrice: { suggestedPrice: 600000, priceJustification: 'Priced fairly for its size, condition, and location within Remera.' },
      matchScore: { score: 82, reasoning: 'Good option for those looking for a moderately sized house in a convenient, established neighborhood.' }
    }
  },
  {
    id: '6',
    title: 'Modern 2-Bedroom Apartment in Kimironko (Overpriced)',
    description: 'Newly built 2-bedroom apartment in Kimironko with modern finishes. Close to the market and main road. Listed significantly above AI valuation.',
    price: 750000, // Intentionally high
    currency: 'RWF',
    location: 'Kigali, Kimironko',
    address: 'KG 11 Ave, Kigali',
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    amenities: ['WiFi', 'Parking', 'Balcony/Patio', 'Kitchen Appliances', 'Security System'],
    photos: [
        'https://placehold.co/600x400.png?a=6',
        'https://placehold.co/600x400.png?b=6',
    ],
    propertyType: 'Apartment',
    listedDate: '2024-07-10T11:00:00Z',
    features: '2 bedrooms, 1 bathroom, 90 sqm, modern finishes, balcony, near Kimironko market.',
    marketTrends: '2-bedroom apartments in Kimironko usually rent for 450,000-650,000 RWF. This listing is above typical market rates.',
    aiData: {
      fairPrice: { suggestedPrice: 600000, priceJustification: 'The suggested fair price is 600,000 RWF based on comparable properties and features. The listing price is notably higher.' },
      matchScore: { score: 65, reasoning: 'Matches some criteria but the price is significantly above market valuation, impacting overall score.' }
    }
  }
];

const propertyReviews: { [propertyId: string]: Review[] } = {
  '1': [
    { id: 'r1p1', propertyId: '1', tenantName: 'Grace M.', rating: 5, comment: 'Absolutely loved my stay here! The view is incredible and the apartment is very well-maintained.', date: '2024-06-15T10:00:00Z' },
    { id: 'r2p1', propertyId: '1', tenantName: 'David K.', rating: 4, comment: 'Great location and comfortable apartment. Minor issue with the AC but it was fixed promptly.', date: '2024-07-01T14:30:00Z' },
  ],
  '2': [
    { id: 'r1p2', propertyId: '2', tenantName: 'Family R.', rating: 5, comment: 'Perfect house for our family. The kids enjoyed the pool and garden immensely. Very secure area.', date: '2024-05-20T12:00:00Z' },
  ],
  '3': [
     { id: 'r1p3', propertyId: '3', tenantName: 'John B.', rating: 3, comment: 'Decent for the price. A bit noisy from the street, but convenient location.', date: '2024-06-10T08:00:00Z' },
  ],
  '5': [
    { id: 'r1p5', propertyId: '5', tenantName: 'Sarah K.', rating: 4, comment: 'Nice house, good location in Remera. Landlord was responsive.', date: '2024-07-05T10:00:00Z' },
  ],
  '6': [
    { id: 'r1p6', propertyId: '6', tenantName: 'Peter G.', rating: 2, comment: 'The apartment itself is new, but the price is way too high for Kimironko. Found something similar for much less.', date: '2024-07-20T15:00:00Z' },
  ]
};

export const mockProperties: Property[] = initialMockProperties.map(p => {
  const reviews = propertyReviews[p.id] || [];
  return {
    ...p,
    reviews: reviews,
    averageRating: calculateAverageRating(reviews),
  };
});


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
  },
  {
    id: 'tenant3',
    fullName: 'Fatima Diallo',
    email: 'fatima.d@example.com',
    budget: {min: 400000, max: 700000, currency: 'RWF'},
    preferredLocations: ['Remera', 'Kimironko'],
    propertyPreferences: {
        types: ['Apartment', 'House'],
        minBedrooms: 2,
        minBathrooms: 1,
        amenities: ['Parking', 'Kitchen Appliances', 'Security System'],
        additionalNotes: 'Looking for a clean and secure place, not too far from public transport. Furnished or unfurnished is fine.'
    }
  }
];

export function getPropertyById(id: string): Property | undefined {
  return mockProperties.find(p => p.id === id);
}

export function getTenantPreferencesForAI(tenant: TenantProfile): string {
  return `Budget: ${tenant.budget.min}-${tenant.budget.max} ${tenant.budget.currency}. Locations: ${tenant.preferredLocations.join(', ')}. Property types: ${tenant.propertyPreferences.types.join(', ')}. Min bedrooms: ${tenant.propertyPreferences.minBedrooms}. Min bathrooms: ${tenant.propertyPreferences.minBathrooms}. Must-have amenities: ${tenant.propertyPreferences.amenities.join(', ')}. Additional Notes: ${tenant.propertyPreferences.additionalNotes || 'None'}.`;
}

export function addReviewToProperty(propertyId: string, reviewData: Omit<Review, 'id' | 'propertyId' | 'date'>): Review | undefined {
  const propertyIndex = mockProperties.findIndex(p => p.id === propertyId);
  if (propertyIndex === -1) return undefined;

  const newReview: Review = {
    ...reviewData,
    id: `r${Date.now()}p${propertyId}`, // Simple unique ID
    propertyId,
    date: new Date().toISOString(),
  };

  if (!mockProperties[propertyIndex].reviews) {
    mockProperties[propertyIndex].reviews = [];
  }
  mockProperties[propertyIndex].reviews!.push(newReview);
  mockProperties[propertyIndex].averageRating = calculateAverageRating(mockProperties[propertyIndex].reviews);
  
  // Also update the global propertyReviews map for consistency if needed elsewhere, though direct modification of mockProperties is primary.
  if (!propertyReviews[propertyId]) {
    propertyReviews[propertyId] = [];
  }
  propertyReviews[propertyId].push(newReview);


  return newReview;
}

```