
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
import { Star } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "next-auth/react";

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required.").max(5, "Rating must be between 1 and 5."),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000, "Comment is too long."),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface SubmitReviewFormProps {
  propertyId: string;
}

export default function SubmitReviewForm({ propertyId }: SubmitReviewFormProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const tenantName = session?.user?.name || "Tenant";

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  async function onSubmit(values: ReviewFormData) {
    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          rating: values.rating,
          comment: values.comment,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit review.',
          variant: 'destructive',
        });
        console.error('API error:', result.error);
      } else {
        toast({
          title: 'Review Submitted!',
          description: 'Thank you for your feedback.',
        });
        form.reset();
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || JSON.stringify(error) || 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
      console.error('Review submission error (catch):', error);
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
