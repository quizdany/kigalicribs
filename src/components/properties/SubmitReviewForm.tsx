
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { addReviewToProperty } from "@/lib/mockData"; // Assuming this can be called client-side for mock
import { Star } from "lucide-react";
import { useState } from "react"; // Needed if we implement interactive stars

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required.").max(5, "Rating must be between 1 and 5."),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000, "Comment is too long."),
  // tenantName: z.string().min(2, "Name is required."), // Assuming name comes from logged-in user context
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface SubmitReviewFormProps {
  propertyId: string;
}

export default function SubmitReviewForm({ propertyId }: SubmitReviewFormProps) {
  const { toast } = useToast();
  // Mock tenant name - in a real app, this would come from authentication context
  const mockTenantName = "Demo User"; 

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  function onSubmit(values: ReviewFormData) {
    try {
      // Simulate adding review to mock data
      const newReview = addReviewToProperty(propertyId, {
        tenantName: mockTenantName, // Use mock or context-derived name
        rating: values.rating,
        comment: values.comment,
      });

      if (newReview) {
        toast({
          title: "Review Submitted!",
          description: "Thank you for your feedback.",
        });
        form.reset();
        // In a real app with server actions, revalidation would occur, or router.refresh() could be used here if needed from client.
        // For mock data and `noStore()` on parent, data should be fresh on next load/refresh.
      } else {
         toast({
          title: "Error",
          description: "Property not found for review.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Leave a Review</CardTitle>
        <CardDescription>Share your experience with this property.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                   <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map(num => (
                        <SelectItem key={num} value={String(num)}>
                          <div className="flex items-center">
                            {num} <Star className="w-4 h-4 ml-1 text-amber-400 fill-amber-400" />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience, what you liked or disliked..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">Submit Review</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
