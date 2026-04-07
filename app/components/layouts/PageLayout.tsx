import { ShamrockFooter } from '@/components/shamrock/ShamrockFooter';
import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  footer?: boolean;
}

export function PageLayout({ children, className = '', footer = true }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-950 to-black ${className}`}>
      <main className="flex-1">
        {children}
      </main>
      {footer && <ShamrockFooter />}
    </div>
  );
}
