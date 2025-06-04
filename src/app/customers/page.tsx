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
    <div className="space-y-12">
      <div className="border-b border-border pb-8 mb-12">
        <h1 className="text-5xl font-light text-foreground mb-4">Customers</h1>
        <p className="text-xl text-muted-foreground font-light">Manage your customer relationships and service agreements</p>
      </div>

      {/* Add new customer form */}
      <section className="mb-20">
        <div className="bg-card border border-border rounded-xl p-12 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-3xl font-light text-foreground mb-12">Add New Customer</h2>
          <div className="max-w-4xl">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="ff-label">Client Name *</label>
                  <input
                    type="text"
                    placeholder="Enter client name"
                    className="ff-input"
                    value={newCustomer.client_name}
                    onChange={e => setNewCustomer({ ...newCustomer, client_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="ff-label">Client Type</label>
                  <input
                    type="text"
                    placeholder="Enter client type"
                    className="ff-input"
                    value={newCustomer.client_type}
                    onChange={e => setNewCustomer({ ...newCustomer, client_type: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="ff-label">Contact Information</label>
                <textarea
                  placeholder="Enter contact details"
                  className="ff-input resize-none"
                  value={newCustomer.contact_information}
                  onChange={e => setNewCustomer({ ...newCustomer, contact_information: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="ff-label">SLA Terms</label>
                <textarea
                  placeholder="Enter service level agreement terms"
                  className="ff-input resize-none"
                  value={newCustomer.sla_terms}
                  onChange={e => setNewCustomer({ ...newCustomer, sla_terms: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="pt-4">
                <button
                  className="ff-button-primary px-8 py-3"
                  onClick={handleAdd}
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-20">
        <h2 className="text-3xl font-light text-foreground mb-12">Customer Directory</h2>
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <p className="text-muted-foreground text-center">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-medium text-foreground mb-4">No Customers Yet</h3>
              <p className="text-muted-foreground mb-2">Add your first customer using the form above</p>
              <p className="text-sm text-muted-foreground">Customers help you organize projects and track service agreements</p>
            </div>
          </div>
        ) : (
          <div className="ff-table-container">
            <table className="w-full">
              <thead className="ff-table-header">
                <tr>
                  <th className="ff-table-header-cell">Client Name</th>
                  <th className="ff-table-header-cell">Client Type</th>
                  <th className="ff-table-header-cell">Contact Info</th>
                  <th className="ff-table-header-cell">SLA Terms</th>
                  <th className="ff-table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="ff-table-row">
                    <td className="ff-table-cell">
                      {editing === customer.id ? (
                        <input
                          type="text"
                          value={customer.client_name}
                          onChange={e => handleEditField(customer.id, "client_name", e.target.value)}
                          className="ff-input text-sm"
                        />
                      ) : (
                        customer.client_name
                      )}
                    </td>
                    <td className="ff-table-cell-secondary">
                      {editing === customer.id ? (
                        <input
                          type="text"
                          value={customer.client_type || ''}
                          onChange={e => handleEditField(customer.id, "client_type", e.target.value)}
                          className="ff-input text-sm"
                        />
                      ) : (
                        customer.client_type || '-'
                      )}
                    </td>
                    <td className="ff-table-cell-secondary">
                      {editing === customer.id ? (
                        <textarea
                          value={customer.contact_information || ''}
                          onChange={e => handleEditField(customer.id, "contact_information", e.target.value)}
                          className="ff-input text-sm resize-none"
                          rows={2}
                        />
                      ) : (
                        <div className="max-w-xs truncate">
                          {customer.contact_information || '-'}
                        </div>
                      )}
                    </td>
                    <td className="ff-table-cell-secondary">
                      {editing === customer.id ? (
                        <textarea
                          value={customer.sla_terms || ''}
                          onChange={e => handleEditField(customer.id, "sla_terms", e.target.value)}
                          className="ff-input text-sm resize-none"
                          rows={2}
                        />
                      ) : (
                        <div className="max-w-xs truncate">
                          {customer.sla_terms || '-'}
                        </div>
                      )}
                    </td>
                    <td className="ff-table-cell">
                      {editing === customer.id ? (
                        <div className="space-x-2">
                          <button 
                            className="ff-button-primary text-xs px-3 py-1" 
                            onClick={() => handleSave(customer.id)}
                          >
                            Save
                          </button>
                          <button 
                            className="ff-button-ghost text-xs px-3 py-1" 
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="ff-button-ghost text-xs px-3 py-1" 
                          onClick={() => setEditing(customer.id)}
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
      </section>
    </div>
  );
}
