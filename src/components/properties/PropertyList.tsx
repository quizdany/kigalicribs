import type { Property } from '@/types';
import PropertyCard from './PropertyCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  tenantLoggedIn?: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, isLoading, tenantLoggedIn }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card p-4 rounded-lg shadow animate-pulse">
            <div className="w-full h-56 bg-muted rounded mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/3 mb-1"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Alert className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Properties Found</AlertTitle>
        <AlertDescription>
          Try adjusting your search filters or check back later for new listings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} tenantLoggedIn={tenantLoggedIn} />
      ))}
    </div>
  );
};

export default PropertyList;
