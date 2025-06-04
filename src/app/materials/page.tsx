"use client";
import { useState, useMemo } from "react";
import { ChevronDownIcon, PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Material {
  id: string;
  itemNo: string;
  description: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const DEMO_MATERIALS: Material[] = [
  {
    id: "1",
    itemNo: "FC-001",
    description: "Single Mode Fiber Cable 9/125μm",
    category: "Cables",
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    unit: "meters",
    unitCost: 2.50,
    supplier: "FiberTech Solutions",
    location: "Warehouse A-1",
    lastUpdated: "2024-01-15",
    status: "in_stock"
  },
  {
    id: "2",
    itemNo: "FC-002",
    description: "Multi Mode Fiber Cable 50/125μm",
    category: "Cables",
    currentStock: 150,
    minStock: 200,
    maxStock: 1000,
    unit: "meters",
    unitCost: 1.80,
    supplier: "FiberTech Solutions",
    location: "Warehouse A-1",
    lastUpdated: "2024-01-14",
    status: "low_stock"
  },
  {
    id: "3",
    itemNo: "CN-001",
    description: "LC/UPC Connector",
    category: "Connectors",
    currentStock: 0,
    minStock: 50,
    maxStock: 500,
    unit: "pieces",
    unitCost: 15.00,
    supplier: "ConnectPro Ltd",
    location: "Warehouse B-2",
    lastUpdated: "2024-01-13",
    status: "out_of_stock"
  },
  {
    id: "4",
    itemNo: "CN-002",
    description: "SC/APC Connector",
    category: "Connectors",
    currentStock: 245,
    minStock: 50,
    maxStock: 500,
    unit: "pieces",
    unitCost: 18.50,
    supplier: "ConnectPro Ltd",
    location: "Warehouse B-2",
    lastUpdated: "2024-01-12",
    status: "in_stock"
  },
  {
    id: "5",
    itemNo: "SP-001",
    description: "Fiber Splice Protector",
    category: "Splicing",
    currentStock: 75,
    minStock: 100,
    maxStock: 1000,
    unit: "pieces",
    unitCost: 3.25,
    supplier: "SpliceMaster Inc",
    location: "Warehouse C-1",
    lastUpdated: "2024-01-11",
    status: "low_stock"
  },
  {
    id: "6",
    itemNo: "TL-001",
    description: "OTDR (Optical Time Domain Reflectometer)",
    category: "Tools",
    currentStock: 3,
    minStock: 2,
    maxStock: 10,
    unit: "units",
    unitCost: 25000.00,
    supplier: "TestEquip Solutions",
    location: "Tool Storage",
    lastUpdated: "2024-01-10",
    status: "in_stock"
  },
  {
    id: "7",
    itemNo: "TL-002",
    description: "Fusion Splicer",
    category: "Tools",
    currentStock: 1,
    minStock: 2,
    maxStock: 5,
    unit: "units",
    unitCost: 45000.00,
    supplier: "TestEquip Solutions",
    location: "Tool Storage",
    lastUpdated: "2024-01-09",
    status: "low_stock"
  },
  {
    id: "8",
    itemNo: "HD-001",
    description: "Fiber Distribution Panel 24-port",
    category: "Hardware",
    currentStock: 12,
    minStock: 5,
    maxStock: 50,
    unit: "units",
    unitCost: 350.00,
    supplier: "NetworkHardware Co",
    location: "Warehouse D-1",
    lastUpdated: "2024-01-08",
    status: "in_stock"
  }
];

const CATEGORIES = ["All", "Cables", "Connectors", "Splicing", "Tools", "Hardware"];
const SUPPLIERS = ["All", "FiberTech Solutions", "ConnectPro Ltd", "SpliceMaster Inc", "TestEquip Solutions", "NetworkHardware Co"];
const STATUS_FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(DEMO_MATERIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<keyof Material>("itemNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = materials.filter(material => {
      const matchesSearch = 
        material.itemNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
      const matchesSupplier = selectedSupplier === "All" || material.supplier === selectedSupplier;
      
      let matchesStatus = true;
      if (selectedStatus === "In Stock") matchesStatus = material.status === "in_stock";
      else if (selectedStatus === "Low Stock") matchesStatus = material.status === "low_stock";
      else if (selectedStatus === "Out of Stock") matchesStatus = material.status === "out_of_stock";
      
      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortOrder === "asc") {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [materials, searchTerm, selectedCategory, selectedSupplier, selectedStatus, sortBy, sortOrder]);

  const handleSort = (field: keyof Material) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'out_of_stock': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleSave = (id: string) => {
    // In a real app, this would save to database
    console.log('Saving material:', id);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const updateMaterial = (id: string, field: keyof Material, value: string | number) => {
    setMaterials(prev => prev.map(material => 
      material.id === id ? { ...material, [field]: value } : material
    ));
  };

  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      itemNo: "",
      description: "",
      category: "Cables",
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
      unit: "pieces",
      unitCost: 0,
      supplier: "FiberTech Solutions",
      location: "",
      lastUpdated: new Date().toISOString().split('T')[0],
      status: "out_of_stock"
    };
    
    setMaterials(prev => [...prev, newMaterial]);
    setEditingId(newMaterial.id);
    setShowAddForm(false);
  };

  const stockSummary = useMemo(() => {
    const total = materials.length;
    const inStock = materials.filter(m => m.status === 'in_stock').length;
    const lowStock = materials.filter(m => m.status === 'low_stock').length;
    const outOfStock = materials.filter(m => m.status === 'out_of_stock').length;
    
    return { total, inStock, lowStock, outOfStock };
  }, [materials]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Materials Management</h1>
        <button
          onClick={addMaterial}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Material
        </button>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Materials</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stockSummary.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Stock</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stockSummary.inStock}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stockSummary.lowStock}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stockSummary.outOfStock}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Supplier Filter */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {SUPPLIERS.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {STATUS_FILTERS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedSupplier("All");
              setSelectedStatus("All");
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  onClick={() => handleSort('itemNo')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Item No. {sortBy === 'itemNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('description')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('currentStock')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Stock {sortBy === 'currentStock' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Min/Max
                </th>
                <th 
                  onClick={() => handleSort('supplier')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Supplier {sortBy === 'supplier' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {editingId === material.id ? (
                      <input
                        type="text"
                        value={material.itemNo}
                        onChange={(e) => updateMaterial(material.id, 'itemNo', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      material.itemNo
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {editingId === material.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={material.description}
                          onChange={(e) => updateMaterial(material.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={material.unitCost}
                          onChange={(e) => updateMaterial(material.id, 'unitCost', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{material.description}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          ${material.unitCost.toFixed(2)} per {material.unit}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingId === material.id ? (
                      <select
                        value={material.category}
                        onChange={(e) => updateMaterial(material.id, 'category', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {CATEGORIES.filter(cat => cat !== "All").map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {material.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingId === material.id ? (
                      <input
                        type="number"
                        value={material.currentStock}
                        onChange={(e) => updateMaterial(material.id, 'currentStock', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center">
                        {material.status === 'low_stock' && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        )}
                        {material.status === 'out_of_stock' && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="font-medium">{material.currentStock}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">{material.unit}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {editingId === material.id ? (
                      <div className="space-y-1">
                        <input
                          type="number"
                          value={material.minStock}
                          onChange={(e) => updateMaterial(material.id, 'minStock', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={material.maxStock}
                          onChange={(e) => updateMaterial(material.id, 'maxStock', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                          placeholder="Max"
                        />
                      </div>
                    ) : (
                      `${material.minStock} / ${material.maxStock}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingId === material.id ? (
                      <div className="space-y-1">
                        <select
                          value={material.supplier}
                          onChange={(e) => updateMaterial(material.id, 'supplier', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                        >
                          {SUPPLIERS.filter(sup => sup !== "All").map(supplier => (
                            <option key={supplier} value={supplier}>{supplier}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={material.location}
                          onChange={(e) => updateMaterial(material.id, 'location', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                          placeholder="Location"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{material.supplier}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{material.location}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(material.status)}`}>
                      {getStatusText(material.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {editingId === material.id ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSave(material.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(material.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          Reorder
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedMaterials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No materials found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
