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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { amenityList, propertyTypesList, currenciesList, kigaliLocationsList, type PropertyFormData, type Property } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MomoPaymentGate from './MomoPaymentGate';
import { useState, useEffect } from 'react';
import CloudinaryImageUpload from './CloudinaryImageUpload';
import { useSession } from 'next-auth/react';
import { createPropertyListingSupabase, updateProperty, mapFormDataToDb } from '@/lib/actions';

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title too long."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(1000, "Description too long."),
  price: z.coerce.number().positive("Price must be positive."),
  currency: z.enum(currenciesList, { required_error: "Currency is required."}),
  location: z.enum(kigaliLocationsList, { required_error: "Location is required."}),
  address: z.string().min(5, "Address must be at least 5 characters."),
  propertyType: z.enum(propertyTypesList, { required_error: "Property type is required."}),
  bedrooms: z.coerce.number().min(0).max(20, "Too many bedrooms"),
  bathrooms: z.coerce.number().min(0).max(20, "Too many bathrooms"),
  area: z.coerce.number().positive("Area must be positive."),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string()).min(1, "At least one photo is required."),
  agentName: z.string().min(2, "Contact name is required."),
  agentEmail: z.string().email("Invalid email."),
  agentPhone: z.string().min(7, "Contact phone is required."),
  otherImportantDetails: z.string().max(500).optional(),
});

interface PropertyFormProps {
  property?: Property;
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [pendingValues, setPendingValues] = useState<PropertyFormData | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [listingInProgress, setListingInProgress] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: property
      ? {
          title: property.title || '',
          description: property.description || '',
          price: property.price || 0,
          currency: (property.currency as typeof currenciesList[number]) || currenciesList[0],
          location: (property.location as typeof kigaliLocationsList[number]) || kigaliLocationsList[0],
          address: property.address || '',
          propertyType: (property.propertyType as typeof propertyTypesList[number]) || (property.property_type as typeof propertyTypesList[number]) || propertyTypesList[0],
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1,
          area: property.area || 0,
          amenities: property.amenities || [],
          photos: property.photos || [],
          agentName: property.agentName || property.agent_name || '',
          agentEmail: property.agentEmail || property.agent_email || '',
          agentPhone: property.agentPhone || property.agent_phone || '',
          otherImportantDetails: '',
        }
      : {
          title: '',
          description: '',
          price: 0,
          currency: currenciesList[0],
          location: kigaliLocationsList[0],
          address: '',
          propertyType: propertyTypesList[0],
          bedrooms: 1,
          bathrooms: 1,
          area: 0,
          amenities: [],
          photos: [],
          agentName: '',
          agentEmail: '',
          agentPhone: '',
          otherImportantDetails: '',
        },
  });

  // Reset form when property changes (for edit mode)
  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title || '',
        description: property.description || '',
        price: property.price || 0,
        currency: (property.currency as typeof currenciesList[number]) || currenciesList[0],
        location: (property.location as typeof kigaliLocationsList[number]) || kigaliLocationsList[0],
        address: property.address || '',
        propertyType: (property.propertyType as typeof propertyTypesList[number]) || (property.property_type as typeof propertyTypesList[number]) || propertyTypesList[0],
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        area: property.area || 0,
        amenities: property.amenities || [],
        photos: property.photos || [],
        agentName: property.agentName || property.agent_name || '',
        agentEmail: property.agentEmail || property.agent_email || '',
        agentPhone: property.agentPhone || property.agent_phone || '',
        otherImportantDetails: '',
      });
    }
  }, [property]);

  async function onSubmit(values: PropertyFormData) {
    if (property && property.id) {
      // Edit mode: update existing property
      try {
        const mappedData = await mapFormDataToDb(values);
        await updateProperty(property.id, mappedData);
        toast({
          title: 'Property Updated!',
          description: 'Your property has been successfully updated.',
        });
        // Optionally, redirect or refresh here
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update property. Please try again.',
          variant: 'destructive',
        });
        console.error('Property update error:', error);
      }
    } else {
      // New listing
      setPendingValues(values);
      setShowPayment(true);
    }
  }

  async function handlePaymentComplete() {
    if (!pendingValues || listingInProgress) return;
    setListingInProgress(true);
    try {
      const landlordId = session?.user?.id;
      await createPropertyListingSupabase(pendingValues, landlordId);
      toast({
        title: 'Property Listed!',
        description: 'Your property has been successfully listed.',
      });
      form.reset();
      setThankYou(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to list property. Please try again.',
        variant: 'destructive',
      });
      console.error('Property listing error:', error);
    } finally {
      setShowPayment(false);
      setPendingValues(null);
      setListingInProgress(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{property ? 'Edit Property' : 'List Your Property'}</CardTitle>
        <CardDescription>{property ? 'Update your property details below.' : 'Provide details about your property to reach potential tenants.'}</CardDescription>
      </CardHeader>
      <CardContent>
        {thankYou ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Thank you for your payment!</h2>
            <p className="mb-4">Your property is being listed...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Modern 2-Bedroom Apartment in Kiyovu" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of your property..." rows={5} value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1200" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={v => field.onChange(v ?? currenciesList[0])} defaultValue={typeof field.value === 'string' ? field.value : currenciesList[0]}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currenciesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Neighborhood)</FormLabel>
                       <Select onValueChange={v => field.onChange(v ?? kigaliLocationsList[0])} defaultValue={typeof field.value === 'string' ? field.value : kigaliLocationsList[0]}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kigaliLocationsList.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., KG 123 St, House 45" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={v => field.onChange(v ?? propertyTypesList[0])} defaultValue={typeof field.value === 'string' ? field.value : propertyTypesList[0]}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypesList.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sqm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormDescription>Select all available amenities.</FormDescription>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {amenityList.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
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
                            <FormLabel className="font-normal">{amenity}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Photos</FormLabel>
                    <FormDescription>Upload images of your property. You can upload multiple images.</FormDescription>
                    <FormControl>
                      <CloudinaryImageUpload value={field.value || []} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-lg font-semibold pt-4 border-t">Owner/Contact Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="agentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                control={form.control}
                  name="agentEmail"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Owner Contact Email</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., johndoe@email.com" type="email" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                  name="agentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., +250 788 123 456" type="tel" value={field.value ?? ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <h3 className="text-lg font-semibold pt-4 border-t">Other Important Details (Optional)</h3>
               <FormField
                control={form.control}
                name="otherImportantDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Important Details</FormLabel>
                    <FormDescription>Optionally add any other information you think is important for tenants to know.</FormDescription>
                    <FormControl>
                      <Textarea placeholder="e.g., No pets allowed, available from August, parking for 2 cars, etc." value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full md:w-auto">{property ? 'Save Changes' : 'List Property'}</Button>
            </form>
          </Form>
        )}
        {showPayment && !property && !thankYou && (
          <MomoPaymentGate fee={2000} context="list" onPaymentComplete={handlePaymentComplete} />
        )}
      </CardContent>
    </Card>
  );
}
