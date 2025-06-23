import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hotel, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-primary">Tri-Sided Hub</h1>
      </header>
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary-foreground">
                    Your All-in-One Hospitality Solution
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Seamlessly connect with hotels for room bookings and food orders. Empowering hotel owners and administrators with powerful management tools.
                  </p>
                </div>
              </div>
              <div className="w-full max-w-md mx-auto">
                 <img
                  src="https://placehold.co/600x400.png"
                  alt="Hero"
                  data-ai-hint="hotel illustration"
                  className="rounded-xl object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Who Are You?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose your portal to get started. Each experience is tailored to your needs.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Customer</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Find and book rooms or order food from the best local hotels with ease.
                  </CardDescription>
                  <Button asChild className="mt-4">
                    <Link href="/customer">Explore Now</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Hotel className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Hotel Owner</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Manage your hotel details, room availability, and menus in one place.
                  </CardDescription>
                  <Button asChild className="mt-4">
                    <Link href="/owner">Owner Portal</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Administrator</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Oversee the entire platform, manage users, and handle all operations.
                  </CardDescription>
                  <Button asChild className="mt-4">
                    <Link href="/admin">Admin Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary/50">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tri-Sided Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
