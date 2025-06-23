
'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, BedDouble, Utensils, ArrowLeft } from "lucide-react";

export default function HotelManagementLayout({
  children,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const componentParams = useParams();
  const hotelId = componentParams.id as string;

  const navLinks = [
    { href: `/owner/hotels/${hotelId}`, label: 'Details', icon: Hotel, exact: true },
    { href: `/owner/hotels/${hotelId}/rooms`, label: 'Rooms', icon: BedDouble },
    { href: `/owner/hotels/${hotelId}/menu`, label: 'Menu', icon: Utensils },
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/owner/hotels">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to hotels</span>
                </Link>
            </Button>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Manage Hotel</h2>
                <p className="text-muted-foreground truncate">Update details, rooms, and menu for Hotel #{hotelId}</p>
            </div>
       </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-lg">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <nav className="grid gap-1">
                    {navLinks.map(link => {
                       const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                       return (
                         <Link key={link.href} href={link.href}>
                             <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                                 <link.icon className="mr-2 h-4 w-4" />
                                 {link.label}
                             </Button>
                         </Link>
                       )
                    })}
                </nav>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
            {children}
        </div>
      </div>
    </div>
  );
}
