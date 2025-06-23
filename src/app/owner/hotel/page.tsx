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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const hotelDetailsSchema = z.object({
  address: z.string().min(10, "Address must be at least 10 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
});

export default function HotelPage() {
  const form = useForm<z.infer<typeof hotelDetailsSchema>>({
    resolver: zodResolver(hotelDetailsSchema),
    defaultValues: {
      address: "123 Enchanted Way, Magical Kingdom, Fantasyland 12345",
      description: "A cozy and charming establishment located in the heart of a vibrant city, offering a unique blend of comfort and local culture. Perfect for travelers seeking an authentic experience."
    },
  });

  function onSubmit(values: z.infer<typeof hotelDetailsSchema>) {
    console.log(values);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Hotel Details</CardTitle>
                <CardDescription>
                  Manage your hotel's information. Name and contact details are managed by administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown" {...field} />
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
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="hotel-status">Hotel Open/Closed</Label>
                    <p className="text-sm text-muted-foreground">
                      When closed, your hotel will not be visible to customers on the map.
                    </p>
                  </div>
                  <Switch id="hotel-status" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Pin your hotel's location on the map.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 rounded-lg overflow-hidden border">
               <Image
                  src="https://placehold.co/800x600.png"
                  alt="Map placeholder"
                  data-ai-hint="city map"
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button>Choose Location on Map</Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
