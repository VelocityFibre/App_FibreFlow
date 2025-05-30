"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ModuleOverviewLayout from "@/components/ModuleOverviewLayout";
import ModuleOverviewCard from "@/components/ModuleOverviewCard";
import ActionButton from "@/components/ActionButton";
import { FiPackage, FiTruck, FiBarChart2 } from 'react-icons/fi';

export default function MaterialsPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  
  // If no specific view is selected, show the overview layout
  if (!view) {
    return (
      <ModuleOverviewLayout 
        title="Materials Management" 
        description="Manage inventory, track materials, and monitor stock levels"
        actions={<ActionButton label="View Inventory" variant="outline" href="/materials?view=inventory" />}
      >
        <ModuleOverviewCard
          title="Inventory Management"
          description="Track and manage your materials inventory, add new items, and update stock levels."
          actionLabel="View Inventory"
          actionLink="/materials?view=inventory"
          icon={<FiPackage size={24} className="text-primary" />}
        />
        <ModuleOverviewCard
          title="Suppliers"
          description="Manage your suppliers, track orders, and maintain supplier relationships."
          actionLabel="View Suppliers"
          actionLink="/materials?view=suppliers"
          icon={<FiTruck size={24} className="text-primary" />}
        />
        <ModuleOverviewCard
          title="Reports"
          description="Generate reports on inventory levels, material usage, and supplier performance."
          actionLabel="View Reports"
          actionLink="/materials?view=reports"
          icon={<FiBarChart2 size={24} className="text-primary" />}
        />
      </ModuleOverviewLayout>
    );
  }
  
  // For specific views, we'll show a placeholder for now
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#003049] dark:text-white">
          {view === 'inventory' && 'Inventory Management'}
          {view === 'suppliers' && 'Suppliers'}
          {view === 'reports' && 'Reports'}
        </h2>
        <ActionButton
          label="Back to Overview"
          variant="outline"
          href="/materials"
        />
      </div>
      
      <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] p-6 text-center">
        <p className="text-gray-700 dark:text-gray-200 mb-4">
          This feature is currently under development.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Check back soon for updates to the {view} module.
        </p>
      </div>
    </div>
  );
}
