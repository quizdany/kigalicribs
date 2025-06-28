"use client";
// This should be a server component to fetch property details
import LeaseAgreementView from '@/components/properties/LeaseAgreementView';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Property } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockProperties } from '@/lib/mockData';

interface LeasePageProps {
  params: { propertyId: string };
}

export default function LeasePage({ params }: LeasePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showLease = searchParams.get('showLease') === '1';
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prop = mockProperties.find(p => p.id === params.propertyId) || null;
    setProperty(prop);
    setLoading(false);
  }, [params.propertyId]);

  if (loading) {
    return <div className="container mx-auto py-12 px-4 text-center">Loading...</div>;
  }

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
      {showLease ? (
        <LeaseAgreementView
          propertyName={property.title}
          propertyAddress={property.address}
        />
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => router.push(`/payment?redirectTo=/lease/${params.propertyId}?showLease=1&fee=1000&context=lease`)}
        >
          View Lease Options
        </button>
      )}
    </div>
  );
}

// export const dynamic = 'force-dynamic'; // If IDs are not known at build time
