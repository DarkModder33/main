import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Section({ children, className = '', title, subtitle }: SectionProps) {
  return (
    <section className={`py-12 sm:py-16 md:py-20 ${className}`}>
      {title && (
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
