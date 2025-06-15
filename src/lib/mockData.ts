
import type { Property, TenantProfile, Review } from '@/types';

// Helper function to calculate average rating
export function calculateAverageRating(reviews: Review[] | undefined): number | undefined {
  if (!reviews || reviews.length === 0) return undefined;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return parseFloat((totalRating / reviews.length).toFixed(1));
}

const newImageUrls = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvGRkpCStIYEKfz8Uczv2NzkMQONYGGZYKNQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN8pnzkXuwnJEhGzd1RAxL7XN3JxRk-gbGYg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_uazvKp_XvizF1fzequ8vRJcm14jfNDzx6g&s'
];

const initialMockProperties: Omit<Property, 'averageRating' | 'reviews'>[] = [
  {
    id: 'prop1_rem_studio',
    title: 'Affordable Studio in Remera',
    description: 'Cozy and well-maintained studio apartment in a convenient Remera location, close to shops and public transport. Ideal for a single professional or student.',
    price: 250000,
    currency: 'RWF',
    location: 'Kigali, Remera',
    address: 'KG 17 Ave, Kigali',
    bedrooms: 0, // Studio typically means 0 distinct bedrooms
    bathrooms: 1,
    area: 35,
    amenities: ['WiFi', 'Parking', 'Kitchenette', 'Water Heater'],
    photos: [
      newImageUrls[0],
      newImageUrls[1],
    ],
    propertyType: 'Apartment',
    listedDate: '2024-07-01T10:00:00Z',
    agent: { name: 'Remera Rentals', phone: '+250788112233', email: 'info@remerarentals.rw' },
    features: 'Studio, 1 bathroom, 35 sqm, kitchenette, secure compound.',
    marketTrends: 'Studios in Remera average 200,000-300,000 RWF. High demand due to affordability and location.',
    aiData: {
      fairPrice: { suggestedPrice: 230000, priceJustification: 'Good value for its location and size, priced competitively within the Remera market for studios.' },
      matchScore: { score: 78, reasoning: 'Good fit for budget-conscious individuals seeking a central and accessible location in Remera.' }
    }
  },
  {
    id: 'prop2_kim_1bed',
    title: 'Modern 1-Bedroom in Kimironko',
    description: 'Bright and modern 1-bedroom apartment near Kimironko market. Features contemporary finishes and a small balcony.',
    price: 350000,
    currency: 'RWF',
    location: 'Kigali, Kimironko',
    address: 'KG 11 Ave, Kigali',
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    amenities: ['Parking', 'Balcony/Patio', 'Kitchen Appliances', 'Security System', 'WiFi Access'],
    photos: [
      newImageUrls[2],
      newImageUrls[0], // Re-use image
    ],
    propertyType: 'Apartment',
    listedDate: '2024-06-15T14:30:00Z',
    agent: { name: 'Kimironko Living', phone: '+250788987654', email: 'rent@kimironkoliving.rw' },
    features: '1 bedroom, 1 bathroom, 55 sqm, modern kitchen, balcony, close to market.',
    marketTrends: '1-bedroom apartments in Kimironko are typically 250,000-380,000 RWF. Demand is high due to proximity to market and transport.',
    aiData: {
      fairPrice: { suggestedPrice: 320000, priceJustification: 'The property is modern and well-located, making 320,000 RWF a fair market price.' },
      matchScore: { score: 82, reasoning: 'Good match for singles or couples looking for modern amenities in a vibrant neighborhood.' }
    }
  },
  {
    id: 'prop3_gis_2bed',
    title: 'Spacious 2-Bedroom in Gisozi',
    description: 'A comfortable 2-bedroom apartment in a quiet residential area of Gisozi, offering ample living space and good security.',
    price: 480000,
    currency: 'RWF',
    location: 'Kigali, Gisozi',
    address: 'KG 33 Ave, Gisozi',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    amenities: ['Parking', 'Security System', 'Balcony/Patio', 'Water Tank', 'Garden Access'],
    photos: [
        newImageUrls[1], // Re-use image
        newImageUrls[2], // Re-use image
    ],
    propertyType: 'Apartment',
    listedDate: '2024-05-20T09:00:00Z',
    agent: { name: 'Gisozi Homes', phone: '+250781234500', email: 'contact@gisozihomes.rw' },
    features: '2 bedrooms, 2 bathrooms, 95 sqm, spacious living room, balcony, quiet neighborhood.',
    marketTrends: '2-bedroom apartments in Gisozi typically range from 400,000 to 550,000 RWF. Growing residential area.',
    aiData: {
      fairPrice: { suggestedPrice: 450000, priceJustification: 'This price is fair for a 2-bedroom with good space and security in Gisozi.' },
      matchScore: { score: 75, reasoning: 'Suitable for small families or sharers looking for a quieter area with reasonable space.' }
    }
  },
  {
    id: 'prop4_kck_1bed_over',
    title: '1-Bedroom Kicukiro Flat (Overpriced)',
    description: 'A standard 1-bedroom flat in Kicukiro. Decent condition but listed significantly above AI-estimated market rate.',
    price: 400000, // Intentionally high for the AI fair price
    currency: 'RWF',
    location: 'Kigali, Kicukiro',
    address: 'KK 15 Ave, Kicukiro',
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    amenities: ['Parking', 'Kitchenette', 'Water Heater'],
    photos: [
      newImageUrls[0], // Re-use image
    ],
    propertyType: 'Apartment',
    listedDate: '2024-07-05T11:00:00Z',
    features: '1 bedroom, 1 bathroom, 50 sqm, basic amenities. Listed above market expectations.',
    marketTrends: 'Typical 1-bedroom flats in this part of Kicukiro rent for 200,000-300,000 RWF. This listing is an outlier.',
    aiData: {
      fairPrice: { suggestedPrice: 280000, priceJustification: 'Based on size, age, and comparable properties in Kicukiro, a fair price is closer to 280,000 RWF. The current listing price is significantly higher.' },
      matchScore: { score: 55, reasoning: 'While the location might be okay, the price is well above the AI-assessed fair value, reducing its match score.' }
    }
  }
];

const propertyReviews: { [propertyId: string]: Review[] } = {
  'prop1_rem_studio': [
    { id: 'r1_srs', propertyId: 'prop1_rem_studio', tenantName: 'Chris K.', rating: 4, comment: 'Good value for money. Clean and conveniently located in Remera.', date: '2024-07-15T10:00:00Z' },
  ],
  'prop2_kim_1bed': [
    { id: 'r1_k1b', propertyId: 'prop2_kim_1bed', tenantName: 'Ange T.', rating: 5, comment: 'Loved the modern design and the balcony. Proximity to Kimironko market is a big plus!', date: '2024-07-01T14:30:00Z' },
  ],
  'prop3_gis_2bed': [
    { id: 'r1_g2b', propertyId: 'prop3_gis_2bed', tenantName: 'Eric M.', rating: 4, comment: 'Spacious and secure. The landlord is responsive. Good for a small family.', date: '2024-06-10T12:00:00Z' },
  ],
  'prop4_kck_1bed_over': [
    { id: 'r1_k1bo', propertyId: 'prop4_kck_1bed_over', tenantName: 'Linda U.', rating: 2, comment: 'The place is okay, but definitely not worth 400k. Found similar options for much less in the area.', date: '2024-07-18T15:00:00Z' },
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
    budget: { min: 200000, max: 400000, currency: 'RWF' }, // Adjusted budget to fit new property range
    preferredLocations: ['Remera', 'Kimironko', 'Kicukiro'],
    propertyPreferences: {
      types: ['Apartment'],
      minBedrooms: 0, // For studios
      minBathrooms: 1,
      amenities: ['WiFi', 'Parking', 'Kitchenette'],
      additionalNotes: 'Looking for a clean, secure, and affordable studio or 1-bedroom. Good transport links important.'
    },
  },
  {
    id: 'tenant2',
    fullName: 'Jean Luc Mugisha',
    email: 'jl.mugisha@example.com',
    budget: { min: 300000, max: 500000, currency: 'RWF' }, // Adjusted budget
    preferredLocations: ['Gisozi', 'Kicukiro', 'Remera'],
    propertyPreferences: {
      types: ['Apartment', 'House'], // Can include small houses if they fit price
      minBedrooms: 1,
      minBathrooms: 1,
      amenities: ['Parking', 'Security System', 'Balcony/Patio'],
      additionalNotes: 'Need a 1 or 2-bedroom place. Safety and a quiet environment are priorities.'
    },
  },
  {
    id: 'tenant3',
    fullName: 'Fatima Diallo',
    email: 'fatima.d@example.com',
    budget: {min: 150000, max: 350000, currency: 'RWF'},
    preferredLocations: ['Remera', 'Kimironko', 'Nyamirambo'], // Nyamirambo often has more affordable options
    propertyPreferences: {
        types: ['Apartment'],
        minBedrooms: 0,
        minBathrooms: 1,
        amenities: ['Kitchenette', 'Water Heater'],
        additionalNotes: 'Student looking for a budget-friendly and safe place. Furnished or unfurnished is fine.'
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
  
  if (!propertyReviews[propertyId]) {
    propertyReviews[propertyId] = [];
  }
  propertyReviews[propertyId].push(newReview);


  return newReview;
}
