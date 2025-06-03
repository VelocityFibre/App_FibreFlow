"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ModuleOverviewLayout from "@/components/ModuleOverviewLayout";
import ModuleOverviewCard from "@/components/ModuleOverviewCard";
import ActionButton from "@/components/ActionButton";
import ArchivedItemsManager from "@/components/ArchivedItemsManager";
import { useSoftDelete } from "@/hooks/useSoftDelete";
import { excludeArchived, onlyArchived } from "@/lib/softDelete";
import { FiUsers, FiUserPlus, FiClipboard, FiArchive, FiTrash2 } from 'react-icons/fi';

function CustomersContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const [customers, setCustomers] = useState<any[]>([]);
  const [archivedCustomers, setArchivedCustomers] = useState<any[]>([]);
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
  const [showArchived, setShowArchived] = useState(false);
  const { archive, loading: archiveLoading, error: archiveError } = useSoftDelete();

  useEffect(() => {
    fetchCustomers();
  }, [showArchived]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      // Fetch active customers (not archived)
      const { data: activeData, error: activeError } = await supabase
        .from("new_customers")
        .select("*")
        .is('archived_at', null);
      
      if (activeError) {
        console.error("Error fetching active customers:", activeError);
      } else {
        setCustomers(activeData || []);
      }

      // Fetch archived customers if needed
      if (showArchived) {
        const { data: archivedData, error: archivedError } = await supabase
          .from("new_customers")
          .select("*")
          .not('archived_at', 'is', null);
        
        if (archivedError) {
          console.error("Error fetching archived customers:", archivedError);
        } else {
          setArchivedCustomers(archivedData || []);
        }
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

  async function handleArchive(id: string, name: string) {
    if (confirm(`Are you sure you want to archive customer "${name}"? This will hide it from the main view but can be restored later.`)) {
      const result = await archive('new_customers', id, {
        details: { customerName: name },
        invalidateQueries: ['customers']
      });
      
      if (result.success) {
        fetchCustomers();
      }
    }
  }

  // If we're on the main customers page and no view is specified, show the overview layout
  if (!view) {
    return (
      <ModuleOverviewLayout 
        title="Customers" 
        description="Manage your customer relationships and information"
        actions={<ActionButton label="Add Customer" variant="outline" onClick={() => window.location.href = "/customers?view=add"} />}
      >
        <div className="md:col-span-1 lg:col-span-1 flex">
          <ModuleOverviewCard
            title="Customer Management"
            description="View and manage your customer database."
            actionLabel="View Customers"
            actionLink="/customers?view=management"
            icon={<FiUsers size={24} />}
            className="w-full h-full"
          />
        </div>
        <div className="md:col-span-1 lg:col-span-1 flex">
          <ModuleOverviewCard
            title="Customer Reports"
            description="Generate and view reports on customer data."
            actionLabel="View Reports"
            actionLink="/customers?view=reports"
            icon={<FiClipboard size={24} />}
            className="w-full h-full"
          />
        </div>
      </ModuleOverviewLayout>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Customers</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {view === "management" ? "Manage your customer database" : 
             view === "add" ? "Add new customers to your database" : 
             "Customer information and management"}
          </p>
        </div>
        <div className="flex space-x-3">
          <ActionButton
            label="Back to Overview"
            variant="outline"
            onClick={() => window.location.href = "/customers"}
          />
        </div>
      </div>
      
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Customer List</h3>
            <div className="flex items-center">
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mr-4"
              >
                <FiArchive className="mr-1" />
                {showArchived ? "Hide Archived" : "Show Archived"}
              </button>
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
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

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading customers...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
