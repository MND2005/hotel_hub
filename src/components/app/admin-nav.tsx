
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Hotel, Users, DollarSign, LogOut, ShoppingBag, MessageSquare } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/hotels', label: 'Hotels', icon: Hotel },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
];

export function AdminNav() {
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
