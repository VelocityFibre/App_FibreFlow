"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Customer {
  id: string;
  client_name: string;
  client_type: string;
  contact_information: string;
  sla_terms: string;
  created_time: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editing, setEditing] = useState<string|null>(null);
  const [newCustomer, setNewCustomer] = useState({ 
    client_name: "", 
    client_type: "", 
    contact_information: "", 
    sla_terms: "" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      console.log("Fetching customers from database...");
      const { data, error, count } = await supabase
        .from("customers")
        .select("*", { count: 'exact' });
      
      if (error) {
        console.error("Error fetching customers:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
      } else {
        console.log("Fetched customers count:", count);
        console.log("Fetched customers data:", data);
        setCustomers(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchCustomers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    const { error } = await supabase.from("customers").update(customer).eq("id", id);
    if (error) {
      console.error("Error updating customer:", error);
      alert(`Failed to update customer: ${error.message}`);
      return;
    }
    setEditing(null);
    fetchCustomers();
  }

  async function handleAdd() {
    if (!newCustomer.client_name) return;
    
    // Generate UUID for the new customer
    const customerWithId = {
      id: crypto.randomUUID(),
      ...newCustomer,
      created_time: new Date().toISOString()
    };
    
    const { error } = await supabase.from("customers").insert([customerWithId]);
    if (error) {
      console.error("Error adding customer:", error);
      alert(`Failed to add customer: ${error.message}`);
      return;
    }
    setNewCustomer({ 
      client_name: "", 
      client_type: "", 
      contact_information: "", 
      sla_terms: "" 
    });
    fetchCustomers();
  }

  function handleEditField(id: string, field: string, value: string) {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Customers</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Client Name *"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.client_name}
            onChange={e => setNewCustomer({ ...newCustomer, client_name: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Client Type"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.client_type}
            onChange={e => setNewCustomer({ ...newCustomer, client_type: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <textarea
            placeholder="Contact Information"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.contact_information}
            onChange={e => setNewCustomer({ ...newCustomer, contact_information: e.target.value })}
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <textarea
            placeholder="SLA Terms"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.sla_terms}
            onChange={e => setNewCustomer({ ...newCustomer, sla_terms: e.target.value })}
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <button
            className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md w-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            onClick={handleAdd}
          >Add Customer</button>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading customers...</p>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-2">No customers found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your first customer using the form above</p>
        </div>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Client Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Client Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Contact Info</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">SLA Terms</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <input
                      type="text"
                      value={customer.client_name}
                      onChange={e => handleEditField(customer.id, "client_name", e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    customer.client_name
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <input
                      type="text"
                      value={customer.client_type || ''}
                      onChange={e => handleEditField(customer.id, "client_type", e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    customer.client_type || '-'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <textarea
                      value={customer.contact_information || ''}
                      onChange={e => handleEditField(customer.id, "contact_information", e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  ) : (
                    <div className="max-w-xs truncate">
                      {customer.contact_information || '-'}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <textarea
                      value={customer.sla_terms || ''}
                      onChange={e => handleEditField(customer.id, "sla_terms", e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  ) : (
                    <div className="max-w-xs truncate">
                      {customer.sla_terms || '-'}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <>
                      <button className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors mr-2" onClick={() => handleSave(customer.id)}>Save</button>
                      <button className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors" onClick={() => setEditing(customer.id)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
