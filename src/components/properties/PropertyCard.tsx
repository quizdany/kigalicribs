
import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, BedDouble, Bath, AreaChart, Tag, Lightbulb, CheckCircle, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface PropertyCardProps {
  property: Property;
  tenantLoggedIn?: boolean; // To conditionally show match score
  isLandlord?: boolean;
  onDelete?: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, tenantLoggedIn, isLandlord, onDelete }) => {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
  };

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location || '')}`;

  const photos = property.photos || [];
  const amenities = property.amenities || [];
  const propertyType = property.propertyType || property.property_type || '';

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Link href={`/properties/${property.id}`} aria-label={`View details for ${property.title}`}>
          <Image
            src={photos[0] || 'https://placehold.co/400x250.png'}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-56 object-cover"
            data-ai-hint="modern house exterior"
          />
        </Link>
        {property.aiData?.fairPrice && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-green-100 text-green-700 border-green-300">
            <Lightbulb className="h-3 w-3 mr-1" /> Fair Price: {formatPrice(property.aiData.fairPrice.suggestedPrice, property.currency)}
          </Badge>
        )}
         {tenantLoggedIn && property.aiData?.matchScore && (
          <Badge variant="default" className="absolute top-2 left-2 bg-primary/80 text-primary-foreground">
             <CheckCircle className="h-3 w-3 mr-1" /> {property.aiData.matchScore.score}% Match
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/properties/${property.id}`}>
          <CardTitle className="text-xl font-headline mb-1 hover:text-primary transition-colors truncate" title={property.title}>
            {property.title}
          </CardTitle>
        </Link>
        
        {property.averageRating && property.reviews && property.reviews.length > 0 && (
          <div className="flex items-center text-sm text-amber-500 mb-2">
            <Star className="h-4 w-4 mr-1 fill-amber-500" /> 
            {property.averageRating.toFixed(1)} 
            <span className="text-muted-foreground ml-1">({property.reviews.length} review{property.reviews.length > 1 ? 's' : ''})</span>
          </div>
        )}

        <a 
          href={googleMapsSearchUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground text-sm mb-3 flex items-center hover:text-primary transition-colors"
          aria-label={`View ${property.location} on Google Maps`}
        >
          <MapPin className="h-4 w-4 mr-1 text-primary" />
          {property.location}
        </a>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-3 text-foreground">
          <span className="flex items-center"><BedDouble className="h-4 w-4 mr-1 text-primary/80" /> {property.bedrooms} beds</span>
          <span className="flex items-center"><Bath className="h-4 w-4 mr-1 text-primary/80" /> {property.bathrooms} baths</span>
          <span className="flex items-center"><AreaChart className="h-4 w-4 mr-1 text-primary/80" /> {property.area} sqm</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {property.description}
        </p>

        <div className="mb-3">
          {amenities.slice(0, 3).map(amenity => (
            <Badge key={amenity} variant="outline" className="mr-1 mb-1 text-xs">{amenity}</Badge>
          ))}
          {amenities.length > 3 && <Badge variant="outline" className="text-xs">+{amenities.length - 3} more</Badge>}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="text-lg font-bold text-primary flex items-center">
          <Tag className="h-5 w-5 mr-1.5" /> {formatPrice(property.price, property.currency)}
          {propertyType === 'Office' && <span className="text-xs text-muted-foreground ml-1">/sqm</span>}
           {propertyType !== 'Office' && !property.title.toLowerCase().includes('office') && <span className="text-xs text-muted-foreground ml-1">/month</span>}
        </div>
        <Button asChild size="sm">
          <Link href={`/properties/${property.id}`}>View Details</Link>
        </Button>
        {isLandlord && (
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/properties/edit/${property.id}`}>Edit</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Property?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this property? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete && onDelete(property.id)}>
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
