"use client";

import { useState } from "react";
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
import { propertyTypes, kigaliLocations, amenityList, currencies } from "@/types";
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
}

const defaultFilters: Filters = {
  searchTerm: "",
  location: "",
  propertyType: "",
  minPrice: 0,
  maxPrice: 5000000, // Default max RWF or equivalent USD
  priceCurrency: "RWF",
  bedrooms: 0, // 0 means any
  bathrooms: 0, // 0 means any
  amenities: [],
};

export default function PropertyFilters({ onFilterChange, initialFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters || defaultFilters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [name]: value }));
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
  
  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg space-y-6 sticky top-20">
      <h3 className="text-xl font-semibold flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Filter Properties</h3>
      
      <Input
        name="searchTerm"
        placeholder="Search by keyword (e.g. modern, spacious)"
        value={filters.searchTerm}
        onChange={handleInputChange}
        className="h-10"
      />

      <Accordion type="multiple" defaultValue={['location', 'type', 'price']} className="w-full">
        <AccordionItem value="location">
          <AccordionTrigger className="text-base">Location</AccordionTrigger>
          <AccordionContent>
            <Select
              name="location"
              value={filters.location}
              onValueChange={(value) => handleSelectChange("location", value)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Any Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Location</SelectItem>
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
              value={filters.propertyType}
              onValueChange={(value) => handleSelectChange("propertyType", value)}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Type</SelectItem>
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
              value={filters.priceCurrency}
              onValueChange={(value) => handleSelectChange("priceCurrency", value)}
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
              value={[filters.minPrice || 0, filters.maxPrice || (filters.priceCurrency === 'USD' ? 5000 : 5000000)]}
              onValueChange={handlePriceRangeChange}
              max={filters.priceCurrency === 'USD' ? 10000 : 10000000}
              step={filters.priceCurrency === 'USD' ? 50 : 50000}
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
                value={String(filters.bedrooms)}
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
                value={String(filters.bathrooms)}
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
            {amenityList.slice(0,10).map(amenity => ( // Show a subset
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={filters.amenities?.includes(amenity)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                />
                <Label htmlFor={`amenity-${amenity}`} className="font-normal">{amenity}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <Button onClick={handleApplyFilters} className="w-full sm:w-auto flex-1">Apply Filters</Button>
        <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4"/> Reset
        </Button>
      </div>
    </div>
  );
}
