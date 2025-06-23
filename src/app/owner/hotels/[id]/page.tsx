
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Map from "@/components/app/map";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHotel, updateHotel } from "@/lib/firebase/hotels";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const hotelDetailsSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().min(1, "Address is required."),
  description: z.string().min(1, "Description is required."),
  latitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  longitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  isOpen: z.boolean().default(true),
  imageUrls: z.array(z.string().url("Please enter a valid URL.").or(z.literal(''))).min(5).max(5),
});

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const hotelId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  const form = useForm<z.infer<typeof hotelDetailsSchema>>({
    resolver: zodResolver(hotelDetailsSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      latitude: 0,
      longitude: 0,
      isOpen: true,
      imageUrls: ["", "", "", "", ""],
    },
  });

  const fetchHotelData = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const data = await getHotel(hotelId);
      if (data) {
        const paddedImageUrls = [...(data.imageUrls || [])];
        while (paddedImageUrls.length < 5) {
            paddedImageUrls.push('');
        }
        form.reset({ ...data, imageUrls: paddedImageUrls });
        setMarkerPosition({ lat: data.latitude, lng: data.longitude });
      } else {
        toast({
            title: "Error",
            description: "Hotel not found.",
            variant: "destructive"
        });
        router.push('/owner/hotels');
      }
    } catch (error) {
      console.error("Failed to fetch hotel details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch hotel details. Please try again.",
        variant: "destructive"
      });
    } finally {
        setLoading(false);
    }
  }, [hotelId, form, toast, router]);

  useEffect(() => {
    fetchHotelData();
  }, [fetchHotelData]);

  async function onSubmit(values: z.infer<typeof hotelDetailsSchema>) {
    try {
        const payload = {
          ...values,
          imageUrls: values.imageUrls.filter(url => url.trim() !== '')
        };
        await updateHotel(hotelId, payload);
        toast({
            title: "Success",
            description: "Hotel details updated successfully."
        });
    } catch (error) {
        console.error("Failed to update hotel:", error);
        toast({
            title: "Error",
            description: "Failed to update hotel. Please try again.",
            variant: "destructive"
        });
    }
  }
  
  const handleMapClick = (e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    form.setValue("latitude", lat, { shouldValidate: true });
    form.setValue("longitude", lng, { shouldValidate: true });
  };
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
                 <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
            <CardHeader>
            <CardTitle>Hotel Details</CardTitle>
            <CardDescription>
                Update your hotel's details and location.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hotel Name</FormLabel>
                        <FormControl>
                            <Input placeholder="My Awesome Hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Input placeholder="123 Main St, Colombo" {...field} />
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
                        <FormLabel>Hotel Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Tell us a little about your hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div>
                    <FormLabel>Location</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">Click on the map to update the pin.</p>
                        <Map 
                        className="relative w-full h-64 rounded-lg overflow-hidden border" 
                        center={markerPosition || sriLankaCenter}
                        zoom={markerPosition ? 15 : 8}
                        onMapClick={handleMapClick}
                        markerPosition={markerPosition}
                        />
                    <FormField
                        control={form.control}
                        name="latitude"
                        render={() => (
                        <FormItem>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <FormLabel>Hotel Images</FormLabel>
                <FormDescription>Add up to 5 image URLs for your hotel gallery.</FormDescription>
                {Array.from({ length: 5 }).map((_, index) => (
                <FormField
                    key={index}
                    control={form.control}
                    name={`imageUrls.${index}` as const}
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Input placeholder={`Image URL ${index + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                ))}
            </div>

            <FormField
                control={form.control}
                name="isOpen"
                render={({ field }) => (
                    <FormItem className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <FormLabel>Hotel Open/Closed</FormLabel>
                            <p className="text-sm text-muted-foreground">
                            When closed, your hotel will not be visible to customers.
                            </p>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            </CardContent>
            <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
