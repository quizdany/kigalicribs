// This should be a server component to fetch property details
import LeaseAgreementView from '@/components/properties/LeaseAgreementView';
import { getPropertyById } from '@/lib/mockData'; // Mock data fetching
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Property } from '@/types';

interface LeasePageProps {
  params: { propertyId: string };
}

async function getPropertyData(id: string): Promise<Property | null> {
  const property = getPropertyById(id);
  if (!property) return null;
  return property;
}

export default async function LeasePage({ params }: LeasePageProps) {
  const property = await getPropertyData(params.propertyId);

  if (!property) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
         <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Property Not Found</AlertTitle>
          <AlertDescription>
            Cannot generate a lease for a property that does not exist.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-8">
          <Link href="/search">Back to Search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <LeaseAgreementView 
        propertyName={property.title}
        propertyAddress={property.address}
      />
    </div>
  );
}

// export const dynamic = 'force-dynamic'; // If IDs are not known at build time
