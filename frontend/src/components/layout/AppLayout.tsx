'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // TODO: Add theme state management here if needed, or pass from a global context
  // For now, assuming dark theme is handled within Sidebar/Header or via globals.css

  return (
    <div className={cn(
      "flex h-screen antialiased",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto p-6",
          "bg-neutral-50 dark:bg-neutral-900"
        )}>
          {/*
            The p-6 (padding) on main might need to be adjusted based on content.
            Consider using a Suspense boundary here for page content if pages do heavy loading.
          */}
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
