'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getPropertyById, updateProperty } from '@/lib/actions';
import PropertyForm from '@/components/properties/PropertyForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Property } from '@/types';
import { useParams } from 'next/navigation';

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'landlord') {
      const fetchProperty = async () => {
        try {
          setIsLoading(true);
          if (id) {
            const propertyData = await getPropertyById(id as string);
            setProperty(propertyData);
          }
        } catch (err) {
          setError('Failed to fetch property data.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    }
  }, [session, status, id]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'landlord') {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You must be logged in as a landlord to view this page.</p>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
      {property && <PropertyForm property={property} />}
    </div>
  );
}
