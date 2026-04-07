import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-cyan-500 hover:bg-cyan-600 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
  ghost: 'bg-transparent border border-gray-600 hover:border-gray-400 text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-semibold transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
