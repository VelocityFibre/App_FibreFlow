"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface StaffMember {
  id: string;
  created_time?: string;
  name: string;
  role?: string;
  phone_number?: string;
  email?: string;
  photo?: string | null;
  total_assigned_projects?: number;
  current_projects?: any[];
  tasks_assigned?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean; // We'll add this functionality with a new column
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    try {
      console.log("Fetching staff from database...");
      const { data, error, count } = await supabase
        .from("staff")
        .select("*", { count: 'exact' })
        .order("name");

      if (error) {
        console.error("Error fetching staff:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        alert(`Error fetching staff: ${error.message}`);
      } else {
        console.log("Fetched staff count:", count);
        console.log("Fetched staff data:", data);
        // Log the structure of the first staff member
        if (data && data.length > 0) {
          console.log("First staff member structure:", Object.keys(data[0]));
        }
        setStaff(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchStaff:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newStaff.name) {
      alert("Staff name is required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("staff")
        .insert([{
          name: newStaff.name,
          email: newStaff.email || null,
          role: newStaff.role || null,
          is_active: true
        }])
        .select();

      if (error) {
        console.error("Error adding staff:", error);
        alert(`Failed to add staff member: ${error.message}`);
      } else {
        console.log("Staff added successfully:", data);
        setNewStaff({ name: "", email: "", role: "" });
        fetchStaff();
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
      alert(`An unexpected error occurred: ${error}`);
    }
  }

  async function toggleActive(id: string | number, currentStatus: boolean) {
    try {
      console.log('Attempting to toggle staff:', { id, currentStatus, newStatus: !currentStatus });
      
      const { data, error } = await supabase
        .from("staff")
        .update({ is_active: !currentStatus })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating staff:", error);
        alert(`Failed to update staff member: ${error.message}`);
      } else {
        console.log("Staff updated successfully:", data);
        fetchStaff();
      }
    } catch (error) {
      console.error("Unexpected error in toggleActive:", error);
      alert(`An unexpected error occurred: ${error}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Staff Management
      </h2>

      {/* Add new staff form */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
          Add New Staff Member
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Name *"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Role"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            />
          </div>
          <div>
            <button
              className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded w-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={handleAdd}
            >
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Staff list */}
      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      ) : staff.length === 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 mb-2">
            No staff members found. Add your first staff member above to enable task assignments.
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Staff members are required for assigning project managers and task assignees.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {member.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {member.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {member.email || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {member.role || "-"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active !== false
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {member.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={() => toggleActive(member.id, member.is_active !== false)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {member.is_active !== false ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Note</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Staff members added here will appear in the assignee dropdowns when creating projects and assigning tasks.
          Make sure to add at least one staff member before creating projects with assignments.
        </p>
      </div>
    </div>
  );
}