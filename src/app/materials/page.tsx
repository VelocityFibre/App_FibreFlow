"use client";
import { useState, useMemo, useEffect } from "react";
import { PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
  projectId?: string;
  projectName?: string;
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
    status: "in_stock",
    projectId: "1",
    projectName: "Downtown Fiber Installation"
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
    status: "low_stock",
    projectId: "2",
    projectName: "Business Park Network"
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
    status: "out_of_stock",
    projectId: "1",
    projectName: "Downtown Fiber Installation"
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
    status: "in_stock",
    projectId: "3",
    projectName: "Residential Area Expansion"
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
    status: "low_stock",
    projectId: "2",
    projectName: "Business Park Network"
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
    status: "low_stock",
    projectId: "5",
    projectName: "Industrial Zone Connection"
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
    status: "in_stock",
    projectId: "4",
    projectName: "City Center Upgrade"
  }
];

const CATEGORIES = ["All", "Cables", "Connectors", "Splicing", "Tools", "Hardware"];
const SUPPLIERS = ["All", "FiberTech Solutions", "ConnectPro Ltd", "SpliceMaster Inc", "TestEquip Solutions", "NetworkHardware Co"];
const STATUS_FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];
const PROJECTS = ["All", "Downtown Fiber Installation", "Business Park Network", "Residential Area Expansion", "City Center Upgrade", "Industrial Zone Connection", "Unassigned"];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(DEMO_MATERIALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [sortBy, setSortBy] = useState<keyof Material>("itemNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const filteredAndSortedMaterials = useMemo(() => {
    const filtered = materials.filter(material => {
      const matchesSearch = 
        material.itemNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
      const matchesSupplier = selectedSupplier === "All" || material.supplier === selectedSupplier;
      
      let matchesStatus = true;
      if (selectedStatus === "In Stock") matchesStatus = material.status === "in_stock";
      else if (selectedStatus === "Low Stock") matchesStatus = material.status === "low_stock";
      else if (selectedStatus === "Out of Stock") matchesStatus = material.status === "out_of_stock";
      
      let matchesProject = true;
      if (selectedProject === "Unassigned") matchesProject = !material.projectName;
      else if (selectedProject !== "All") matchesProject = material.projectName === selectedProject;
      
      return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesProject;
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
  }, [materials, searchTerm, selectedCategory, selectedSupplier, selectedStatus, selectedProject, sortBy, sortOrder]);

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
      case 'in_stock': return 'text-green-700 bg-green-100';
      case 'low_stock': return 'text-yellow-700 bg-yellow-100';
      case 'out_of_stock': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
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
  };

  const stockSummary = useMemo(() => {
    const total = materials.length;
    const inStock = materials.filter(m => m.status === 'in_stock').length;
    const lowStock = materials.filter(m => m.status === 'low_stock').length;
    const outOfStock = materials.filter(m => m.status === 'out_of_stock').length;
    
    return { total, inStock, lowStock, outOfStock };
  }, [materials]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProjectDropdown && !(event.target as Element).closest('.project-selector')) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectDropdown]);

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h1 className="ff-page-title">Materials Management</h1>
        <button
          onClick={addMaterial}
          className="ff-button-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Material
        </button>
      </div>

      {/* Project Selection Section */}
      <section className="ff-section">
        <div className="relative project-selector">
          <label className="ff-label mb-4 block">Filter by Project</label>
          <div className="relative max-w-full">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full ff-card text-left flex items-center justify-between p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-6">
                <div className={`w-4 h-4 rounded-full ${
                  selectedProject === "All" ? 'bg-gray-500' :
                  selectedProject === "Downtown Fiber Installation" ? 'bg-green-500' :
                  selectedProject === "Business Park Network" ? 'bg-blue-500' :
                  selectedProject === "Residential Area Expansion" ? 'bg-yellow-500' :
                  selectedProject === "Unassigned" ? 'bg-red-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-2xl font-light text-foreground mb-2">
                    {selectedProject === "All" ? "All Projects" : selectedProject}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-lg">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      selectedProject === "All" ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedProject === "All" ? "All Materials" : "Project Filter"}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">{filteredAndSortedMaterials.length} material{filteredAndSortedMaterials.length !== 1 ? 's' : ''}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>Inventory Management</span>
                  </div>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${showProjectDropdown ? 'rotate-180' : ''}`}>
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {PROJECTS.map((project) => (
                  <button
                    key={project}
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left p-8 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                      project === selectedProject ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-4 h-4 rounded-full ${
                        project === "All" ? 'bg-gray-500' :
                        project === "Downtown Fiber Installation" ? 'bg-green-500' :
                        project === "Business Park Network" ? 'bg-blue-500' :
                        project === "Residential Area Expansion" ? 'bg-yellow-500' :
                        project === "Unassigned" ? 'bg-red-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-xl font-light text-foreground mb-2">
                          {project === "All" ? "All Projects" : project}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-4">
                          <span className="inline-flex px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-800">
                            Materials Filter
                          </span>
                          <span>•</span>
                          <span>Inventory View</span>
                          <span>•</span>
                          <span>Stock Management</span>
                        </div>
                      </div>
                      {project === selectedProject && (
                        <div className="text-primary">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="ff-card">
          <h3 className="ff-card-subtitle">Total Materials</h3>
          <p className="text-3xl font-light text-gray-900 mt-2">{stockSummary.total}</p>
        </div>
        <div className="ff-card">
          <h3 className="ff-card-subtitle">In Stock</h3>
          <p className="text-3xl font-light text-green-600 mt-2">{stockSummary.inStock}</p>
        </div>
        <div className="ff-card">
          <h3 className="ff-card-subtitle">Low Stock</h3>
          <p className="text-3xl font-light text-yellow-600 mt-2">{stockSummary.lowStock}</p>
        </div>
        <div className="ff-card">
          <h3 className="ff-card-subtitle">Out of Stock</h3>
          <p className="text-3xl font-light text-red-600 mt-2">{stockSummary.outOfStock}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <section className="ff-section">
        <h2 className="ff-section-title">Search & Filters</h2>
        <div className="ff-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ff-input pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ff-input"
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Supplier Filter */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="ff-input"
          >
            {SUPPLIERS.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="ff-input"
          >
            {STATUS_FILTERS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="ff-input"
          >
            {PROJECTS.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedSupplier("All");
              setSelectedStatus("All");
              setSelectedProject("All");
            }}
            className="ff-button-secondary"
          >
            Clear Filters
          </button>
          </div>
        </div>
      </section>

      {/* Materials Table */}
      <section className="ff-section">
        <h2 className="ff-section-title">Inventory</h2>
        <div className="ff-table-container">
          <table className="min-w-full">
            <thead className="ff-table-header">
              <tr>
                <th 
                  onClick={() => handleSort('itemNo')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Item No. {sortBy === 'itemNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('description')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('currentStock')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Stock {sortBy === 'currentStock' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="ff-table-header-cell">
                  Min/Max
                </th>
                <th 
                  onClick={() => handleSort('supplier')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Supplier {sortBy === 'supplier' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('projectName')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Project {sortBy === 'projectName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="ff-table-header-cell cursor-pointer"
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="ff-table-header-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMaterials.map((material) => (
                <tr key={material.id} className="ff-table-row">
                  <td className="ff-table-cell">
                    {editingId === material.id ? (
                      <input
                        type="text"
                        value={material.itemNo}
                        onChange={(e) => updateMaterial(material.id, 'itemNo', e.target.value)}
                        className="ff-input w-full"
                      />
                    ) : (
                      material.itemNo
                    )}
                  </td>
                  <td className="ff-table-cell">
                    {editingId === material.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={material.description}
                          onChange={(e) => updateMaterial(material.id, 'description', e.target.value)}
                          className="ff-input w-full"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={material.unitCost}
                          onChange={(e) => updateMaterial(material.id, 'unitCost', parseFloat(e.target.value))}
                          className="ff-input w-full"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{material.description}</div>
                        <div className="ff-secondary-text text-xs">
                          ${material.unitCost.toFixed(2)} per {material.unit}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="ff-table-cell">
                    {editingId === material.id ? (
                      <select
                        value={material.category}
                        onChange={(e) => updateMaterial(material.id, 'category', e.target.value)}
                        className="ff-input w-full"
                      >
                        {CATEGORIES.filter(cat => cat !== "All").map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {material.category}
                      </span>
                    )}
                  </td>
                  <td className="ff-table-cell">
                    {editingId === material.id ? (
                      <input
                        type="number"
                        value={material.currentStock}
                        onChange={(e) => updateMaterial(material.id, 'currentStock', parseInt(e.target.value))}
                        className="ff-input w-full"
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
                        <span className="ff-secondary-text ml-1">{material.unit}</span>
                      </div>
                    )}
                  </td>
                  <td className="ff-table-cell-secondary">
                    {editingId === material.id ? (
                      <div className="space-y-1">
                        <input
                          type="number"
                          value={material.minStock}
                          onChange={(e) => updateMaterial(material.id, 'minStock', parseInt(e.target.value))}
                          className="ff-input w-full text-xs"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={material.maxStock}
                          onChange={(e) => updateMaterial(material.id, 'maxStock', parseInt(e.target.value))}
                          className="ff-input w-full text-xs"
                          placeholder="Max"
                        />
                      </div>
                    ) : (
                      `${material.minStock} / ${material.maxStock}`
                    )}
                  </td>
                  <td className="ff-table-cell">
                    {editingId === material.id ? (
                      <div className="space-y-1">
                        <select
                          value={material.supplier}
                          onChange={(e) => updateMaterial(material.id, 'supplier', e.target.value)}
                          className="ff-input w-full text-xs"
                        >
                          {SUPPLIERS.filter(sup => sup !== "All").map(supplier => (
                            <option key={supplier} value={supplier}>{supplier}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={material.location}
                          onChange={(e) => updateMaterial(material.id, 'location', e.target.value)}
                          className="ff-input w-full text-xs"
                          placeholder="Location"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{material.supplier}</div>
                        <div className="ff-secondary-text text-xs">{material.location}</div>
                      </div>
                    )}
                  </td>
                  <td className="ff-table-cell">
                    {material.projectName ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {material.projectName}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="ff-table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(material.status)}`}>
                      {getStatusText(material.status)}
                    </span>
                  </td>
                  <td className="ff-table-cell">
                    {editingId === material.id ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSave(material.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(material.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-800 font-medium">
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
            <p className="ff-secondary-text">No materials found matching your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
