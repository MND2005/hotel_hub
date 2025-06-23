'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, Map, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/customer', label: 'Explore', icon: Map },
  { href: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/customer/profile', label: 'Profile', icon: User },
];

export function CustomerHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/customer" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-primary sm:inline-block">
              Tri-Sided Hub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/customer" className="mr-6 flex items-center space-x-2 mb-6">
                 <span className="font-bold text-primary">Tri-Sided Hub</span>
              </Link>
              <nav className="grid gap-4">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn('flex items-center gap-2 rounded-md p-2 text-lg font-semibold',
                            pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/80'
                        )}
                    >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
            <Button asChild variant="secondary">
                <Link href="/">Logout</Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
