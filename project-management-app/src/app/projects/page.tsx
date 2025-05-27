"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customer");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    name: "",
    province: "",
    region: "",
    customer_id: customerId || ""
  });

  useEffect(() => {
    fetchData();
  }, [customerId]);

  async function fetchData() {
    setLoading(true);
    
    // Fetch customer if customerId is provided
    if (customerId) {
      const { data: customerData } = await supabase
        .from("new_customers")
        .select("*")
        .eq("id", customerId)
        .single();
      
      setCustomer(customerData);
      
      // Fetch projects for this customer
      const { data: projectsData } = await supabase
        .from("new_projects")
        .select("*")
        .eq("customer_id", customerId);
      
      setProjects(projectsData || []);
    } else {
      // Fetch all projects
      const { data: projectsData } = await supabase
        .from("new_projects")
        .select("*, new_customers(name)")
        .order("name");
      
      setProjects(projectsData || []);
    }
    
    setLoading(false);
  }

  async function handleAddProject() {
    if (!newProject.name) return;
    
    await supabase.from("new_projects").insert([newProject]);
    setNewProject({
      name: "",
      province: "",
      region: "",
      customer_id: customerId || ""
    });
    fetchData();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {customer ? `Projects for ${customer.name}` : "All Projects"}
      </h2>
      
      {customer && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{customer.name}</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {customer.address_line1 && <div>{customer.address_line1}</div>}
            {customer.address_line2 && <div>{customer.address_line2}</div>}
            {(customer.city || customer.postal_code) && (
              <div>
                {customer.city}{customer.city && customer.postal_code && ', '}{customer.postal_code}
              </div>
            )}
            {customer.email && <div className="mt-2">Email: {customer.email}</div>}
          </div>
        </div>
      )}
      
      {/* Add new project form */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Add New Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Project Name *"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Province"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.province}
              onChange={e => setNewProject({ ...newProject, province: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Region"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.region}
              onChange={e => setNewProject({ ...newProject, region: e.target.value })}
            />
          </div>
          {!customerId && (
            <div className="md:col-span-3">
              <select
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={newProject.customer_id}
                onChange={e => setNewProject({ ...newProject, customer_id: e.target.value })}
              >
                <option value="">Select Customer *</option>
                {/* We would need to fetch customers here */}
              </select>
            </div>
          )}
          <div className={customerId ? "md:col-span-3" : ""}>
            <button
              className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded w-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={handleAddProject}
            >
              Add Project
            </button>
          </div>
        </div>
      </div>
      
      {/* Projects list */}
      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project Name</th>
                {!customer && <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>}
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Province</th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Region</th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{project.name}</td>
                  {!customer && (
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {project.new_customers?.name || "Unknown"}
                    </td>
                  )}
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{project.province}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{project.region}</td>
                  <td className="py-3 px-4 text-sm">
                    <a 
                      href={`/projects/${project.id}`}
                      className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded text-xs font-medium inline-block hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      View Details
                    </a>
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
