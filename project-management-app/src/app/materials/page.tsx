"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ModuleOverviewLayout from "@/components/ModuleOverviewLayout";
import ModuleOverviewCard from "@/components/ModuleOverviewCard";
import ActionButton from "@/components/ActionButton";
import { FiPackage, FiTruck, FiBarChart2, FiPlus, FiSearch, FiFilter, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { supabase } from "@/lib/supabaseClient";

// Mock data for materials inventory (replace with Supabase data when tables are created)
const mockMaterials = [
  { id: '1', name: 'Fiber Optic Cable - 12 Core', sku: 'FOC-12C-001', category: 'Cable', unit: 'meters', quantity: 2500, min_stock: 1000, location: 'Warehouse A', status: 'In Stock' },
  { id: '2', name: 'Fiber Optic Cable - 24 Core', sku: 'FOC-24C-001', category: 'Cable', unit: 'meters', quantity: 1800, min_stock: 1500, location: 'Warehouse A', status: 'In Stock' },
  { id: '3', name: 'SC Connector', sku: 'CON-SC-001', category: 'Connector', unit: 'pieces', quantity: 500, min_stock: 200, location: 'Warehouse B', status: 'In Stock' },
  { id: '4', name: 'LC Connector', sku: 'CON-LC-001', category: 'Connector', unit: 'pieces', quantity: 150, min_stock: 300, location: 'Warehouse B', status: 'Low Stock' },
  { id: '5', name: 'Splice Closure - 48 Core', sku: 'SPL-48C-001', category: 'Equipment', unit: 'pieces', quantity: 25, min_stock: 50, location: 'Warehouse A', status: 'Critical' },
  { id: '6', name: 'Drop Cable - 2 Core', sku: 'DRP-2C-001', category: 'Cable', unit: 'meters', quantity: 5000, min_stock: 3000, location: 'Warehouse C', status: 'In Stock' },
  { id: '7', name: 'Distribution Box - 8 Port', sku: 'DST-8P-001', category: 'Equipment', unit: 'pieces', quantity: 45, min_stock: 30, location: 'Warehouse B', status: 'In Stock' },
  { id: '8', name: 'Fiber Patch Cord - 3m', sku: 'FPC-3M-001', category: 'Cable', unit: 'pieces', quantity: 200, min_stock: 100, location: 'Warehouse C', status: 'In Stock' },
];

// Inventory View Component
function InventoryView() {
  const [materials, setMaterials] = useState(mockMaterials);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter materials based on search and filters
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalItems: materials.length,
    lowStock: materials.filter(m => m.status === 'Low Stock').length,
    criticalStock: materials.filter(m => m.status === 'Critical').length,
    totalValue: materials.reduce((sum, m) => sum + m.quantity, 0),
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#003049] dark:text-white">
            Inventory Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your materials inventory
          </p>
        </div>
        <div className="flex space-x-3">
          <ActionButton
            label="Export Inventory"
            variant="outline"
            onClick={() => {}}
            icon={<FiDownload className="h-4 w-4" />}
          />
          <ActionButton
            label="Add Material"
            variant="primary"
            onClick={() => {}}
            icon={<FiPlus className="h-4 w-4" />}
          />
          <ActionButton
            label="Back to Overview"
            variant="outline"
            href="/materials"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Items</p>
              <p className="text-3xl font-bold text-[#003049] dark:text-white mt-2">{stats.totalItems}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <FiPackage className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.lowStock}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <FiAlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Critical Stock</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.criticalStock}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Quantity</p>
              <p className="text-3xl font-bold text-[#003049] dark:text-white mt-2">{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <FiBarChart2 className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003049]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003049]"
            >
              <option value="all">All Categories</option>
              <option value="Cable">Cable</option>
              <option value="Connector">Connector</option>
              <option value="Equipment">Equipment</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#003049]"
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {material.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {material.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {material.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {material.quantity} {material.unit}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {material.min_stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {material.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      material.status === 'In Stock' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : material.status === 'Low Stock'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {material.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
  
  // Handle inventory view
  if (view === 'inventory') {
    return <InventoryView />;
  }

  // For other specific views, show placeholder
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#003049] dark:text-white">
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
