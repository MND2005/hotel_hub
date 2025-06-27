
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
import { ImageUploader } from "@/components/app/image-uploader";
import { uploadImage } from "@/lib/firebase/storage";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

// Using the same schema as the owner page, as the details are the same.
const hotelDetailsSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().min(1, "Address is required."),
  description: z.string().min(1, "Description is required."),
  latitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  longitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  isOpen: z.boolean().default(true),
  imageUrls: z.array(z.union([z.string(), z.instanceof(File)]))
    .min(1, "At least one image is required.")
    .max(5, "You can upload a maximum of 5 images."),
});

export default function AdminEditHotelPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const hotelId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
  const [hotelName, setHotelName] = useState('');
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
      imageUrls: [],
    },
  });

  const fetchHotelData = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      // Admin can get any hotel
      const data = await getHotel(hotelId);
      if (data) {
        form.reset({ ...data, imageUrls: data.imageUrls || [] });
        setMarkerPosition({ lat: data.latitude, lng: data.longitude });
        setHotelName(data.name);
      } else {
        toast({
            title: "Error",
            description: "Hotel not found.",
            variant: "destructive"
        });
        router.push('/admin/hotels');
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchHotelData();
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [fetchHotelData, router]);

  async function onSubmit(values: z.infer<typeof hotelDetailsSchema>) {
    if (!auth.currentUser) {
        toast({ title: "Authentication Error", description: "You must be logged in as an admin.", variant: "destructive" });
        return;
    }

    try {
        const existingUrls = values.imageUrls.filter((item): item is string => typeof item === 'string');
        const newFiles = values.imageUrls.filter((item): item is File => item instanceof File);

        const uploadPromises = newFiles.map(file => 
            uploadImage(file, 'uploads')
        );
        const newUrls = await Promise.all(uploadPromises);

        const payload = {
          ...values,
          imageUrls: [...existingUrls, ...newUrls],
        };

        // Admin updates the hotel
        await updateHotel(hotelId, payload);
        toast({
            title: "Success",
            description: "Hotel details updated successfully."
        });
        form.reset({ ...form.getValues(), imageUrls: payload.imageUrls });
        setHotelName(payload.name);

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
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
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
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/hotels">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to hotels</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Hotel: {hotelName}</h2>
          <p className="text-muted-foreground">Modify details for Hotel ID: {hotelId}</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
              <CardHeader>
              <CardTitle>Hotel Details</CardTitle>
              <CardDescription>
                  Update the hotel's details and location.
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

              <FormField
                control={form.control}
                name="imageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Images</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onChange={field.onChange}
                        maxFiles={5}
                        label="PNG, JPG, GIF up to 10MB"
                      />
                    </FormControl>
                    <FormDescription>
                      Upload up to 5 images for your hotel gallery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </div>
  );
}
