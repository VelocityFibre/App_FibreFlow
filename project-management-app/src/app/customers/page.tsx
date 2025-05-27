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
    const { data, error } = await supabase.from("new_customers").select("*");
    setCustomers(data || []);
    setLoading(false);
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
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Customer Name *"
            className="border rounded px-3 py-2 w-full"
            value={newCustomer.name}
            onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 w-full"
            value={newCustomer.email}
            onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Address Line 1"
            className="border rounded px-3 py-2 w-full"
            value={newCustomer.address_line1}
            onChange={e => setNewCustomer({ ...newCustomer, address_line1: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Address Line 2"
            className="border rounded px-3 py-2 w-full"
            value={newCustomer.address_line2}
            onChange={e => setNewCustomer({ ...newCustomer, address_line2: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="City"
            className="border rounded px-3 py-2 w-full"
            value={newCustomer.city}
            onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Postal Code"
            className="border rounded px-3 py-2 w-full"
            value={newCustomer.postal_code}
            onChange={e => setNewCustomer({ ...newCustomer, postal_code: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={handleAdd}
          >Add Customer</button>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Projects</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="py-2 px-4 border-b">
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
                <td className="py-2 px-4 border-b">
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
                <td className="py-2 px-4 border-b">
                  {editing === customer.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={customer.address_line1 || ''}
                        onChange={e => handleEditField(customer.id, "address_line1", e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        value={customer.address_line2 || ''}
                        onChange={e => handleEditField(customer.id, "address_line2", e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={customer.city || ''}
                          onChange={e => handleEditField(customer.id, "city", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={customer.postal_code || ''}
                          onChange={e => handleEditField(customer.id, "postal_code", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
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
                <td className="py-2 px-4 border-b">
                  <a 
                    href={`/projects?customer=${customer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Projects
                  </a>
                </td>
                <td className="py-2 px-4 border-b">
                  {editing === customer.id ? (
                    <>
                      <button className="bg-green-600 text-white px-3 py-1 rounded mr-2" onClick={() => handleSave(customer.id)}>Save</button>
                      <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setEditing(customer.id)}>Edit</button>
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
