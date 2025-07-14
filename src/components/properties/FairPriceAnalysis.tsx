"use client";

import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lightbulb } from 'lucide-react';

interface FairPriceAnalysisProps {
  property: {
    title: string;
    description: string;
    location: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    amenities?: string[];
    price: number;
    currency: string;
    propertyType: string;
    address: string;
};
}

export default function FairPriceAnalysis({ property }: FairPriceAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [fairPrice, setFairPrice] = useState<number | null>(null);
  const [justification, setJustification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFairPrice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/fair-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyFeatures: `${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.area} sqm, amenities: ${(property.amenities || []).join(', ')}, type: ${property.propertyType}`,
            locationDetails: `${property.location}, ${property.address}`,
            marketTrends: '', // The backend will gather market data from the web
          }),
        });
        if (!res.ok) throw new Error('Failed to fetch fair price');
        const data = await res.json();
        setFairPrice(data.suggestedPrice);
        setJustification(data.priceJustification);
      } catch (err: any) {
        setError('Unable to fetch fair price at this time.');
      } finally {
        setLoading(false);
      }
    }
    fetchFairPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  return (
    <Alert className="bg-primary/5 border-primary/30">
      <Lightbulb className="h-6 w-6 text-primary mr-2 inline-block" />
      <AlertTitle>AI Fair Pricing Indicator</AlertTitle>
      {loading ? (
        <div className="flex items-center gap-2 mt-2"><Loader2 className="animate-spin h-5 w-5" /> Analyzing market data...</div>
      ) : error ? (
        <AlertDescription className="text-destructive mt-2">{error}</AlertDescription>
      ) : fairPrice !== null ? (
        <AlertDescription className="mt-2">
          <span className="font-bold text-primary">Suggested Price:</span> {property.currency} {fairPrice.toLocaleString()}<br />
          <span className="text-muted-foreground text-sm">{justification}</span>
        </AlertDescription>
      ) : null}
    </Alert>
  );
}
