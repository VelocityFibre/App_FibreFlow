"use client";

import React, { ReactNode } from 'react';

interface ModuleOverviewLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function ModuleOverviewLayout({
  title,
  description,
  actions,
  children,
}: ModuleOverviewLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#003049] dark:text-white">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{description}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
}
