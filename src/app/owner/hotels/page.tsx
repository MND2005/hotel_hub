
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Hotel, MapPin } from "lucide-react";
import Image from "next/image";

// Mock data, will be replaced with real data
const hotels: any[] = [];

export default function OwnerHotelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Hotels</h2>
          <p className="text-muted-foreground">
            Manage all your properties from one place.
          </p>
        </div>
        <Button asChild>
          <Link href="/owner/hotels/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Hotel
          </Link>
        </Button>
      </div>
      {hotels.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20">
          <CardHeader className="text-center">
            <Hotel className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No Hotels Yet</CardTitle>
            <CardDescription>
              Start by adding your first hotel to the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/owner/hotels/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Hotel
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden transition-all hover:shadow-lg">
              <Link href={`/owner/hotels/${hotel.id}`}>
                <CardHeader className="p-0 relative h-48 w-full">
                    <Image src={"https://placehold.co/600x400.png"} data-ai-hint="hotel exterior" alt={hotel.name} layout="fill" objectFit="cover" />
                </CardHeader>
                <CardContent className="p-4">
                    <CardTitle className="mb-2 truncate">{hotel.name}</CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button className="w-full">Manage Hotel</Button>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
