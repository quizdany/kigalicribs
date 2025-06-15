
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
import { amenityList, propertyTypes, kigaliLocations, currencies, type PropertyFormData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createPropertyListing } from "@/lib/actions"; 
import { addPropertyToMockData } from "@/lib/mockData"; // For prototype: add to client-side mock data
import { UploadCloud } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title too long."),
  description: z.string().min(20, "Description must be at least 20 characters.").max(1000, "Description too long."),
  price: z.coerce.number().positive("Price must be positive."),
  currency: z.enum(currencies as [string, ...string[]], { required_error: "Currency is required."}),
  location: z.enum(kigaliLocations as [string, ...string[]], { required_error: "Location is required."}),
  address: z.string().min(5, "Address must be at least 5 characters."),
  propertyType: z.enum(propertyTypes as [string, ...string[]], { required_error: "Property type is required."}),
  bedrooms: z.coerce.number().min(0).max(20, "Too many bedrooms"),
  bathrooms: z.coerce.number().min(0).max(20, "Too many bathrooms"),
  area: z.coerce.number().positive("Area must be positive."),
  amenities: z.array(z.string()).optional(),
  photos: z.array(z.string()).min(1, "At least one photo URL is required.").optional(), // For now, simple URL input
  agentName: z.string().optional(),
  agentEmail: z.string().email("Invalid email.").optional(),
  agentPhone: z.string().optional(),
  featuresForAI: z.string().min(10, "Please provide key features for AI analysis.").max(500).optional(),
  marketTrendsForAI: z.string().min(10, "Please provide market context for AI analysis.").max(500).optional(),
});

export default function PropertyForm() {
  const { toast } = useToast();
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      currency: "RWF",
      location: kigaliLocations[0],
      address: "",
      propertyType: propertyTypes[0],
      bedrooms: 1,
      bathrooms: 1,
      area: 0,
      amenities: [],
      photos: [],
      agentName: "",
      agentEmail: "",
      agentPhone: "",
      featuresForAI: "",
      marketTrendsForAI: "",
    },
  });

  async function onSubmit(values: PropertyFormData) {
    try {
      // For prototype: add to client-side mock data for immediate feedback
      addPropertyToMockData(values); 
      
      // Intended server action call (currently logs to console)
      await createPropertyListing(values); 

      toast({
        title: "Property Listed!",
        description: "Your property has been successfully listed (in mock data for now).",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list property. Please try again.",
        variant: "destructive",
      });
      console.error("Property listing error:", error);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">List Your Property</CardTitle>
        <CardDescription>Provide details about your property to reach potential tenants.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Modern 2-Bedroom Apartment in Kiyovu" {...field} />
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
                    <Textarea placeholder="Detailed description of your property..." rows={5} {...field} />
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
                      <Input type="number" placeholder="e.g., 1200" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kigaliLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
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
                      <Input placeholder="e.g., KG 123 St, House 45" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
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
                      <Input type="number" placeholder="e.g., 3" {...field} />
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
                      <Input type="number" placeholder="e.g., 2" {...field} />
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
                      <Input type="number" placeholder="e.g., 150" {...field} />
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
                  <FormDescription>Enter URLs for photos, one per line. (Placeholder for file upload)</FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.split('\n').map(url => url.trim()).filter(url => url))}
                      value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                      rows={3}
                    />
                  </FormControl>
                  <div className="mt-2 p-4 border border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground">
                    <UploadCloud className="w-10 h-10 mb-2" />
                    <p>Drag & drop or click to upload (feature coming soon)</p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-semibold pt-4 border-t">Owner/Contact Information (Optional)</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="agentName" render={({ field }) => ( <FormItem> <FormLabel>Name</FormLabel> <FormControl><Input placeholder="Owner or Contact Name" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="agentEmail" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="agentPhone" render={({ field }) => ( <FormItem> <FormLabel>Phone</FormLabel> <FormControl><Input type="tel" placeholder="+250 7XX XXX XXX" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t">AI Pricing Assist (Optional)</h3>
             <FormField
              control={form.control}
              name="featuresForAI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Property Features for AI</FormLabel>
                  <FormDescription>Summarize distinct features, e.g., "newly renovated, panoramic view, quiet street".</FormDescription>
                  <FormControl>
                    <Textarea placeholder="e.g., Renovated kitchen, large balcony with city view, 24/7 security" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="marketTrendsForAI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Market Context for AI</FormLabel>
                  <FormDescription>Briefly describe current market trends or comparable properties in the area.</FormDescription>
                  <FormControl>
                    <Textarea placeholder="e.g., High demand for 2-bedrooms in this area, similar units rent for $1000-$1200." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full md:w-auto">List Property</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
