"use client";
import GridDataTable from "./GridDataTable";

export default function GridPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <GridDataTable />
      </div>
    </div>
  );
}