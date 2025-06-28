"use client";

import type { Property, Review } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, BedDouble, Bath, AreaChart, Tag, CalendarDays, UserCircle, Phone, Mail, ListChecks, Star, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import MomoPaymentGate from './MomoPaymentGate';
import { useRouter } from 'next/navigation';

interface PropertyInfoProps {
  property: Property;
  showContactInfo?: boolean;
}

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
};

const StarRatingDisplay = ({ rating, reviewCount }: { rating?: number; reviewCount?: number }) => {
  if (!rating || !reviewCount || reviewCount === 0) {
    return <span className="text-sm text-muted-foreground">No reviews yet</span>;
  }

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 text-amber-400 fill-amber-400" />
      ))}
      {halfStar && <Star key="half" className="h-5 w-5 text-amber-400 fill-amber-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-amber-400" />
      ))}
      <span className="ml-2 text-lg font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="ml-1 text-sm text-muted-foreground">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
    </div>
  );
};


const PropertyInfo: React.FC<PropertyInfoProps> = ({ property, showContactInfo = false }) => {
  const [showContact, setShowContact] = useState(false);
  const router = useRouter();
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address + ', ' + property.location)}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('showContact') === '1') setShowContact(true);
    }
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <CardTitle className="text-3xl font-headline text-primary">{property.title}</CardTitle>
            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground text-lg flex items-center mt-1 hover:text-primary transition-colors"
              aria-label={`View ${property.address} on Google Maps`}
            >
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              {property.location}, {property.address}
            </a>
          </div>
          {property.averageRating && property.reviews && (
             <div className="mt-2 sm:mt-0">
               <StarRatingDisplay rating={property.averageRating} reviewCount={property.reviews.length} />
             </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-2xl font-bold text-foreground flex items-center">
          <Tag className="h-7 w-7 mr-2 text-accent" />
          {formatPrice(property.price, property.currency)}
           {property.propertyType === 'Office' && <span className="text-sm text-muted-foreground ml-1">/sqm per month</span>}
           {property.propertyType !== 'Office' && !property.title.toLowerCase().includes('office') && <span className="text-sm text-muted-foreground ml-1">/month</span>}
        </div>
        
        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center"><ListChecks className="mr-2 h-5 w-5 text-accent" />Key Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-md">
            <div className="flex items-center"><BedDouble className="h-5 w-5 mr-2 text-primary/80" /> <strong>{property.bedrooms}</strong>&nbsp;Bedrooms</div>
            <div className="flex items-center"><Bath className="h-5 w-5 mr-2 text-primary/80" /> <strong>{property.bathrooms}</strong>&nbsp;Bathrooms</div>
            <div className="flex items-center"><AreaChart className="h-5 w-5 mr-2 text-primary/80" /> <strong>{property.area}</strong>&nbsp;sqm</div>
            <div className="flex items-center col-span-2 sm:col-span-1"><Badge variant="secondary" className="text-sm">{property.propertyType}</Badge></div>
            <div className="flex items-center col-span-2"><CalendarDays className="h-5 w-5 mr-2 text-primary/80" /> Listed on: {new Date(property.listedDate).toLocaleDateString()}</div>
          </div>
        </div>

        <Separator />
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{property.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map(amenity => (
              <Badge key={amenity} variant="outline" className="px-3 py-1 text-sm">{amenity}</Badge>
            ))}
          </div>
        </div>

        {property.agent && (
          <>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-3">Contact Owner</h3>
              {!showContact ? (
                <button
                  className="btn btn-primary"
                  onClick={() => router.push(`/payment?redirectTo=/properties/${property.id}?showContact=1&fee=1000&context=contact`)}
                >
                  Contact Owner
                </button>
              ) : (
                <div className="space-y-2 text-md">
                  <div className="flex items-center"><UserCircle className="h-5 w-5 mr-2 text-primary/80" /> {property.agent.name}</div>
                  {property.agent.email && 
                    <div className="flex items-center"><Mail className="h-5 w-5 mr-2 text-primary/80" /> <a href={`mailto:${property.agent.email}`} className="hover:text-primary">{property.agent.email}</a></div>
                  }
                  {property.agent.phone &&
                    <div className="flex items-center"><Phone className="h-5 w-5 mr-2 text-primary/80" /> <a href={`tel:${property.agent.phone}`} className="hover:text-primary">{property.agent.phone}</a></div>
                  }
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyInfo;
