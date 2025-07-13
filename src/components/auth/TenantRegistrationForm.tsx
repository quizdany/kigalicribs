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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { amenityList, propertyTypes, kigaliLocations, currencies } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registerTenant, updateTenantProfile } from "@/lib/actions"; // Assuming server action
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password." }),
  phone: z.string().optional(),
  budgetMin: z.coerce.number().min(0, { message: "Minimum budget must be positive." }),
  budgetMax: z.coerce.number().min(0, { message: "Maximum budget must be positive." }),
  budgetCurrency: z.enum(currencies as [string, ...string[]], { required_error: "Budget currency is required."}),
  preferredLocations: z.array(z.string()).min(1, { message: "Select at least one preferred location." }),
  propertyTypes: z.array(z.string()).min(1, { message: "Select at least one property type." }),
  minBedrooms: z.coerce.number().min(0).max(10),
  minBathrooms: z.coerce.number().min(0).max(10),
  preferredAmenities: z.array(z.string()).optional(),
  additionalNotes: z.string().max(500, "Notes too long").optional(),
}).refine(data => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget cannot be less than minimum budget.",
  path: ["budgetMax"],
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export type TenantRegistrationFormData = z.infer<typeof formSchema>;

interface TenantRegistrationFormProps {
  editable?: boolean;
  initialData?: Partial<TenantRegistrationFormData>;
  onSuccess?: () => void | Promise<void>;
}

function sanitizeFormValues(values: any): TenantRegistrationFormData {
  return {
    fullName: values.fullName ?? "",
    email: values.email ?? "",
    password: values.password ?? "",
    confirmPassword: values.confirmPassword ?? "",
    phone: values.phone ?? "",
    budgetMin: values.budgetMin ?? 0,
    budgetMax: values.budgetMax ?? 0,
    budgetCurrency: values.budgetCurrency ?? "RWF",
    preferredLocations: Array.isArray(values.preferredLocations) ? values.preferredLocations : [],
    propertyTypes: Array.isArray(values.propertyTypes) ? values.propertyTypes : [],
    minBedrooms: values.minBedrooms ?? 0,
    minBathrooms: values.minBathrooms ?? 0,
    preferredAmenities: Array.isArray(values.preferredAmenities) ? values.preferredAmenities : [],
    additionalNotes: values.additionalNotes ?? "",
  };
}

export default function TenantRegistrationForm({ editable = false, initialData, onSuccess }: TenantRegistrationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<TenantRegistrationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: sanitizeFormValues(initialData || {}),
  });

  async function onSubmit(values: TenantRegistrationFormData) {
    try {
      if (editable) {
        // Update profile logic (to be implemented in actions)
        // @ts-ignore
        const result = await updateTenantProfile(values);
        if (result.success) {
          toast({ title: "Profile Updated!", description: "Your profile has been updated." });
          if (onSuccess) await onSuccess();
        }
      } else {
        const result = await registerTenant(values);
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
        <CardTitle className="text-2xl font-headline">Create Your Tenant Profile</CardTitle>
        <CardDescription>Tell us what you're looking for, and we'll help you find the perfect match.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +250 7XX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t">Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="budgetMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Budget</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 300000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Budget</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'RWF'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-semibold pt-4 border-t">Preferences</h3>
             <FormField
                control={form.control}
                name="preferredLocations"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred Locations in Kigali</FormLabel>
                    <FormDescription>Select all that apply.</FormDescription>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {kigaliLocations.map((location) => (
                      <FormField
                        key={location}
                        control={form.control}
                        name="preferredLocations"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(location)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), location])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== location
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {location}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
                control={form.control}
                name="propertyTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Property Types</FormLabel>
                     <FormDescription>Select all types you are interested in.</FormDescription>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {propertyTypes.map((type) => (
                      <FormField
                        key={type}
                        control={form.control}
                        name="propertyTypes"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), type])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== type
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minBedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Bedrooms</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value ?? 0)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={String(n)}>{n === 0 ? "Any" : `${n}+`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minBathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Bathrooms</FormLabel>
                     <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value ?? 0)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={String(n)}>{n === 0 ? "Any" : `${n}+`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferredAmenities"
              render={() => (
                <FormItem>
                  <FormLabel>Preferred Amenities</FormLabel>
                  <FormDescription>Select any amenities you particularly desire.</FormDescription>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {amenityList.slice(0,9).map((amenity) => ( // Show a subset for brevity
                    <FormField
                      key={amenity}
                      control={form.control}
                      name="preferredAmenities"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), amenity])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== amenity
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {amenity}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other specific requirements or preferences?"
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
