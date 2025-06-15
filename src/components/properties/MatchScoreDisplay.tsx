import type { Property, TenantProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, User, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface MatchScoreDisplayProps {
  property: Property;
  tenantProfile?: TenantProfile; // Optional: if not provided, shows generic message
}

const MatchScoreDisplay: React.FC<MatchScoreDisplayProps> = ({ property, tenantProfile }) => {
  // This component would typically get the match score from property.aiData.matchScore
  // For this mock, we use the score if available, or show a placeholder.
  const matchScoreData = property.aiData?.matchScore;

  if (!tenantProfile) {
    return (
       <Card className="bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline text-accent">
            <User className="mr-2 h-6 w-6" /> Property Match Score
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Alert>
            <User className="h-4 w-4" />
            <AlertTitle>Log In for Personalized Score</AlertTitle>
            <AlertDescription>
              <a href="/login" className="underline">Log in</a> or <a href="/register" className="underline">create a profile</a> to see how well this property matches your preferences.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  if (!matchScoreData) {
     return (
      <Card  className="bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline text-accent">
            <User className="mr-2 h-6 w-6" /> Your Match Score
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Alert variant="default">
             <BarChart className="h-4 w-4" />
            <AlertTitle>Match Score Not Available</AlertTitle>
            <AlertDescription>
              We couldn't calculate a match score for this property with your profile at the moment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  let scoreColor = "hsl(var(--primary))";
  if (matchScoreData.score < 50) scoreColor = "hsl(var(--destructive))";
  else if (matchScoreData.score < 75) scoreColor = "hsl(var(--chart-4))";


  return (
    <Card className="bg-accent/5 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline text-accent">
          <CheckCircle className="mr-2 h-6 w-6" /> Your Match Score for this Property
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-5xl font-bold" style={{color: scoreColor}}>{matchScoreData.score}%</p>
          <p className="text-muted-foreground text-sm">Compatibility Score</p>
        </div>
        <Progress value={matchScoreData.score} className="w-full h-3 [&>div]:bg-[--score-color]" style={{ "--score-color": scoreColor } as React.CSSProperties} />
        
        <div>
          <h4 className="font-semibold text-foreground mb-1">AI Reasoning:</h4>
          <p className="text-sm text-muted-foreground italic bg-muted p-3 rounded-md">
            "{matchScoreData.reasoning}"
          </p>
        </div>

         {tenantProfile && (
           <div>
              <h4 className="font-semibold text-foreground mb-1">Based on Your Preferences:</h4>
              <div className="text-sm text-muted-foreground space-y-1 bg-muted p-3 rounded-md">
                <p><strong>Budget:</strong> {tenantProfile.budget.min.toLocaleString()} - {tenantProfile.budget.max.toLocaleString()} {tenantProfile.budget.currency}</p>
                <p><strong>Locations:</strong> {tenantProfile.preferredLocations.join(', ')}</p>
                <p><strong>Property Types:</strong> {tenantProfile.propertyPreferences.types.join(', ')}</p>
                <p><strong>Key Amenities:</strong> {tenantProfile.propertyPreferences.amenities.slice(0,3).join(', ')}{tenantProfile.propertyPreferences.amenities.length > 3 ? '...' : ''}</p>
              </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchScoreDisplay;
