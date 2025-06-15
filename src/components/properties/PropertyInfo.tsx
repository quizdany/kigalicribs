import type { Property } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, BedDouble, Bath, AreaChart, Tag, CalendarDays, UserCircle, Phone, Mail, ListChecks } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PropertyInfoProps {
  property: Property;
}

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
};

const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">{property.title}</CardTitle>
        <div className="text-muted-foreground text-lg flex items-center mt-1">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          {property.location}, {property.address}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-2xl font-bold text-foreground flex items-center">
          <Tag className="h-7 w-7 mr-2 text-accent" />
          {formatPrice(property.price, property.currency)}
           {property.propertyType === 'Office' && <span className="text-sm text-muted-foreground ml-1">/sqm per month</span>}
           {property.propertyType !== 'Office' && <span className="text-sm text-muted-foreground ml-1">/month</span>}
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
              <h3 className="text-xl font-semibold mb-3">Contact Agent</h3>
              <div className="space-y-2 text-md">
                <div className="flex items-center"><UserCircle className="h-5 w-5 mr-2 text-primary/80" /> {property.agent.name}</div>
                <div className="flex items-center"><Mail className="h-5 w-5 mr-2 text-primary/80" /> <a href={`mailto:${property.agent.email}`} className="hover:text-primary">{property.agent.email}</a></div>
                <div className="flex items-center"><Phone className="h-5 w-5 mr-2 text-primary/80" /> <a href={`tel:${property.agent.phone}`} className="hover:text-primary">{property.agent.phone}</a></div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyInfo;
