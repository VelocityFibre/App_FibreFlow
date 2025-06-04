"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";
import ProjectAssigneeDropdown from "@/components/ProjectAssigneeDropdown";
import { autoAssignFirstPhaseAndTasks } from "@/lib/projectPhaseUtils";
import { testSupabaseConnection, testProjectsTable } from "@/lib/supabaseTest";

// Helper function to generate UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface Project {
  id: string;
  name: string;
  customer_id?: string;
  created_at?: string;
  start_date?: string;
  end_date?: string;
  location_id?: string;
  region?: string;
  status?: string;
  customers?: Customer;
  province_name?: string; // For display purposes only
}

interface Location {
  id: string;
  location_name: string;
}

interface Province {
  id: string;
  name: string;
  code: string;
  region: string;
  created_time?: string;
}



interface Customer {
  id: string;
  client_name: string;
  client_type?: string;
  contact_information?: string;
  sla_terms?: string;
  created_time?: string;
}

function ProjectsContent() {
  // This component uses useSearchParams, so it needs to be wrapped in Suspense
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customer");

  const [projects, setProjects] = useState<Project[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState<Project>({
    id: "",
    name: "",
    region: "",
    customer_id: customerId || "",
    start_date: "",
    end_date: "",
    location_id: "",
    status: "Not Started"
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [projectManager, setProjectManager] = useState<number | null>(null);
  const [taskAssignee, setTaskAssignee] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean, message: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define fetch functions with useCallback to prevent infinite loops
  const fetchCustomers = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("client_name");
      if (error) {
        console.error("Error fetching customers:", error);
      } else {
        setCustomers(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchCustomers:", error);
    }
  }, []);

  const fetchLocations = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("location_name");
      if (error) {
        console.error("Error fetching locations:", error);
      } else {
        setLocations(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchLocations:", error);
    }
  }, []);

  const fetchProvinces = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("provinces")
        .select("*")
        .order("name");
      if (error) {
        console.error("Error fetching provinces:", error);
      } else {
        setProvinces(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchProvinces:", error);
    }
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    console.log('Fetching data with Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    try {
      // Fetch customer if customerId is provided
      if (customerId) {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();

        if (customerError) {
          console.error("Error fetching customer:", customerError);
        } else {
          setCustomer(customerData);
        }

        // Fetch projects for this customer
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("customer_id", customerId);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
        } else {
          setProjects(projectsData || []);
        }
      } else {
        // Fetch all projects - with detailed error handling
        console.log('Attempting to fetch all projects...');
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*");

        if (projectsError) {
          console.error("Error fetching all projects:", JSON.stringify(projectsError));
          alert(`Error fetching projects: ${JSON.stringify(projectsError)}`);
        } else {
          console.log('Projects data received:', projectsData);
          // Map the data to match the expected Project interface
          const formattedProjects = (projectsData || []).map(project => ({
            id: project.id,
            name: project.project_name || project.name || 'Unnamed Project',
            customer_id: project.customer_id,
            created_at: project.created_at,
            start_date: project.start_date,
            end_date: project.end_date,
            location_id: project.location_id,
            region: project.region || '',
            status: project.status || 'Not Started'
          }));
          setProjects(formattedProjects);

          // Fetch customer names separately for each project
          const projectsWithCustomers = await Promise.all(
            formattedProjects.map(async (project) => {
              if (project.customer_id) {
                try {
                  const { data: customerData } = await supabase
                    .from("customers")
                    .select("client_name")
                    .eq("id", project.customer_id)
                    .single();
                  
                  return {
                    ...project,
                    customers: customerData
                  };
                } catch (error) {
                  return project;
                }
              }
              return project;
            })
          );
          
          setProjects(projectsWithCustomers);
        }
      }
    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
      alert(`Unexpected error in fetchData: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  }, [customerId]);
  
  useEffect(() => {
    // Test Supabase connection first
    testConnection();
    // Then fetch data
    fetchData();
    fetchLocations();
    fetchProvinces();
    fetchCustomers();
  }, [fetchData, fetchLocations, fetchProvinces, fetchCustomers]);
  
  async function testConnection() {
    // Test general Supabase connection
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      setConnectionStatus({
        success: false,
        message: `Supabase connection failed: ${JSON.stringify(connectionTest.error)}`
      });
      return;
    }
    
    // Test projects table specifically
    const projectsTest = await testProjectsTable();
    if (!projectsTest.success) {
      setConnectionStatus({
        success: false,
        message: `Projects table test failed: ${JSON.stringify(projectsTest.error)}`
      });
      return;
    }
    
    setConnectionStatus({
      success: true,
      message: 'Connection to Supabase and projects table successful'
    });
  }

  // This function is now defined with useCallback above

  // This function is now defined with useCallback above

  // This function is now defined with useCallback above

  async function handleAddProject() {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    console.log('Current form state:', { newProject, projectManager, taskAssignee });
    
    if (!newProject.name) {
      alert("Project name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    // Don't force a default project manager - allow null values
    let effectiveProjectManager = projectManager;
    if (projectManager === null || projectManager === undefined || isNaN(Number(projectManager))) {
      console.log('No project manager selected - will create project without assignee');
      effectiveProjectManager = null;
    }
    
    // Log the project manager being used
    console.log('Using project manager:', effectiveProjectManager);

    try {
      // Create a clean payload without the id field (should be auto-generated by the database)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...projectData } = newProject;

      // Remove empty location_id to prevent UUID validation errors
      if (!projectData.location_id) {
        delete projectData.location_id;
      }

      // Remove empty customer_id if not set
      if (!projectData.customer_id) {
        delete projectData.customer_id;
      }

      // Remove empty start_date if not set
      if (!projectData.start_date) {
        delete projectData.start_date;
      }

      console.log("Attempting to add project with clean payload:", projectData);
      // Rename fields to match the projects table schema
      // The projects table uses project_name instead of name
      // Generate a UUID for the id field
      const projectsPayload = {
        id: uuidv4(), // Generate a UUID for the id field
        project_name: projectData.name,
        customer_id: projectData.customer_id,
        region: projectData.region,
        start_date: projectData.start_date,
        location_id: projectData.location_id,
        status: projectData.status || "Not Started"
      };
      
      // Create a clean payload with proper typing
      interface ProjectPayload {
        id: string; // Required id field
        project_name: string;
        // Make customer_id optional to handle schema differences
        customer_id?: string;
        region?: string;
        start_date?: string;
        location_id?: string;
        status?: string;
        [key: string]: string | undefined; // More specific index signature
      }
      
      // Convert to properly typed object and clean up empty values
      const cleanPayload: ProjectPayload = { ...projectsPayload };
      Object.keys(cleanPayload).forEach(key => {
        if (cleanPayload[key] === undefined || cleanPayload[key] === null || cleanPayload[key] === '') {
          delete cleanPayload[key];
        }
      });
      
      // IMPORTANT: Remove customer_id if it's causing schema issues
      // This is a temporary workaround to allow project creation
      delete cleanPayload.customer_id;
      
      console.log('Final project payload:', cleanPayload);
      
      const { data, error } = await supabase
        .from("projects")
        .insert([cleanPayload])
        .select();

      if (error) {
        console.error("Error adding project:", error);
        alert(`Failed to add project: ${error.message}`);
        return;
      }

      console.log("Project added successfully:", data);
      // --- AUTOMATE PHASE & TASK ASSIGNMENT ---
      if (data && data.length > 0) {
        try {
          await autoAssignFirstPhaseAndTasks({
            projectId: data[0].id,
            phaseAssigneeId: effectiveProjectManager !== null ? String(effectiveProjectManager) : null,
            taskAssigneeId: taskAssignee !== null ? String(taskAssignee) : null,
          });
        } catch (err: unknown) {
          console.error("Error auto-assigning phase/tasks:", err);
          let errMsg = '';
          if (typeof err === 'object' && err && 'message' in err) {
            errMsg = (err as { message?: string }).message || '';
          } else {
            errMsg = JSON.stringify(err);
          }
          
          // Don't show error for "No phases found" - this is expected if phases haven't been set up yet
          if (errMsg === 'No phases found') {
            console.log('No phases found for auto-assignment - this is normal if phases have not been created yet');
          } else {
            alert("Project created but failed to assign initial phase/tasks: " + errMsg);
          }
        }
      }
      // Create audit log entry
      if (data && data.length > 0) {
        const projectDetails = {
          projectName: data[0].name,
          customerId: data[0].customer_id,
          startDate: data[0].start_date,
          locationId: data[0].location_id,
        };

        await createAuditLog(
          AuditAction.CREATE,
          AuditResourceType.PROJECT,
          data[0].id,
          projectDetails
        );
      }

      alert("Project added successfully!");

      // Reset form with a slight delay to ensure UI updates properly
      setTimeout(() => {
        setNewProject({
          id: "",
          name: "",
          region: "",
          customer_id: customerId || "",
          start_date: "",
          end_date: "",
          location_id: "",
          status: "Not Started"
        });
        setSelectedProvince("");
        setIsSubmitting(false);
      }, 100);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Unexpected error in handleAddProject:", error);
      alert(`An unexpected error occurred: ${error}`);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h1 className="ff-page-title">
          {customer ? `Projects for ${customer.name}` : "All Projects"}
        </h1>
      </div>
      
      {/* Connection status message */}
      {connectionStatus && (
        <div className={`ff-card mb-6 ${connectionStatus.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {connectionStatus.message}
        </div>
      )}

      {customer && (
        <div className="ff-card mb-6 bg-gray-50">
          <h3 className="ff-card-title">
            {customer.client_name}
          </h3>
          <div className="ff-secondary-text">
            {customer.client_type && <div>Type: {customer.client_type}</div>}
            {customer.contact_information && (
              <div className="mt-2">Contact: {customer.contact_information}</div>
            )}
            {customer.sla_terms && (
              <div className="mt-2">SLA: {customer.sla_terms}</div>
            )}
          </div>
        </div>
      )}

      {/* Add new project form */}
      <section className="ff-section">
        <h2 className="ff-section-title">Add New Project</h2>
        <div className="ff-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Project Name *"
              className="ff-input"
              value={newProject.name || ""}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
          </div>
          <div>
            <select
              className="ff-input"
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                // Find the selected province and set its region
                const province = provinces.find(p => p.id === e.target.value);
                if (province) {
                  setNewProject({ ...newProject, region: province.region });
                }
              }}
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name} ({province.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Region"
              className="ff-input"
              value={newProject.region || ""}
              onChange={(e) =>
                setNewProject({ ...newProject, region: e.target.value })
              }
              disabled={selectedProvince !== ""}
              title={selectedProvince ? "Region is auto-filled from selected province" : ""}
            />
          </div>
          <div>
            <input
              type="date"
              placeholder="Start Date"
              className="ff-input"
              value={newProject.start_date || ""}
              onChange={(e) =>
                setNewProject({ ...newProject, start_date: e.target.value })
              }
            />
          </div>
          <div>
            <select
              className="ff-input"
              value={newProject.location_id || ""}
              onChange={(e) =>
                setNewProject({ ...newProject, location_id: e.target.value })
              }
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.location_name}
                </option>
              ))}
            </select>
          </div>
          {!customerId && (
            <div className="md:col-span-3">
              <select
                className="ff-input"
                value={newProject.customer_id || ""}
                onChange={(e) =>
                  setNewProject({ ...newProject, customer_id: e.target.value })
                }
              >
                <option value="">Select Customer *</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.client_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <ProjectAssigneeDropdown
              value={projectManager}
              onChange={setProjectManager}
              label="Project Manager *"
            />
          </div>
          <div className="md:col-span-2">
            <ProjectAssigneeDropdown
              value={taskAssignee}
              onChange={setTaskAssignee}
              label="Default Task Assignee (optional)"
            />
          </div>
          <div className={customerId ? "md:col-span-3" : ""}>
            <button
              className={`w-full ${
                isSubmitting 
                  ? "bg-gray-400 cursor-not-allowed text-white px-6 py-2 rounded-lg" 
                  : "ff-button-primary"
              }`}
              onClick={handleAddProject}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding Project..." : "Add Project"}
            </button>
          </div>
        </div>
        </div>
      </section>

      {/* Projects list */}
      <section className="ff-section">
        <h2 className="ff-section-title">Projects</h2>
        {loading ? (
          <p className="ff-secondary-text">Loading...</p>
        ) : (
          <div className="ff-table-container">
            <table className="min-w-full">
              <thead className="ff-table-header">
                <tr>
                  <th className="ff-table-header-cell">
                  Project Name
                  </th>
                  {!customer && (
                    <th className="ff-table-header-cell">
                      Customer
                    </th>
                  )}
                  <th className="ff-table-header-cell">
                    Province
                  </th>
                  <th className="ff-table-header-cell">
                    Region
                  </th>
                  <th className="ff-table-header-cell">
                    Start Date
                  </th>
                  <th className="ff-table-header-cell">
                    Location
                  </th>
                  <th className="ff-table-header-cell">
                    Actions
                  </th>
              </tr>
            </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="ff-table-row">
                    <td className="ff-table-cell">
                      {project.name}
                    </td>
                    {!customer && (
                      <td className="ff-table-cell">
                        {project.customers?.client_name || "Unknown"}
                      </td>
                    )}
                    <td className="ff-table-cell-secondary">
                      {provinces.find(p => p.region === project.region)?.name || "-"}
                    </td>
                    <td className="ff-table-cell-secondary">
                      {project.region}
                    </td>
                    <td className="ff-table-cell-secondary">
                      {project.start_date || "Not set"}
                    </td>
                    <td className="ff-table-cell-secondary">
                      {project.location_id
                        ? locations.find((l) => l.id === project.location_id)
                            ?.location_name || project.location_id
                        : "Not set"}
                    </td>
                    <td className="ff-table-cell">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View
                      </Link>
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

// Wrap the component in a Suspense boundary as required by Next.js
export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
