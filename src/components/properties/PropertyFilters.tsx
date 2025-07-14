
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { propertyTypes, kigaliLocations, amenityList, currencies, SELECT_ANY_VALUE } from "@/types";
import { Filter, RotateCcw } from "lucide-react";

export interface Filters {
  searchTerm?: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  priceCurrency?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

interface PropertyFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
  minPrice?: number;
  maxPrice?: number;
}

const defaultFilters: Filters = {
  searchTerm: "",
  location: "", 
  propertyType: "", 
  minPrice: 0,
  maxPrice: 600000, // Default max price for RWF
  priceCurrency: "RWF",
  bedrooms: 0, 
  bathrooms: 0, 
  amenities: [],
};

export default function PropertyFilters({ onFilterChange, initialFilters, minPrice, maxPrice }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters || defaultFilters);

  // Sync local slider values with parent minPrice/maxPrice
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      minPrice: minPrice,
      maxPrice: maxPrice,
    }));
  }, [minPrice, maxPrice]);

  // Notify parent only after filters state changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Filters, value: string | number) => {
    if (name === 'priceCurrency') {
      const currencyValue = String(value);
      setFilters(prev => ({ 
        ...prev, 
        [name]: currencyValue,
        minPrice: minPrice ?? (currencyValue === 'USD' ? 0 : 0),
        maxPrice: maxPrice ?? (currencyValue === 'USD' ? 10000 : 1000000),
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handlePriceRangeChange = (value: [number, number]) => {
    setFilters(prev => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFilters(prev => {
      const currentAmenities = prev.amenities || [];
      if (checked) {
        return { ...prev, amenities: [...currentAmenities, amenity] };
      } else {
        return { ...prev, amenities: currentAmenities.filter(a => a !== amenity) };
      }
    });
  };

  const handleResetFilters = () => {
    setFilters(prev => ({
      ...defaultFilters,
      minPrice: minPrice,
      maxPrice: maxPrice,
    }));
  };

  const currentMinPriceForSlider = minPrice ?? (filters.priceCurrency === 'USD' ? 0 : 0);
  const currentMaxPriceForSlider = maxPrice ?? (filters.priceCurrency === 'USD' ? 10000 : 1000000);
  const currentStepForSlider = filters.priceCurrency === 'USD' ? 50 : 50000;

  const priceCurrencyValue = currencies.includes(filters.priceCurrency as string) ? (filters.priceCurrency as string) : 'RWF';
  const locationValue = kigaliLocations.includes(filters.location as string) ? (filters.location as string) : '';
  const propertyTypeValue = propertyTypes.includes(filters.propertyType as string) ? (filters.propertyType as string) : '';
  const bedroomsValue = String(filters.bedrooms ?? 0);
  const bathroomsValue = String(filters.bathrooms ?? 0);

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg space-y-6 sticky top-20">
      <h3 className="text-xl font-semibold flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Filter Properties</h3>
      
      <Input
        name="searchTerm"
        placeholder="Search by keyword (e.g. modern, spacious)"
        value={filters.searchTerm ?? ''}
        onChange={handleInputChange}
        className="h-10"
      />

      <Accordion type="multiple" defaultValue={['location', 'type', 'price']} className="w-full">
        <AccordionItem value="location">
          <AccordionTrigger className="text-base">Location</AccordionTrigger>
          <AccordionContent>
            <Select
              name="location"
              value={locationValue !== undefined ? locationValue : ''}
              onValueChange={(value) => handleSelectChange("location", value)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Any Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ANY_VALUE}>Any Location</SelectItem>
                {kigaliLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger className="text-base">Property Type</AccordionTrigger>
          <AccordionContent>
            <Select
              name="propertyType"
              value={propertyTypeValue || ''}
              onValueChange={(value) => handleSelectChange("propertyType", value)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SELECT_ANY_VALUE}>Any Type</SelectItem>
                {propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base">Price Range</AccordionTrigger>
          <AccordionContent className="space-y-4">
             <Select
              name="priceCurrency"
              value={priceCurrencyValue as string || 'RWF'}
              onValueChange={(value) => handleSelectChange("priceCurrency", value as string)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(curr => <SelectItem key={curr} value={curr}>{curr}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.minPrice?.toLocaleString()} {filters.priceCurrency}</span>
              <span>{filters.maxPrice?.toLocaleString()} {filters.priceCurrency}</span>
            </div>
            <Slider
              value={[filters.minPrice ?? currentMinPriceForSlider, filters.maxPrice ?? currentMaxPriceForSlider]}
              onValueChange={handlePriceRangeChange}
              min={currentMinPriceForSlider}
              max={currentMaxPriceForSlider}
              step={currentStepForSlider}
              className="my-4"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rooms">
          <AccordionTrigger className="text-base">Bedrooms & Bathrooms</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                name="bedrooms"
                value={bedroomsValue}
                onValueChange={(value) => handleSelectChange("bedrooms", parseInt(value))}
              >
                <SelectTrigger id="bedrooms" className="w-full h-10">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2,3,4,5,6].map(b => <SelectItem key={b} value={String(b)}>{b === 0 ? 'Any' : `${b}+`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select
                name="bathrooms"
                value={bathroomsValue}
                onValueChange={(value) => handleSelectChange("bathrooms", parseInt(value))}
              >
                <SelectTrigger id="bathrooms" className="w-full h-10">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2,3,4,5].map(b => <SelectItem key={b} value={String(b)}>{b === 0 ? 'Any' : `${b}+`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="amenities">
          <AccordionTrigger className="text-base">Amenities</AccordionTrigger>
          <AccordionContent className="space-y-2 max-h-60 overflow-y-auto">
            {amenityList.map(amenity => ( 
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity.replace(/\s+/g, '-')}`}
                  checked={filters.amenities?.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                />
                <Label htmlFor={`amenity-${amenity.replace(/\s+/g, '-')}`} className="font-normal">{amenity}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4"/> Reset
        </Button>
      </div>
    </div>
  );
}