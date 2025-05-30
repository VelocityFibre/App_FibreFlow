"use client";

import React from 'react';
import Link from 'next/link';

interface ModuleOverviewCardProps {
  title: string;
  description: string;
  actionLabel: string;
  actionLink: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function ModuleOverviewCard({
  title,
  description,
  actionLabel,
  actionLink,
  icon,
  className = '',
}: ModuleOverviewCardProps) {
  return (
    <div className={`bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] ${className}`}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          {icon && <div className="mr-3 text-[#003049] dark:text-blue-300">{icon}</div>}
          <h3 className="text-lg font-medium text-[#003049] dark:text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-6">{description}</p>
        <Link 
          href={actionLink}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#003049] text-white text-sm font-medium rounded-md hover:bg-[#00406a] transition-colors"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
