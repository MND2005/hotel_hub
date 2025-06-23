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
import { Label } from "@/components/ui/label";
import Map from "@/components/app/map";
import { useState } from "react";

const hotelDetailsSchema = z.object({
  name: z.string().min(1, "Name is required."),
  address: z.string().min(1, "Address is required."),
  description: z.string().min(1, "Description is required."),
  latitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
  longitude: z.number().refine(val => val !== 0, { message: 'Please select a location on the map.' }),
});

export default function HotelPage() {
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
    },
  });

  function onSubmit(values: z.infer<typeof hotelDetailsSchema>) {
    console.log("Submitting Hotel Data:", values);
    // Here you would typically call a function to save the data to your database
  }
  
  const handleMapClick = (e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    form.setValue("latitude", lat, { shouldValidate: true });
    form.setValue("longitude", lng, { shouldValidate: true });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Hotel</CardTitle>
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
                    name="latitude"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="hotel-status">Hotel Open/Closed</Label>
                    <p className="text-sm text-muted-foreground">
                      When closed, your hotel will not be visible to customers.
                    </p>
                  </div>
                  <Switch id="hotel-status" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Hotel</Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
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
  );
}
