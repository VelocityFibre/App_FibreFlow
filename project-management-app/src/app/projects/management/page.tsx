"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: string;
  name: string;
  province?: string;
  region?: string;
  customer_id?: string;
  customer_name?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  manager?: string;
  budget?: number;
  progress?: number;
}

export default function ProjectManagementPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      // Try the new_projects table first
      const { data, error } = await supabase
        .from("new_projects")
        .select(`
          id, 
          name, 
          province, 
          region, 
          customer_id,
          status,
          start_date,
          end_date,
          manager,
          budget,
          progress,
          new_customers (
            id,
            name
          )
        `)
        .order("name");
      
      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        // Transform the data to include customer_name
        const transformedData = data.map(project => ({
          ...project,
          customer_name: project.new_customers?.name || "Unknown"
        }));
        
        setProjects(transformedData);
      }
    } catch (error) {
      console.error("Exception fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleEditProject(project: Project) {
    setSelectedProject(project);
    setEditMode(true);
  }

  function handleViewProject(project: Project) {
    setSelectedProject(project);
    setEditMode(false);
  }

  async function handleStatusChange(projectId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("new_projects")
        .update({ status: newStatus })
        .eq("id", projectId);
      
      if (error) {
        console.error("Error updating project status:", error);
      } else {
        // Update local state
        setProjects(projects.map(p => 
          p.id === projectId ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error("Exception updating project status:", error);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Project Management</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Loading projects...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{project.customer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {project.region && project.province 
                        ? `${project.region}, ${project.province}` 
                        : project.region || project.province || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded px-2 py-1"
                      value={project.status || 'Planning'}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{project.progress || 0}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Project Detail Modal - Would be implemented in a real application */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editMode ? 'Edit Project' : 'Project Details'}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedProject(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Project Name</p>
                <p className="font-medium">{selectedProject.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedProject.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {selectedProject.region && selectedProject.province 
                    ? `${selectedProject.region}, ${selectedProject.province}` 
                    : selectedProject.region || selectedProject.province || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedProject.status || 'Planning'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${selectedProject.progress || 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{selectedProject.progress || 0}%</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="bg-gray-200 px-4 py-2 rounded"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </button>
              {!editMode && (
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              )}
              {editMode && (
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => {
                    // Save logic would go here
                    setEditMode(false);
                  }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
