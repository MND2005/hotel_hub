
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@/lib/types";
import { addMenuItem, updateMenuItem } from "@/lib/firebase/menu";
import { ImageUploader } from "@/components/app/image-uploader";
import { uploadImage } from "@/lib/firebase/storage";
import { auth } from "@/lib/firebase";

const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number."),
  category: z.enum(["breakfast", "lunch", "dinner"], {
    required_error: "You need to select a menu category.",
  }),
  imageUrl: z.union([z.string(), z.instanceof(File)]).nullable().optional(),
});

type MenuItemFormDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hotelId: string;
  menuItem: MenuItem | null;
  onSave: () => void;
};

export function MenuItemFormDialog({ isOpen, setIsOpen, hotelId, menuItem, onSave }: MenuItemFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = menuItem !== null;

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
        name: "",
        description: "",
        price: 0,
        imageUrl: null,
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (menuItem) {
          form.reset(menuItem);
        } else {
          form.reset({
            name: "",
            description: "",
            price: 0,
            category: "breakfast",
            imageUrl: null,
          });
        }
    }
  }, [menuItem, form, isOpen]);

  async function onSubmit(values: z.infer<typeof menuItemSchema>) {
    if (!auth.currentUser) {
        toast({ title: "Authentication Error", description: "You are not logged in.", variant: "destructive" });
        return;
    }
    try {
       let finalImageUrl = '';
       const imageValue = values.imageUrl;

       if (typeof imageValue === 'string') {
         finalImageUrl = imageValue;
       } else if (imageValue instanceof File) {
         finalImageUrl = await uploadImage(imageValue, 'uploads');
       }

       const menuItemPayload = {
        name: values.name,
        description: values.description || '',
        price: values.price,
        category: values.category,
        hotelId,
        imageUrl: finalImageUrl,
        aiHint: 'food plate',
      };

      if (isEditMode) {
        await updateMenuItem(hotelId, menuItem.id, menuItemPayload);
        toast({ title: "Success", description: "Menu item updated." });
      } else {
        await addMenuItem(hotelId, menuItemPayload);
        toast({ title: "Success", description: "New item added to menu." });
      }
      onSave();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save menu item:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Error Saving Item",
        description: `Failed to save item. ${errorMessage}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details of this menu item." : "Fill in the details for the new item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pancakes" {...field} />
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
                    <Textarea placeholder="(Optional) A brief description of the item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="9.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <FormControl>
                    <ImageUploader
                      value={field.value ? [field.value] : []}
                      onChange={(files) => field.onChange(files[0] || null)}
                      maxFiles={1}
                      label="PNG, JPG, up to 10MB"
                    />
                  </FormControl>
                  <FormDescription>
                    (Optional) Upload an image of the food item.
                  </FormDescription>
                  <FormMessage />
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
