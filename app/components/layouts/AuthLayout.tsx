import Link from 'next/link';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-12 flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 font-semibold">
          ← Back to Home
        </Link>
      </div>
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-8 backdrop-blur">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-gray-400 mb-8">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
