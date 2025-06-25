
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, firebaseNotConfiguredError } from "@/lib/firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const user = await signIn(values.email, values.password);
      
      if (!db) {
        throw new Error(firebaseNotConfiguredError);
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        switch (userData.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'owner':
            router.push('/owner');
            break;
          case 'customer':
            router.push('/customer');
            break;
          default:
            router.push('/');
        }
      } else {
        throw new Error("User data not found in Firestore.");
      }
    } catch (error: any) {
      console.error("Login failed", error);
      let description = "An unexpected error occurred. Please try again.";

      if (error.message === firebaseNotConfiguredError || error?.code === 'auth/invalid-api-key') {
        description = firebaseNotConfiguredError;
      } else if (error?.code === 'auth/invalid-credential') {
        description = "The email or password you entered is incorrect. Please double-check your credentials and try again.";
      } else if (error?.code === 'auth/configuration-not-found') {
        description = "Firebase Authentication is not configured. Please enable Email/Password sign-in in your Firebase project console.";
      } else if (error.message === "User data not found in Firestore.") {
        description = "Could not find your user profile. Please try signing up again or contact support if the issue persists.";
      }
      
      toast({
        title: "Login Failed",
        description: description,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
