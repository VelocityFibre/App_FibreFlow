"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Contractor {
  id: string;
  company_registered_name: string;
  trading_name: string;
  company_registration_number: string;
  vat_number: string;
  type_of_services_offered: string[];
  contractor_performance: string;
  created_time?: string;
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [newContractor, setNewContractor] = useState<Omit<Contractor, 'id' | 'created_time'>>({
    company_registered_name: "",
    trading_name: "",
    company_registration_number: "",
    vat_number: "",
    type_of_services_offered: [],
    contractor_performance: ""
  });

  useEffect(() => {
    fetchContractors();
  }, []);

  async function fetchContractors() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("contractors").select("*").order("company_registered_name");
      
      if (error) {
        console.error("Error fetching contractors:", error);
      } else {
        console.log("Fetched contractors:", data);
        setContractors(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchContractors:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    const contractor = contractors.find((c) => c.id === id);
    if (!contractor) return;
    
    try {
      const { error } = await supabase.from("contractors").update(contractor).eq("id", id);
      if (error) {
        console.error("Error updating contractor:", error);
      } else {
        setEditing(null);
        fetchContractors();
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
    }
  }

  async function handleAdd() {
    if (!newContractor.company_registered_name) return;
    
    try {
      const { error } = await supabase.from("contractors").insert([newContractor]);
      if (error) {
        console.error("Error adding contractor:", error);
      } else {
        setNewContractor({
          company_registered_name: "",
          trading_name: "",
          company_registration_number: "",
          vat_number: "",
          type_of_services_offered: [],
          contractor_performance: ""
        });
        fetchContractors();
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
    }
  }

  function handleEditField(id: string, field: keyof Contractor, value: string | string[]) {
    setContractors((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h2 className="ff-page-title">Contractors</h2>
      </div>
      
      {/* Add new contractor form */}
      <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Add New Contractor</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Company Name *"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContractor.company_registered_name}
              onChange={e => setNewContractor({ ...newContractor, company_registered_name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Contact Person"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContractor.trading_name}
              onChange={e => setNewContractor({ ...newContractor, trading_name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContractor.company_registration_number}
              onChange={e => setNewContractor({ ...newContractor, company_registration_number: e.target.value })}
            />
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContractor.vat_number}
              onChange={e => setNewContractor({ ...newContractor, vat_number: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Type of Services (comma-separated)"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newContractor.type_of_services_offered.join(", ")}
              onChange={e => setNewContractor({ ...newContractor, type_of_services_offered: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="flex items-end">
            <button
              className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md w-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={handleAdd}
            >
              Add Contractor
            </button>
          </div>
        </div>
      </div>
      
      {/* Contractors list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading contractors...</p>
        </div>
      ) : contractors.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No contractors found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your first contractor using the form above</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Company Registered Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Trading Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Company Registration Number</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">VAT Number</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Type of Services Offered</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Contractor Performance</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {contractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contractor.id ? (
                      <input
                        type="text"
                        value={contractor.company_registered_name}
                        onChange={e => handleEditField(contractor.id, "company_registered_name", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contractor.company_registered_name
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contractor.id ? (
                      <input
                        type="text"
                        value={contractor.trading_name}
                        onChange={e => handleEditField(contractor.id, "trading_name", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contractor.trading_name
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contractor.id ? (
                      <input
                        type="text"
                        value={contractor.company_registration_number}
                        onChange={e => handleEditField(contractor.id, "company_registration_number", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contractor.company_registration_number
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contractor.id ? (
                      <input
                        type="text"
                        value={contractor.vat_number}
                        onChange={e => handleEditField(contractor.id, "vat_number", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contractor.vat_number
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contractor.id ? (
                      <input
                        type="text"
                        value={Array.isArray(contractor.type_of_services_offered) ? contractor.type_of_services_offered.join(", ") : ""}
                        onChange={e => handleEditField(contractor.id, "type_of_services_offered", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      Array.isArray(contractor.type_of_services_offered) ? contractor.type_of_services_offered.join(", ") : ""
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === contractor.id ? (
                      <input
                        type="text"
                        value={contractor.contractor_performance}
                        onChange={e => handleEditField(contractor.id, "contractor_performance", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      contractor.contractor_performance
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {editing === contractor.id ? (
                      <div className="flex space-x-2">
                        <button 
                          className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                          onClick={() => handleSave(contractor.id)}
                        >
                          Save
                        </button>
                        <button 
                          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        onClick={() => setEditing(contractor.id)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
