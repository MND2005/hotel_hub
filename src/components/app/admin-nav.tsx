'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Hotel, Users, DollarSign, LogOut } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/hotels', label: 'Hotels', icon: Hotel },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
];

export function AdminNav() {
  const pathname = usePathname();

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
             <Link href="/">
                <SidebarMenuButton className="w-full justify-start">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </SidebarMenuButton>
             </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </>
  );
}
