
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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { addHotel } from "@/lib/firebase/hotels";
import { auth } from "@/lib/firebase";
import { ImageUploader } from "@/components/app/image-uploader";
import { uploadImage } from "@/lib/firebase/storage";


const addHotelSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().min(1, "Address is required."),
  description: z.string().min(1, "Description is required."),
  latitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  longitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  isOpen: z.boolean().default(true),
  imageUrls: z.array(z.instanceof(File, { message: "Please upload valid image files." }))
    .min(1, "At least one image is required.")
    .max(5, "You can upload a maximum of 5 images."),
});

export default function AddHotelPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
  const sriLankaCenter = { lat: 7.8731, lng: 80.7718 };

  const form = useForm<z.infer<typeof addHotelSchema>>({
    resolver: zodResolver(addHotelSchema),
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

  async function onSubmit(values: z.infer<typeof addHotelSchema>) {
    if (!auth.currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a hotel.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadPromises = values.imageUrls.map(file => 
        uploadImage(file, 'uploads')
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      await addHotel({
        name: values.name,
        address: values.address,
        description: values.description,
        latitude: values.latitude,
        longitude: values.longitude,
        isOpen: values.isOpen,
        imageUrls: uploadedUrls,
      });
      
      toast({
        title: "Hotel Added",
        description: "Your new hotel has been saved successfully.",
      });
      router.push("/owner/hotels");

    } catch (error) {
      console.error("Failed to add hotel:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Adding Hotel",
        description: `Failed to add hotel. ${errorMessage}`,
        variant: "destructive",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Add a New Hotel</CardTitle>
                <CardDescription>
                  Fill in the details and select your hotel's location on the map.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    name="latitude"
                    render={() => (
                      <FormItem>
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
              <CardFooter className="gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Hotel"}
                </Button>
                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Location</CardTitle>
                <CardDescription>
                  Click on the map to pin your hotel's location.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Map 
                    className="relative w-full h-96 rounded-lg overflow-hidden border" 
                    center={sriLankaCenter}
                    zoom={8}
                    onMapClick={handleMapClick}
                    markerPosition={markerPosition}
                    />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
