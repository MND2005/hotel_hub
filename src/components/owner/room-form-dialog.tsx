
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Room } from "@/lib/types";
import { addRoom, updateRoom } from "@/lib/firebase/rooms";
import { ImageUploader } from "@/components/app/image-uploader";
import { auth } from "@/lib/firebase";
import { uploadImage } from "@/lib/firebase/storage";
import { FeatureInput } from "../app/feature-input";

const roomSchema = z.object({
  type: z.string().min(1, "Room type is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  capacity: z.coerce.number().int().positive("Capacity must be a positive integer."),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative."),
  isAvailable: z.boolean().default(true),
  features: z.array(z.string()).optional(),
  imageUrls: z.array(z.union([z.string(), z.instanceof(File)]))
    .min(1, "At least one image is required.")
    .max(2, "You can upload a maximum of 2 images."),
});

type RoomFormDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hotelId: string;
  room: Room | null;
  onSave: () => void;
};

export function RoomFormDialog({ isOpen, setIsOpen, hotelId, room, onSave }: RoomFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = room !== null;

  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      type: "",
      price: 0,
      capacity: 1,
      quantity: 1,
      isAvailable: true,
      imageUrls: [],
      features: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && room) {
        form.reset({ ...room, imageUrls: room.imageUrls || [], features: room.features || [] });
      } else {
        form.reset({
            type: "",
            price: 0,
            capacity: 1,
            quantity: 1,
            isAvailable: true,
            imageUrls: [],
            features: [],
        });
      }
    }
  }, [isOpen, isEditMode, room, form]);

  async function onSubmit(values: z.infer<typeof roomSchema>) {
    if (!auth.currentUser) {
        toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
        return;
    }
    try {
      const existingUrls = values.imageUrls.filter((item): item is string => typeof item === 'string');
      const newFiles = values.imageUrls.filter((item): item is File => item instanceof File);

      const uploadPromises = newFiles.map(file => 
          uploadImage(file, 'uploads')
      );
      const newUrls = await Promise.all(uploadPromises);

      const finalImageUrls = [...existingUrls, ...newUrls];

      const roomPayload = {
        ...values,
        features: values.features || [],
        imageUrls: finalImageUrls,
        hotelId,
        aiHint: 'hotel room',
      };

      if (isEditMode) {
        await updateRoom(hotelId, room.id, roomPayload);
        toast({ title: "Success", description: "Room updated successfully." });
      } else {
        await addRoom(hotelId, roomPayload);
        toast({ title: "Success", description: "New room added." });
      }
      onSave();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save room:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Saving Room",
        description: `Failed to save room. ${errorMessage}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your room." : "Fill in the details for the new room."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Deluxe Double" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price/Night</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Rooms</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormDescription>
                    How many rooms of this type are available?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Features</FormLabel>
                  <FormControl>
                    <FeatureInput value={field.value || []} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    List key features (e.g., AC, Sea View). Press Enter or comma after each.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Images</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={2}
                      label="PNG, JPG, up to 10MB"
                    />
                  </FormControl>
                  <FormDescription>
                    Add up to 2 images for the room.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Listed for Booking</FormLabel>
                    <FormDescription>
                      If off, this room type won't be visible to customers.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
