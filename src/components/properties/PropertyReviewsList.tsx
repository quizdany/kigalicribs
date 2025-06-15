
"use client";

import type { Review } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PropertyReviewsListProps {
  reviews: Review[];
}

const StarRatingDisplay = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/50'}`}
        />
      ))}
    </div>
  );
};

const PropertyReviewsList: React.FC<PropertyReviewsListProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No reviews yet for this property. Be the first to leave one!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                {/* In a real app, user might have an avatar image */}
                {/* <AvatarImage src={review.userAvatarUrl} alt={review.tenantName} /> */}
                <AvatarFallback>
                  <UserCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-md font-semibold">{review.tenantName}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                </p>
              </div>
            </div>
            <StarRatingDisplay rating={review.rating} />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 whitespace-pre-line">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyReviewsList;
