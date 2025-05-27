"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [editing, setEditing] = useState<string|null>(null);
  const [newCustomer, setNewCustomer] = useState({ 
    name: "", 
    email: "", 
    address_line1: "", 
    address_line2: "", 
    city: "", 
    postal_code: "" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("new_customers").select("*");
      
      if (error) {
        console.error("Error fetching customers:", error);
      } else {
        console.log("Fetched customers:", data);
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
    await supabase.from("new_customers").update(customer).eq("id", id);
    setEditing(null);
    fetchCustomers();
  }

  async function handleAdd() {
    if (!newCustomer.name) return;
    await supabase.from("new_customers").insert([newCustomer]);
    setNewCustomer({ 
      name: "", 
      email: "", 
      address_line1: "", 
      address_line2: "", 
      city: "", 
      postal_code: "" 
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
            placeholder="Customer Name *"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.name}
            onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.email}
            onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Address Line 1"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.address_line1}
            onChange={e => setNewCustomer({ ...newCustomer, address_line1: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Address Line 2"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.address_line2}
            onChange={e => setNewCustomer({ ...newCustomer, address_line2: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="City"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.city}
            onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Postal Code"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={newCustomer.postal_code}
            onChange={e => setNewCustomer({ ...newCustomer, postal_code: e.target.value })}
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
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Email</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Address</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Projects</th>
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
                      value={customer.name}
                      onChange={e => handleEditField(customer.id, "name", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <input
                      type="email"
                      value={customer.email}
                      onChange={e => handleEditField(customer.id, "email", e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    customer.email
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  {editing === customer.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={customer.address_line1 || ''}
                        onChange={e => handleEditField(customer.id, "address_line1", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        value={customer.address_line2 || ''}
                        onChange={e => handleEditField(customer.id, "address_line2", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={customer.city || ''}
                          onChange={e => handleEditField(customer.id, "city", e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={customer.postal_code || ''}
                          onChange={e => handleEditField(customer.id, "postal_code", e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      {customer.address_line1 && <div>{customer.address_line1}</div>}
                      {customer.address_line2 && <div>{customer.address_line2}</div>}
                      {(customer.city || customer.postal_code) && (
                        <div>
                          {customer.city}{customer.city && customer.postal_code && ', '}{customer.postal_code}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                  <a 
                    href={`/projects?customer=${customer.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Projects
                  </a>
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
