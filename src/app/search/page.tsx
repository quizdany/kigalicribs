
"use client";

import { useState, useEffect, useCallback } from 'react';
import PropertyFilters, { Filters } from '@/components/properties/PropertyFilters';
import PropertyList from '@/components/properties/PropertyList';
import MapViewPlaceholder from '@/components/properties/MapViewPlaceholder';
import { mockProperties } from '@/lib/mockData';
import type { Property } from '@/types';
import { SELECT_ANY_VALUE } from '@/types'; // Import the constant
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';

export default function SearchPage() {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [tenantLoggedIn, setTenantLoggedIn] = useState(false); // Mocked

  useEffect(() => {
    // Simulate auth check for tenant to show match scores
    setTenantLoggedIn(Math.random() > 0.5);
  }, []);

  const handleFilterChange = useCallback((filters: Filters) => {
    setIsLoading(true);
    // Simulate API call / filtering logic
    setTimeout(() => {
      let results = mockProperties;

      if (filters.searchTerm) {
        results = results.filter(p => 
          p.title.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }
      if (filters.location && filters.location !== SELECT_ANY_VALUE) {
        results = results.filter(p => p.location.includes(filters.location!));
      }
      if (filters.propertyType && filters.propertyType !== SELECT_ANY_VALUE) {
        results = results.filter(p => p.propertyType === filters.propertyType);
      }
      if (filters.bedrooms && filters.bedrooms > 0) {
        results = results.filter(p => p.bedrooms >= filters.bedrooms!);
      }
      if (filters.bathrooms && filters.bathrooms > 0) {
        results = results.filter(p => p.bathrooms >= filters.bathrooms!);
      }
      if (filters.minPrice !== undefined && filters.priceCurrency) {
         results = results.filter(p => p.currency === filters.priceCurrency && p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined && filters.priceCurrency) {
        results = results.filter(p => p.currency === filters.priceCurrency && p.price <= filters.maxPrice!);
      }
      if (filters.amenities && filters.amenities.length > 0) {
        results = results.filter(p => filters.amenities!.every(a => p.amenities.includes(a)));
      }

      setFilteredProperties(results);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Find Your Next Property</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Use the filters to narrow down your search and discover the perfect place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <PropertyFilters onFilterChange={handleFilterChange} />
        </div>
        <div className="lg:col-span-3">
          <div className="flex justify-end mb-6">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              onClick={() => setViewMode('list')}
              className="mr-2"
              aria-pressed={viewMode === 'list'}
            >
              <List className="mr-2 h-4 w-4" /> List View
            </Button>
            <Button 
              variant={viewMode === 'map' ? 'default' : 'outline'} 
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
            >
              <Map className="mr-2 h-4 w-4" /> Map View
            </Button>
          </div>

          {viewMode === 'list' ? (
            <PropertyList properties={filteredProperties} isLoading={isLoading} tenantLoggedIn={tenantLoggedIn} />
          ) : (
            <MapViewPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}
