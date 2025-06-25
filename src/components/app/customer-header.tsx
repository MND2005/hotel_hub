
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Menu, User, Map, ShoppingBag, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUser } from '@/lib/firebase/users';
import type { User as AppUser } from '@/lib/types';
import { signOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/customer', label: 'Explore', icon: Map },
  { href: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userData = await getUser(currentUser.uid);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data in header", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
      toast({
        title: "Logout Failed",
        description: "An unexpected error occurred during logout.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/customer" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-primary sm:inline-block">
              Cosmo SL
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
            <SheetContent side="left" className="flex flex-col">
              <SheetClose asChild>
                <Link href="/customer" className="flex items-center space-x-2 mb-4">
                  <span className="font-bold text-primary">Tri-Sided Hub</span>
                </Link>
              </SheetClose>
              <div className="flex-1">
                <nav className="grid gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn('flex items-center gap-3 rounded-md p-2 text-base font-semibold',
                            pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/80'
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
              <div className="mt-auto">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : user ? (
                  <>
                    <Separator className="my-2" />
                    <SheetClose asChild>
                      <Link href="/customer/profile" className={cn('flex items-center gap-3 rounded-md p-2 text-base font-semibold w-full text-left',
                        pathname === '/customer/profile' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/80')}>
                          <User className="h-5 w-5" />
                          Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <div onClick={handleLogout} className="flex items-center gap-3 rounded-md p-2 text-base font-semibold text-muted-foreground hover:bg-accent/80 cursor-pointer w-full text-left">
                            <LogOut className="h-5 w-5" />
                            Logout
                        </div>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild>
                      <Button onClick={() => router.push('/login')} className="w-full">
                          Login
                      </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {loading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/customer/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push('/login')} variant="secondary">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
