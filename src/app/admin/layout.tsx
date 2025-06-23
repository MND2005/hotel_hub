import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AdminNav } from '@/components/app/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-sidebar-primary" />
              <h2 className="text-xl font-bold text-sidebar-foreground">Admin</h2>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <AdminNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center h-14 px-4 border-b bg-background/80 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <h1 className="text-lg font-semibold md:text-xl">Admin Portal</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
