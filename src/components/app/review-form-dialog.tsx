
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/ui/star-rating";
import type { Review } from "@/lib/types";
import { addOrUpdateReview } from "@/lib/firebase/reviews";
import { auth } from "@/lib/firebase";


const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(1000),
});

type ReviewFormDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hotelId: string;
  existingReview: Review | null;
  onSave: () => void;
};

export function ReviewFormDialog({ isOpen, setIsOpen, hotelId, existingReview, onSave }: ReviewFormDialogProps) {
  const { toast } = useToast();
  const isEditMode = existingReview !== null;
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (existingReview) {
          form.reset({
            rating: existingReview.rating,
            comment: existingReview.comment,
          });
        } else {
          form.reset({
            rating: 0,
            comment: "",
          });
        }
    }
  }, [existingReview, form, isOpen]);

  function onSubmit(values: z.infer<typeof reviewSchema>) {
    startTransition(async () => {
        if (!auth.currentUser) {
            toast({ title: "Authentication Error", description: "You must be logged in to leave a review.", variant: "destructive" });
            return;
        }
        try {
          const result = await addOrUpdateReview(
            hotelId,
            auth.currentUser.uid,
            values.rating,
            values.comment,
            isEditMode
          );
          
          if (result.success) {
            toast({ title: "Success", description: `Your review has been ${isEditMode ? 'updated' : 'submitted'}.` });
            onSave();
            setIsOpen(false);
          } else {
            throw new Error(result.error || "Failed to submit review.");
          }
        } catch (error) {
          console.error("Failed to submit review:", error);
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
          toast({
            title: "Error Submitting Review",
            description: errorMessage,
            variant: "destructive",
          });
        }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Your Review" : "Write a Review"}</DialogTitle>
          <DialogDescription>
            Share your experience with this hotel. Your feedback helps others.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <StarRating rating={field.value} onRatingChange={field.onChange} size={24} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What did you like or dislike?" {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : (isEditMode ? "Update Review" : "Submit Review")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
