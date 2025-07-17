"use client";

import { useState, useEffect, useCallback } from 'react';
import PropertyFilters, { Filters } from '@/components/properties/PropertyFilters';
import PropertyList from '@/components/properties/PropertyList';
import MapViewPlaceholder from '@/components/properties/MapViewPlaceholder';
import type { Property } from '@/types';
import { SELECT_ANY_VALUE } from '@/types';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';
import { fetchAllProperties } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location') || '';
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [tenantLoggedIn, setTenantLoggedIn] = useState(false);
  const [filterState, setFilterState] = useState<Filters>({ location: locationParam });
  // Remove dynamic price range logic and set static range for RWF
  const priceRange = { min: 100000, max: 2000000 };

  useEffect(() => {
    setTenantLoggedIn(Math.random() > 0.5);
    setIsLoading(true);
    fetchAllProperties()
      .then(data => {
        setAllProperties(data || []);
        setFilteredProperties(data || []);
        // Set initial price range based on data
        if (data && data.length > 0) {
          const minRWF = Math.min(...data.filter(p => p.currency === 'RWF').map(p => p.price));
          const maxRWF = Math.max(...data.filter(p => p.currency === 'RWF').map(p => p.price));
          const minUSD = Math.min(...data.filter(p => p.currency === 'USD').map(p => p.price));
          const maxUSD = Math.max(...data.filter(p => p.currency === 'USD').map(p => p.price));
          // Fix: If min == max, expand the range for slider usability
          let min = minRWF || 0;
          let max = maxRWF || 1000000;
          if (min === max) {
            min = Math.max(0, min - 100000);
            max = max + 100000;
          }
          // setPriceRange({ min, max }); // This line is removed as per the edit hint
        } else {
          // setPriceRange({ min: 0, max: 1000000 }); // This line is removed as per the edit hint
        }
      })
      .catch(err => {
        setAllProperties([]);
        setFilteredProperties([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Update price range when currency changes
  useEffect(() => {
    if (!allProperties.length) return;
    const currency = filterState.priceCurrency || 'RWF';
    const filtered = allProperties.filter(p => (p.currency || '').toUpperCase() === currency.toUpperCase());
    if (filtered.length > 0) {
      let min = Math.min(...filtered.map(p => p.price));
      let max = Math.max(...filtered.map(p => p.price));
      // Fix: If min == max, expand the range for slider usability
      if (min === max) {
        min = Math.max(0, min - 100000);
        max = max + 100000;
      }
      // setPriceRange({ min, max }); // This line is removed as per the edit hint
    } else {
      // setPriceRange({ min: 0, max: 1000000 }); // This line is removed as per the edit hint
    }
  }, [filterState.priceCurrency, allProperties]);

  // Robust filter logic, auto-apply on filter change
  useEffect(() => {
      let results = allProperties;
    const filters = filterState;
      if (filters.searchTerm) {
        results = results.filter(p => 
        (p.title?.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
         p.description?.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
        );
      }
      if (filters.location && filters.location !== SELECT_ANY_VALUE) {
      results = results.filter(p =>
        (p.location?.toLowerCase() === filters.location?.toLowerCase())
      );
      }
      if (filters.propertyType && filters.propertyType !== SELECT_ANY_VALUE) {
      results = results.filter(p =>
        (p.propertyType?.toLowerCase() === filters.propertyType?.toLowerCase() ||
         p.property_type?.toLowerCase() === filters.propertyType?.toLowerCase())
      );
      }
      if (filters.bedrooms && filters.bedrooms > 0) {
      results = results.filter(p =>
        (p.bedrooms >= filters.bedrooms || p['bedrooms'] >= filters.bedrooms)
      );
      }
      if (filters.bathrooms && filters.bathrooms > 0) {
      results = results.filter(p =>
        (p.bathrooms >= filters.bathrooms || p['bathrooms'] >= filters.bathrooms)
      );
      }
      if (filters.minPrice !== undefined && filters.priceCurrency) {
      results = results.filter(p =>
        (p.currency?.toUpperCase() === filters.priceCurrency?.toUpperCase() && p.price >= filters.minPrice!)
      );
      }
      if (filters.maxPrice !== undefined && filters.priceCurrency) {
      results = results.filter(p =>
        (p.currency?.toUpperCase() === filters.priceCurrency?.toUpperCase() && p.price <= filters.maxPrice!)
      );
      }
      if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(p =>
        Array.isArray(p.amenities) && filters.amenities!.some(a => p.amenities.includes(a))
      );
      }
      setFilteredProperties(results);
      setIsLoading(false);
  }, [filterState, allProperties]);

  // Handler for filter changes (auto-apply)
  const handleFilterChange = (filters: Filters) => {
    setFilterState(filters);
  };

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
          <PropertyFilters onFilterChange={handleFilterChange} minPrice={priceRange.min} maxPrice={priceRange.max} initialFilters={{ ...filterState, location: locationParam }} />
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
