
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getPropertiesByLandlord, deleteProperty } from '@/lib/actions';
import PropertyList from '@/components/properties/PropertyList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Property } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      setProperties(props => props.filter(p => p.id !== id));
      toast({ title: 'Property Deleted', description: 'The property was deleted successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete property.', variant: 'destructive' });
      console.error(err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'landlord') {
      const fetchProperties = async () => {
        try {
          setIsLoading(true);
          if (session.user.id) {
            const landlordProperties = await getPropertiesByLandlord(session.user.id);
            setProperties(landlordProperties);
          }
        } catch (err) {
          setError('Failed to fetch properties.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperties();
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-card p-4 rounded-lg shadow">
                <div className="w-full h-56 bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
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

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Button asChild>
          <Link href="/list-property">List New Property</Link>
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <PropertyList properties={properties} isLoading={isLoading} isLandlord={true} onDelete={handleDelete} />
    </div>
  );
}
