import type { Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface FairPriceAnalysisProps {
  property: Property;
}

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
};

const FairPriceAnalysis: React.FC<FairPriceAnalysisProps> = ({ property }) => {
  const fairPriceData = property.aiData?.fairPrice;

  if (!fairPriceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" /> Fair Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Analysis Not Available</AlertTitle>
            <AlertDescription>
              Fair price analysis for this property is currently unavailable.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const priceDifference = property.price - fairPriceData.suggestedPrice;
  const percentageDifference = (priceDifference / fairPriceData.suggestedPrice) * 100;
  let priceBadgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  let priceBadgeText = "Fairly Priced";

  if (percentageDifference > 10) { // More than 10% above suggested
    priceBadgeVariant = "destructive";
    priceBadgeText = "Above Market";
  } else if (percentageDifference < -10) { // More than 10% below suggested
    priceBadgeVariant = "default"; // Use default for potentially good deal
    priceBadgeText = "Below Market";
  }


  return (
    <Card className="bg-primary/5 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline text-primary">
          <Lightbulb className="mr-2 h-6 w-6" /> Fair Price Indicator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-background rounded-lg border">
            <div>
                <p className="text-sm text-muted-foreground">AI Suggested Fair Price</p>
                <p className="text-2xl font-bold text-primary">
                    {formatPrice(fairPriceData.suggestedPrice, property.currency)}
                </p>
            </div>
            <Badge variant={priceBadgeVariant} className="px-3 py-1 text-sm">{priceBadgeText}</Badge>
        </div>
        
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-accent" />AI Reasoning:</h4>
          <p className="text-sm text-muted-foreground italic bg-muted p-3 rounded-md">
            "{fairPriceData.priceJustification}"
          </p>
        </div>
        {property.marketTrends && (
           <div>
              <h4 className="font-semibold text-foreground mb-1">Market Context Provided:</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {property.marketTrends}
              </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FairPriceAnalysis;
