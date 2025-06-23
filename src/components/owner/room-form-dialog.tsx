
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

const roomSchema = z.object({
  type: z.string().min(1, "Room type is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  capacity: z.coerce.number().int().positive("Capacity must be a positive integer."),
  isAvailable: z.boolean().default(true),
  imageUrls: z.array(z.any()).max(2, "You can upload a maximum of 2 images.").refine(
    (urls) => urls.filter(Boolean).length > 0, { message: "At least one image is required."}
  ),
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
      isAvailable: true,
      imageUrls: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && room) {
        form.reset({ ...room, imageUrls: room.imageUrls || [] });
      } else {
        form.reset({
            type: "",
            price: 0,
            capacity: 1,
            isAvailable: true,
            imageUrls: [],
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
          uploadImage(file, `hotels/${hotelId}/rooms`)
      );
      const newUrls = await Promise.all(uploadPromises);

      const finalImageUrls = [...existingUrls, ...newUrls];

      const roomPayload = {
        ...values,
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
      toast({
        title: "Error",
        description: "Failed to save room. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Room" : "Add New Room"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of your room." : "Fill in the details for the new room."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    <FormLabel>Available for Booking</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
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
