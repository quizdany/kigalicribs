// This should be a server component to fetch data
import { getPropertyById, mockTenantProfiles } from '@/lib/mockData'; // Mock data fetching
import PropertyGallery from '@/components/properties/PropertyGallery';
import PropertyInfo from '@/components/properties/PropertyInfo';
import FairPriceAnalysis from '@/components/properties/FairPriceAnalysis';
import MatchScoreDisplay from '@/components/properties/MatchScoreDisplay';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Property } from '@/types';

interface PropertyDetailsPageProps {
  params: { id: string };
}

// Simulate fetching data for a server component
async function getPropertyData(id: string): Promise<Property | null> {
  // In a real app, this would be an API call or database query
  // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  const property = getPropertyById(id);
  if (!property) return null;
  return property;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const property = await getPropertyData(params.id);

  if (!property) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Property Not Found</AlertTitle>
          <AlertDescription>
            The property you are looking for does not exist or has been removed.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-8">
          <Link href="/search">Back to Search</Link>
        </Button>
      </div>
    );
  }

  // Mock: randomly decide if a tenant is "logged in" and pick one for demo
  const isTenantLoggedIn = Math.random() > 0.3; // More likely to be logged in for demo
  const currentTenant = isTenantLoggedIn ? mockTenantProfiles[Math.floor(Math.random() * mockTenantProfiles.length)] : undefined;
  
  // If tenant is logged in, ensure the property's aiData.matchScore is populated (mocked)
  // This would normally happen during data fetching based on current user context
  if (currentTenant && property.aiData && !property.aiData.matchScore) {
     property.aiData.matchScore = { score: Math.floor(Math.random() * 50) + 50, reasoning: "This property is a strong contender based on your saved preferences for location and size. The amenities align well, though it's slightly above your average budget."};
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery photos={property.photos} altText={property.title} />
          <PropertyInfo property={property} />
        </div>
        <div className="lg:col-span-1 space-y-8 sticky top-24 self-start">
          <FairPriceAnalysis property={property} />
          <MatchScoreDisplay property={property} tenantProfile={currentTenant} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-headline">
                <FileText className="mr-2 h-6 w-6 text-primary" /> Interested?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Contact the agent or proceed to lease agreement if available.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href={`/lease/${property.id}`}>View Lease Options</Link>
              </Button>
              {property.agent?.phone && (
                 <Button variant="outline" size="lg" className="w-full" asChild>
                    <a href={`tel:${property.agent.phone}`}>Call Agent</a>
                 </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Opt-in to dynamic rendering if property IDs are not known at build time
// export const dynamic = 'force-dynamic';

// Or, if you have a limited set of properties and want to pre-render them:
// export async function generateStaticParams() {
//   // Fetch all property IDs
//   return mockProperties.map((property) => ({
//     id: property.id,
//   }));
// }
