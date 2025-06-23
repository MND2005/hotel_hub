import React from 'react';
import { CustomerHeader } from '@/components/app/customer-header';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <CustomerHeader />
      <main className="flex-1">{children}</main>
      <footer className="bg-secondary/50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tri-Sided Hub. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
