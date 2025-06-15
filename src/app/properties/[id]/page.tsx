
// This should be a server component to fetch data
import { getPropertyById, mockTenantProfiles, addReviewToProperty } from '@/lib/mockData'; // Mock data fetching
import PropertyGallery from '@/components/properties/PropertyGallery';
import PropertyInfo from '@/components/properties/PropertyInfo';
import FairPriceAnalysis from '@/components/properties/FairPriceAnalysis';
import MatchScoreDisplay from '@/components/properties/MatchScoreDisplay';
import PropertyReviewsList from '@/components/properties/PropertyReviewsList';
import SubmitReviewForm from '@/components/properties/SubmitReviewForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Property } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { unstable_noStore as noStore } from 'next/cache';


interface PropertyDetailsPageProps {
  params: { id: string };
}

// Simulate fetching data for a server component
async function getPropertyData(id: string): Promise<Property | null> {
  noStore(); // Opt out of caching for this fetch with mock data
  const property = getPropertyById(id);
  if (!property) return null;
  return property;
}

// Wrapper client component for review submission state management if needed for optimistic updates.
// For now, we'll rely on router.refresh() or accept that mockData updates won't be instant.
// The `addReviewToProperty` in mockData modifies the array directly.
// Next.js server components might not pick up this change without revalidation or `noStore()`.

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
  
  if (currentTenant && property.aiData && !property.aiData.matchScore) {
     property.aiData.matchScore = { score: Math.floor(Math.random() * 50) + 50, reasoning: "This property is a strong contender based on your saved preferences for location and size. The amenities align well, though it's slightly above your average budget."};
  }

  // For SubmitReviewForm to trigger updates on this server component,
  // it would typically use a server action that revalidates the path, or router.refresh().
  // Since we're using mockData directly, updates might not be immediate without a page refresh.
  // The `addReviewToProperty` function modifies the mockData array. `noStore()` helps here.
  const handleReviewSubmitted = () => {
    // In a real app with server actions, you might call router.refresh() here
    // or the server action itself would handle revalidation.
    // For mock data, this is more of a placeholder.
    console.log('Review submitted, parent page notified (mock).');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery photos={property.photos} altText={property.title} />
          <PropertyInfo property={property} />
          
          <Separator />

          <div>
            <h2 className="text-2xl font-headline mb-4 flex items-center">
              <MessageSquare className="mr-2 h-6 w-6 text-primary" /> Reviews ({property.reviews?.length || 0})
            </h2>
            <PropertyReviewsList reviews={property.reviews || []} />
          </div>

          {/* Mocking "logged in" to show review form */}
          {isTenantLoggedIn && (
            <>
              <Separator />
              <SubmitReviewForm propertyId={property.id} onReviewSubmitted={handleReviewSubmitted} />
            </>
          )}

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

// export const dynamic = 'force-dynamic'; // Use this or noStore() for dynamic data
// Or, if you have a limited set of properties and want to pre-render them:
// export async function generateStaticParams() {
//   // Fetch all property IDs
//   return mockProperties.map((property) => ({
//     id: property.id,
//   }));
// }
