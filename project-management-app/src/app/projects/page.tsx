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
      <h2 className="text-2xl font-bold mb-4">
        {customer ? `Projects for ${customer.name}` : "All Projects"}
      </h2>
      
      {customer && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">{customer.name}</h3>
          <div className="text-sm text-gray-600">
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
      <div className="mb-6 p-4 border rounded">
        <h3 className="font-semibold mb-4">Add New Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Project Name *"
              className="border rounded px-3 py-2 w-full"
              value={newProject.name}
              onChange={e => setNewProject({ ...newProject, name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Province"
              className="border rounded px-3 py-2 w-full"
              value={newProject.province}
              onChange={e => setNewProject({ ...newProject, province: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Region"
              className="border rounded px-3 py-2 w-full"
              value={newProject.region}
              onChange={e => setNewProject({ ...newProject, region: e.target.value })}
            />
          </div>
          {!customerId && (
            <div className="md:col-span-3">
              <select
                className="border rounded px-3 py-2 w-full"
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
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              onClick={handleAddProject}
            >
              Add Project
            </button>
          </div>
        </div>
      </div>
      
      {/* Projects list */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Project Name</th>
                {!customer && <th className="py-2 px-4 border-b">Customer</th>}
                <th className="py-2 px-4 border-b">Province</th>
                <th className="py-2 px-4 border-b">Region</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="py-2 px-4 border-b">{project.name}</td>
                  {!customer && (
                    <td className="py-2 px-4 border-b">
                      {project.new_customers?.name || "Unknown"}
                    </td>
                  )}
                  <td className="py-2 px-4 border-b">{project.province}</td>
                  <td className="py-2 px-4 border-b">{project.region}</td>
                  <td className="py-2 px-4 border-b">
                    <a 
                      href={`/projects/${project.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded inline-block"
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
