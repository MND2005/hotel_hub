
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Map from "@/components/app/map";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const hotelDetailsSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().min(1, "Address is required."),
  description: z.string().min(1, "Description is required."),
  latitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  longitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  isOpen: z.boolean().default(true),
});

// In a real app, you would fetch this data
const getHotelData = async (id: string) => {
    console.log(`Fetching data for hotel ${id}...`);
    // Mock data for now
    return {
        name: `Hotel #${id}`,
        address: "123 Mock St, Colombo",
        description: "A wonderful place to stay.",
        latitude: 7.8731,
        longitude: 80.7718,
        isOpen: true,
    }
}

export default function HotelDetailsPage() {
  const params = useParams();
  const hotelId = params.id as string;
  
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
    },
  });

  useEffect(() => {
    if (hotelId) {
        getHotelData(hotelId).then(data => {
            if (data) {
                form.reset(data);
                setMarkerPosition({ lat: data.latitude, lng: data.longitude });
            }
        });
    }
  }, [hotelId, form]);

  function onSubmit(values: z.infer<typeof hotelDetailsSchema>) {
    console.log("Updating Hotel Data:", values);
    // Here you would typically call a function to update the data in your database
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
            <Button type="submit">Save Changes</Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
