// This should be a server component to fetch data
import { supabase } from '@/lib/supabaseClient';
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
import MomoPaymentGate from '@/components/properties/MomoPaymentGate';


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
  // Fetch property from Supabase
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !property) {
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

          {/* You can add review submission and login logic here if needed */}
        </div>
        <div className="lg:col-span-1 space-y-8 sticky top-24 self-start">
          <FairPriceAnalysis property={property} />
          <MatchScoreDisplay property={property} tenantProfile={undefined} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-headline">
                <FileText className="mr-2 h-6 w-6 text-primary" /> Interested?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Proceed to lease agreement if available.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href={`/lease/${property.id}`}>View Lease Options</Link>
              </Button>
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
