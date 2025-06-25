
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Hotel, DollarSign, LogOut, ShoppingBag } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';

const links = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: Home },
  { href: '/owner/hotels', label: 'My Hotels', icon: Hotel },
  { href: '/owner/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/owner/withdrawals', label: 'Withdrawals', icon: DollarSign },
];

export function OwnerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

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
    <>
      <SidebarMenu>
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href}>
              <SidebarMenuButton
                isActive={pathname.startsWith(link.href)}
                className={cn('w-full justify-start')}
              >
                <link.icon className="h-5 w-5 mr-3" />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <div className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton onClick={handleLogout} className="w-full justify-start">
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </>
  );
}
