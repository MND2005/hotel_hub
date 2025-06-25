
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, deleteUser } from "firebase/auth";
import { getUser, updateUser, deleteUserDocument } from "@/lib/firebase/users";
import type { User, Order } from "@/lib/types";
import { getOrdersByCustomer } from "@/lib/firebase/orders";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export default function CustomerProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          const [dbUser, userOrders] = await Promise.all([
            getUser(currentUser.uid),
            getOrdersByCustomer(currentUser.uid)
          ]);
          setUserData(dbUser);
          if (dbUser) {
            form.reset({ name: dbUser.name });
          }
          userOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
          setOrders(userOrders);
        } catch (error) {
          console.error("Failed to load profile data", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to load your profile data.' });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [toast, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to update your profile.', variant: 'destructive' });
      return;
    }
    try {
      await updateUser(user.uid, { name: values.name });
      toast({ title: 'Success!', description: 'Your profile has been updated successfully.' });
      setUserData(prev => prev ? { ...prev, name: values.name } : null);
      form.reset(values);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({ title: 'Update Failed', description: 'Could not update your profile. Please try again.', variant: 'destructive' });
    }
  }

  async function handleDeleteAccount() {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsDeleting(true);
    try {
        await deleteUserDocument(user.uid);
        await deleteUser(user);
        toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
        router.push('/');
    } catch (error: any) {
        console.error("Account deletion failed:", error);
        let description = 'Could not delete your account. Please try again.';
        if (error.code === 'auth/requires-recent-login') {
            description = 'This is a sensitive operation. Please log out and log back in before deleting your account.';
        }
        toast({ title: 'Deletion Failed', description, variant: 'destructive' });
    } finally {
        setIsDeleting(false);
    }
  }


  if (loading) {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-24" />
                        </CardFooter>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-7 w-40" />
                             <Skeleton className="h-4 w-56 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={userData?.email || ''} disabled />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Button variant="outline" className="w-full" disabled>Change Password</Button>
                                <p className="text-xs text-muted-foreground">Password changes are not yet supported.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
              </Form>
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            This action is permanent and cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">Delete My Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove all your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>A record of all your transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No order history found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium truncate max-w-[120px]">{order.id}</TableCell>
                                        <TableCell>{format(new Date(order.orderDate), 'PPP')}</TableCell>
                                        <TableCell>${order.total.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
