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
    <div className="space-y-12">
      <div className="border-b border-border pb-8 mb-12">
        <h1 className="text-5xl font-light text-foreground mb-4">Staff Management</h1>
        <p className="text-xl text-muted-foreground font-light">Manage your team members and their assignments</p>
      </div>

      {/* Add new staff form */}
      <section className="mb-20">
        <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-3xl font-light text-foreground mb-12">Add New Staff Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <input
                type="text"
                placeholder="Name *"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Role"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              />
            </div>
            <div>
              <button
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={handleAdd}
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Staff list */}
      <section className="mb-20">
        <h2 className="text-3xl font-light text-foreground mb-12">Team Members</h2>
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8">
            <p className="text-muted-foreground text-center">Loading staff members...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-medium text-foreground mb-4">No Staff Members Yet</h3>
              <p className="text-muted-foreground mb-2">
                Add your first staff member above to enable task assignments.
              </p>
              <p className="text-sm text-muted-foreground">
                Staff members are required for assigning project managers and task assignees.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {member.id}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-foreground">
                        {member.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {member.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {member.role || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                            member.is_active !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {member.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <button
                          onClick={() => toggleActive(member.id, member.is_active !== false)}
                          className="text-primary hover:opacity-75 font-medium transition-opacity duration-150"
                        >
                          {member.is_active !== false ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="bg-accent/20 border border-border rounded-xl p-8">
        <h3 className="text-xl font-medium text-foreground mb-4">Important Note</h3>
        <p className="text-muted-foreground">
          Staff members added here will appear in the assignee dropdowns when creating projects and assigning tasks.
          Make sure to add at least one staff member before creating projects with assignments.
        </p>
      </div>
    </div>
  );
}