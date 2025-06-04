"use client";
import GridDataTable from "@/components/grid/GridDataTable";

export default function GridPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">Data Grid</h2>
      <div className="w-full max-w-5xl bg-gray-900 rounded-lg p-8 shadow-md border border-gray-800 min-h-[400px] flex items-center justify-center">
        <GridDataTable table="projects" />
      </div>
    </div>
  );
}
