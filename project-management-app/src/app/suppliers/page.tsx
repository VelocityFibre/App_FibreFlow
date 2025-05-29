"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProvinceDropdown from "@/components/ProvinceDropdown";

interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  province: string;
  country: string;
  website: string;
  category: string;
  status: string;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id'>>({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    province: "",
    country: "South Africa",
    website: "",
    category: "",
    status: "active"
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("company_name");

      if (error) {
        console.error("Error fetching suppliers:", error);
      } else {
        setSuppliers(data || []);
      }
    } catch (error) {
      console.error("Exception fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEditField(id: string, field: string, value: string | boolean) {
    setSuppliers((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  async function handleSave(id: string) {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return;
    
    try {
      const { error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("id", id);

      if (error) {
        console.error("Error updating supplier:", error);
      } else {
        setEditing(null);
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Exception updating supplier:", error);
    }
  }

  async function handleAdd() {
    if (!newSupplier.company_name) {
      alert("Company name is required");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("suppliers")
        .insert([newSupplier]);

      if (error) {
        console.error("Error adding supplier:", error);
        alert("Error adding supplier. Please try again.");
      } else {
        setNewSupplier({
          company_name: "",
          contact_person: "",
          email: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city: "",
          postal_code: "",
          province: "",
          country: "South Africa",
          website: "",
          category: "",
          status: "active"
        });
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Exception adding supplier:", error);
      alert("Error adding supplier. Please try again.");
    }
  }

  async function updateSupplierStatus(supplierId: string, status: string) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ status })
        .eq('id', supplierId);

      if (error) {
        console.error("Error updating supplier status:", error);
      } else {
        // Update local state
        setSuppliers(suppliers.map(s => 
          s.id === supplierId ? { ...s, status } : s
        ));
      }
    } catch (error) {
      console.error("Exception updating supplier status:", error);
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "blacklisted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    // Filter by category
    if (filterCategory !== "all" && supplier.category !== filterCategory) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        supplier.company_name.toLowerCase().includes(searchLower) ||
        supplier.contact_person.toLowerCase().includes(searchLower) ||
        supplier.email.toLowerCase().includes(searchLower) ||
        supplier.category.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(suppliers.map(s => s.category))).filter(Boolean);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#003049]">Suppliers</h1>
        <Button 
          onClick={() => document.getElementById('add-supplier-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#003049] hover:bg-[#004b74]"
        >
          Add New Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-[#003049]/20 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-[#003049] mb-1">Supplier Management</h3>
            <p className="text-sm text-gray-600 mb-4">Manage your suppliers</p>
            <p className="text-sm mb-4">Add, edit, and manage supplier information and track their status.</p>
            <Button 
              onClick={() => document.getElementById('suppliers-table')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-[#003049] hover:bg-[#004b74]"
            >
              View All Suppliers
            </Button>
          </div>
        </div>

        <div className="bg-white border border-[#003049]/20 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-[#003049] mb-1">Add New Supplier</h3>
            <p className="text-sm text-gray-600 mb-4">Create a new supplier profile</p>
            <p className="text-sm mb-4">Add new suppliers to your system with contact details and address information.</p>
            <Button 
              onClick={() => document.getElementById('add-supplier-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-[#003049] hover:bg-[#004b74]"
            >
              Add Supplier
            </Button>
          </div>
        </div>

        <div className="bg-white border border-[#003049]/20 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-[#003049] mb-1">Supplier Categories</h3>
            <p className="text-sm text-gray-600 mb-4">View suppliers by category</p>
            <p className="text-sm mb-4">Browse suppliers by their category to find specific types of vendors.</p>
            <Button 
              onClick={() => document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-[#003049] hover:bg-[#004b74]"
            >
              Filter Suppliers
            </Button>
          </div>
        </div>
      </div>
      
      <div id="add-supplier-form" className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#003049]">Add New Supplier</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.company_name}
                  onChange={e => setNewSupplier({ ...newSupplier, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="Enter contact person name"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.contact_person}
                  onChange={e => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.email}
                  onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input
                  type="text"
                  placeholder="Street address"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.address_line1}
                  onChange={e => setNewSupplier({ ...newSupplier, address_line1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input
                  type="text"
                  placeholder="Apt, suite, unit, etc. (optional)"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.address_line2}
                  onChange={e => setNewSupplier({ ...newSupplier, address_line2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  placeholder="City"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.city}
                  onChange={e => setNewSupplier({ ...newSupplier, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="Postal code"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.postal_code}
                  onChange={e => setNewSupplier({ ...newSupplier, postal_code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <ProvinceDropdown
                  value={newSupplier.province}
                  onChange={(e) => setNewSupplier({ ...newSupplier, province: e.target.value })}
                  placeholder="Select province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="text"
                  placeholder="Enter website URL"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.website}
                  onChange={e => setNewSupplier({ ...newSupplier, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Enter supplier category"
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.category}
                  onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={newSupplier.status}
                  onChange={e => setNewSupplier({ ...newSupplier, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-4">
                <Button
                  className="w-full bg-[#003049] hover:bg-[#004b74]"
                  onClick={handleAdd}
                >
                  Add Supplier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div id="filter-section" className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="category-filter" className="text-sm font-medium">Filter by Category:</label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div id="suppliers-table" className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#003049]">All Suppliers</h2>
        {loading ? (
          <p className="text-gray-700">Loading suppliers...</p>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-[#003049]/20 shadow-sm">
            <p className="text-gray-500">No suppliers found matching your criteria</p>
            <Button 
              onClick={() => document.getElementById('add-supplier-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-4 bg-[#003049] hover:bg-[#004b74]"
            >
              Add New Supplier
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-[#003049]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{supplier.company_name}</div>
                        {supplier.website && (
                          <div className="text-sm text-gray-500">
                            <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-[#003049] hover:underline">
                              {supplier.website}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{supplier.contact_person}</div>
                        <div className="text-sm text-gray-500">{supplier.email}</div>
                        <div className="text-sm text-gray-500">{supplier.phone}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{supplier.category || 'Not specified'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={supplier.status}
                          onChange={(e) => updateSupplierStatus(supplier.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadgeClass(supplier.status)}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="blacklisted">Blacklisted</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {supplier.address_line1 && <div>{supplier.address_line1}</div>}
                          {supplier.address_line2 && <div>{supplier.address_line2}</div>}
                          {(supplier.city || supplier.postal_code || supplier.province) && (
                            <div>
                              {supplier.city}{supplier.city && (supplier.postal_code || supplier.province) && ', '}
                              {supplier.postal_code}{(supplier.city || supplier.postal_code) && supplier.province && ', '}
                              {supplier.province}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {editing === supplier.id ? (
                            <div className="flex space-x-2">
                              <Button 
                                className="bg-green-600 hover:bg-green-700 px-3 py-1 h-8" 
                                onClick={() => handleSave(supplier.id)}
                              >
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                className="px-3 py-1 h-8" 
                                onClick={() => setEditing(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              className="bg-[#003049] hover:bg-[#004b74] px-3 py-1 h-8" 
                              onClick={() => setEditing(supplier.id)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
