
import type { Property, TenantProfile, Review } from '@/types';

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
    bedrooms: 0, 
    bathrooms: 1,
    area: 35,
    amenities: ['WiFi', 'Parking', 'Kitchenette', 'Water Heater', 'Near Bus Station', 'Tarmac Road Access'],
    photos: [newImageUrls[0], newImageUrls[1]],
    propertyType: 'Apartment',
    listedDate: '2024-07-01T10:00:00Z',
    agent: { name: 'Remera Rentals', phone: '+250788112233', email: 'info@remerarentals.rw' },
    features: 'Studio, 1 bathroom, 35 sqm, kitchenette, secure compound, near bus stop, tarmac road.',
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
    amenities: ['Parking', 'Balcony/Patio', 'Kitchen Appliances', 'Security System', 'Tarmac Road Access'],
    photos: [newImageUrls[2], newImageUrls[0]],
    propertyType: 'Apartment',
    listedDate: '2024-06-15T14:30:00Z',
    agent: { name: 'Kimironko Living', phone: '+250788987654', email: 'rent@kimironkoliving.rw' },
    features: '1 bedroom, 1 bathroom, 55 sqm, modern kitchen, balcony, close to market, tarmac access.',
    marketTrends: '1-bedroom apartments in Kimironko are typically 250,000-380,000 RWF. Demand is high due to proximity to market and transport.',
    aiData: {
      fairPrice: { suggestedPrice: 320000, priceJustification: 'The property is modern and well-located, making 320,000 RWF a fair market price.' },
      matchScore: { score: 82, reasoning: 'Good match for singles or couples looking for modern amenities in a vibrant neighborhood.' }
    }
  },
  {
    id: 'prop3_gis_2bed_overpriced',
    title: 'Spacious 2-Bedroom in Gisozi (High Price)',
    description: 'A comfortable 2-bedroom apartment in a quiet residential area of Gisozi, offering ample living space and good security. Listed above AI suggested price.',
    price: 480000, 
    currency: 'RWF',
    location: 'Kigali, Gisozi',
    address: 'KG 33 Ave, Gisozi',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    amenities: ['Parking', 'Security System', 'Balcony/Patio', 'Water Tank', 'Near Bus Station'],
    photos: [newImageUrls[1], newImageUrls[2]],
    propertyType: 'Apartment',
    listedDate: '2024-05-20T09:00:00Z',
    agent: { name: 'Gisozi Homes', phone: '+250781234500', email: 'contact@gisozihomes.rw' },
    features: '2 bedrooms, 2 bathrooms, 95 sqm, spacious living room, balcony, quiet neighborhood. Note: price seems high.',
    marketTrends: '2-bedroom apartments in Gisozi typically range from 350,000 to 450,000 RWF. This listing is on the higher end.',
    aiData: {
      fairPrice: { suggestedPrice: 400000, priceJustification: 'For a 2-bedroom with these features in Gisozi, 400,000 RWF is a more typical fair price. The current listing appears to be above average market rates.' },
      matchScore: { score: 65, reasoning: 'Suitable for small families if budget is flexible, but price is a concern compared to market rates.' }
    }
  },
  {
    id: 'prop4_kck_budget',
    title: 'Budget-Friendly 1-Bedroom Kicukiro',
    description: 'A basic but clean 1-bedroom flat in Kicukiro. Ideal for those on a tighter budget. Close to main road.',
    price: 180000, 
    currency: 'RWF',
    location: 'Kigali, Kicukiro',
    address: 'KK 15 Ave, Kicukiro',
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    amenities: ['Parking', 'Kitchenette', 'Water Heater', 'Tarmac Road Access', 'Near Bus Station'],
    photos: [newImageUrls[0]],
    propertyType: 'Apartment',
    listedDate: '2024-07-05T11:00:00Z',
    features: '1 bedroom, 1 bathroom, 50 sqm, basic amenities. Very affordable for Kicukiro.',
    marketTrends: 'Typical 1-bedroom flats in this part of Kicukiro rent for 150,000-250,000 RWF. This is well-priced.',
    aiData: {
      fairPrice: { suggestedPrice: 170000, priceJustification: 'Based on size, age, and current market conditions for budget properties in Kicukiro, this is a very fair and competitive price.' },
      matchScore: { score: 88, reasoning: 'Excellent match for budget-conscious tenants prioritising affordability and accessibility in Kicukiro.' }
    }
  }
];

const propertyReviews: { [propertyId: string]: Review[] } = {
  'prop1_rem_studio': [
    { id: 'r1_srs', propertyId: 'prop1_rem_studio', tenantName: 'Chris K.', rating: 4, comment: 'Good value for money. Clean and conveniently located in Remera. Bus station is very close.', date: '2024-07-15T10:00:00Z' },
  ],
  'prop2_kim_1bed': [
    { id: 'r1_k1b', propertyId: 'prop2_kim_1bed', tenantName: 'Ange T.', rating: 5, comment: 'Loved the modern design and the balcony. Proximity to Kimironko market is a big plus! Easy tarmac access.', date: '2024-07-01T14:30:00Z' },
  ],
  'prop3_gis_2bed_overpriced': [
    { id: 'r1_g2bo', propertyId: 'prop3_gis_2bed_overpriced', tenantName: 'Eric M.', rating: 3, comment: 'Spacious and secure, but the rent is a bit high for Gisozi. Landlord is responsive though.', date: '2024-06-10T12:00:00Z' },
     { id: 'r2_g2bo', propertyId: 'prop3_gis_2bed_overpriced', tenantName: 'Sarah W.', rating: 4, comment: 'Nice place, very quiet. A bit far from the main bus stop if you don\'t drive.', date: '2024-07-20T09:00:00Z' },
  ],
  'prop4_kck_budget': [
    { id: 'r1_k1bo', propertyId: 'prop4_kck_budget', tenantName: 'Linda U.', rating: 5, comment: 'The place is basic but perfect for my budget. Can\'t beat the price for Kicukiro and it\'s right on a tarmac road.', date: '2024-07-18T15:00:00Z' },
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
    budget: { min: 150000, max: 300000, currency: 'RWF' }, 
    preferredLocations: ['Remera', 'Kimironko', 'Kicukiro'],
    propertyPreferences: {
      types: ['Apartment'],
      minBedrooms: 0, 
      minBathrooms: 1,
      amenities: ['WiFi', 'Parking', 'Kitchenette', 'Near Bus Station'],
      additionalNotes: 'Looking for a clean, secure, and affordable studio or 1-bedroom. Good transport links important.'
    },
  },
  {
    id: 'tenant2',
    fullName: 'Jean Luc Mugisha',
    email: 'jl.mugisha@example.com',
    budget: { min: 300000, max: 500000, currency: 'RWF' }, 
    preferredLocations: ['Gisozi', 'Kicukiro', 'Remera'],
    propertyPreferences: {
      types: ['Apartment', 'House'], 
      minBedrooms: 1,
      minBathrooms: 1,
      amenities: ['Parking', 'Security System', 'Balcony/Patio', 'Tarmac Road Access'],
      additionalNotes: 'Need a 1 or 2-bedroom place. Safety and a quiet environment are priorities.'
    },
  },
  {
    id: 'tenant3',
    fullName: 'Fatima Diallo',
    email: 'fatima.d@example.com',
    budget: {min: 150000, max: 250000, currency: 'RWF'},
    preferredLocations: ['Remera', 'Kimironko', 'Nyamirambo'], 
    propertyPreferences: {
        types: ['Apartment'],
        minBedrooms: 0,
        minBathrooms: 1,
        amenities: ['Kitchenette', 'Water Heater', 'Near Bus Station'],
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
    id: `r${Date.now()}p${propertyId}`, 
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
