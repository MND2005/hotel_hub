import Image from "next/image";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Map from "@/components/app/map";

const hotels: any[] = [];

export default function CustomerExplorePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Stay</h1>
        <p className="text-muted-foreground">
          Explore hotels near you for room bookings and food orders.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <Map className="overflow-hidden h-[500px]" />
        </div>

        <div className="lg:col-span-3 mt-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Hotels Near You</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {hotels.length === 0 ? (
                    <div className="lg:col-span-4 text-center text-muted-foreground py-10">
                        No hotels found near you.
                    </div>
                ) : hotels.map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                        <Link href={`/customer/hotels/${hotel.id}`}>
                            <CardHeader className="p-0">
                                <div className="relative h-48 w-full">
                                <Image src={hotel.imageUrl} data-ai-hint={hotel.aiHint} alt={`Hotel ${hotel.id}`} layout="fill" objectFit="cover" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold">{hotel.rating}</span>
                                </div>
                                <Badge variant="secondary">{hotel.distance}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                An exclusive hotel, identified as Hotel #{hotel.id}.
                                </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button className="w-full">View Details</Button>
                            </CardFooter>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
