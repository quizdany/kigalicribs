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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registerLandlord, updateLandlordProfile } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  companyName: z.string().optional(),
  businessLicense: z.string().optional(),
  experience: z.string().min(1, { message: "Please describe your property management experience." }),
  propertiesOwned: z.coerce.number().min(0, { message: "Number of properties must be 0 or greater." }),
  additionalInfo: z.string().max(500, "Additional information too long").optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export type LandlordRegistrationFormData = z.infer<typeof formSchema>;

interface LandlordRegistrationFormProps {
  editable?: boolean;
  initialData?: Partial<LandlordRegistrationFormData>;
  onSuccess?: () => void | Promise<void>;
}

function sanitizeFormValues(values: any) {
  const sanitized: any = {};
  for (const key in values) {
    if (values[key] === null || values[key] === undefined) {
      // If the key is a number field, default to 0
      if (["propertiesOwned"].includes(key)) {
        sanitized[key] = 0;
      } else if (Array.isArray(values[key])) {
        sanitized[key] = [];
      } else {
        sanitized[key] = "";
      }
    } else if (Array.isArray(values[key])) {
      sanitized[key] = values[key];
    } else if (typeof values[key] === 'object') {
      sanitized[key] = sanitizeFormValues(values[key]);
    } else {
      sanitized[key] = values[key];
    }
  }
  return sanitized;
}

export default function LandlordRegistrationForm({ editable = false, initialData, onSuccess }: LandlordRegistrationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<LandlordRegistrationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: sanitizeFormValues(initialData || {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      companyName: "",
      businessLicense: "",
      experience: "",
      propertiesOwned: 0,
      additionalInfo: "",
    }),
  });

  async function onSubmit(values: LandlordRegistrationFormData) {
    try {
      if (editable) {
        // Update profile logic (to be implemented in actions)
        // @ts-ignore
        const result = await updateLandlordProfile(values);
        if (result.success) {
          toast({ title: "Profile Updated!", description: "Your profile has been updated." });
          if (onSuccess) await onSuccess();
        }
      } else {
        const result = await registerLandlord(values);
        if (result.success) {
          setIsSubmitted(true);
          form.reset();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center text-green-600">Registration Successful!</CardTitle>
          <CardDescription className="text-center">
            Please check your email to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              We've sent a verification email to your inbox. Please click the verification link in the email to activate your account.
            </p>
            <p className="text-sm text-gray-500">
              If you don't see the email, check your spam folder.
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Register Another Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Create Your Landlord Profile</CardTitle>
        <CardDescription>Join our platform to list and manage your properties effectively.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +250 7XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="propertiesOwned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Properties Owned</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Doe Properties Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business License Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., BL123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Management Experience</FormLabel>
                  <FormDescription>Tell us about your experience in property management and rental operations.</FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I have been managing rental properties for 5 years, specializing in residential apartments in Kigali..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormDescription>Any other information you'd like to share about your properties or management style.</FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I prefer long-term tenants and offer flexible payment options..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full md:w-auto">{editable ? "Save" : "Register"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 