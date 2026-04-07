import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  full: 'w-full',
};

export function Container({ children, className = '', size = 'lg' }: ContainerProps) {
  return (
    <div className={`mx-auto px-4 sm:px-6 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}
