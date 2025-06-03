"use client";

import React from 'react';
import Link from 'next/link';

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export default function ActionButton({
  label,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
}: ActionButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary-600 text-white border-transparent';
      case 'secondary':
        return 'bg-secondary hover:bg-secondary-600 text-white border-transparent';
      case 'outline':
        return 'bg-transparent hover:bg-primary-50 text-primary border-primary-300';
      default:
        return 'bg-primary hover:bg-primary-600 text-white border-transparent';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-5 py-2.5 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={buttonClasses}>
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}
