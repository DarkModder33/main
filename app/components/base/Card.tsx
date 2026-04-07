import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'ghost';
}

const variants = {
  default: 'bg-gray-900/50 border border-gray-800 rounded-xl p-6',
  bordered: 'border-2 border-cyan-500/30 rounded-xl p-6 bg-gradient-to-br from-cyan-950/20 to-black',
  ghost: 'rounded-xl p-6',
};

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  return (
    <div className={`${variants[variant]} transition-all hover:border-cyan-500/50 ${className}`}>
      {children}
    </div>
  );
}
