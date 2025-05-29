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
  location_id?: string;
  province?: string;
  region?: string;
  new_customers?: Customer;
}

interface Location {
  id: string;
  location_name: string;
}



interface Customer {
  id: string;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  email?: string;
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
    province: "",
    region: "",
    customer_id: customerId || "",
    start_date: "",
    location_id: "",
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [projectManager, setProjectManager] = useState<number | null>(null);
  const [taskAssignee, setTaskAssignee] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean, message: string} | null>(null);

  // Define fetch functions with useCallback to prevent infinite loops
  const fetchCustomers = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("new_customers")
        .select("*")
        .order("name");
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

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    console.log('Fetching data with Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    try {
      // Fetch customer if customerId is provided
      if (customerId) {
        const { data: customerData, error: customerError } = await supabase
          .from("new_customers")
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
            name: project.project_name || 'Unnamed Project', // Use project_name as the name field
            customer_id: project.customer_id,
            created_at: project.created_at,
            start_date: project.start_date,
            location_id: project.location_id,
            province: project.province || '',
            region: project.region || '',
            new_customers: project.new_customers
          }));
          setProjects(formattedProjects);
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
    fetchCustomers();
  }, [fetchData, fetchLocations, fetchCustomers]);
  
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
    console.log('Current form state:', { newProject, projectManager, taskAssignee });
    
    if (!newProject.name) {
      alert("Project name is required");
      return;
    }
    
    // TEMPORARY WORKAROUND: Force a default project manager value if none is selected
    let effectiveProjectManager = projectManager;
    if (projectManager === null || projectManager === undefined || isNaN(Number(projectManager))) {
      console.log('Setting default project manager as workaround');
      // Set a default value of 1 as a temporary workaround
      effectiveProjectManager = 1;
      // Set the state for future reference
      setProjectManager(1);
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
        province: projectData.province,
        region: projectData.region,
        start_date: projectData.start_date,
        location_id: projectData.location_id,
      };
      
      // Create a clean payload with proper typing
      interface ProjectPayload {
        id: string; // Required id field
        project_name: string;
        // Make customer_id optional to handle schema differences
        customer_id?: string;
        province?: string;
        region?: string;
        start_date?: string;
        location_id?: string;
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
            phaseAssigneeId: String(effectiveProjectManager), // Use project manager as the phase assignee
            taskAssigneeId: taskAssignee !== null ? String(taskAssignee) : String(effectiveProjectManager), // If no task assignee is specified, use project manager
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
          province: "",
          region: "",
          customer_id: customerId || "",
          start_date: "",
          location_id: "",
        });
      }, 100);

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Unexpected error in handleAddProject:", error);
      alert(`An unexpected error occurred: ${error}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {customer ? `Projects for ${customer.name}` : "All Projects"}
      </h2>
      
      {/* Connection status message */}
      {connectionStatus && (
        <div className={`mb-4 p-3 rounded ${connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connectionStatus.message}
        </div>
      )}

      {customer && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
            {customer.name}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {customer.address_line1 && <div>{customer.address_line1}</div>}
            {customer.address_line2 && <div>{customer.address_line2}</div>}
            {(customer.city || customer.postal_code) && (
              <div>
                {customer.city}
                {customer.city && customer.postal_code && ", "}
                {customer.postal_code}
              </div>
            )}
            {customer.email && (
              <div className="mt-2">Email: {customer.email}</div>
            )}
          </div>
        </div>
      )}

      {/* Add new project form */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
          Add New Project
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Project Name *"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Province"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.province}
              onChange={(e) =>
                setNewProject({ ...newProject, province: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Region"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.region}
              onChange={(e) =>
                setNewProject({ ...newProject, region: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="date"
              placeholder="Start Date"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.start_date}
              onChange={(e) =>
                setNewProject({ ...newProject, start_date: e.target.value })
              }
            />
          </div>
          <div>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newProject.location_id}
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
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={newProject.customer_id}
                onChange={(e) =>
                  setNewProject({ ...newProject, customer_id: e.target.value })
                }
              >
                <option value="">Select Customer *</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name}
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
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Project Name
                </th>
                {!customer && (
                  <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Province
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Region
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-2 px-4 border-b border-gray-200 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {project.name}
                  </td>
                  {!customer && (
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {project.new_customers?.name || "Unknown"}
                    </td>
                  )}
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {project.province}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {project.region}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {project.start_date || "Not set"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {project.location_id
                      ? locations.find((l) => l.id === project.location_id)
                          ?.location_name || project.location_id
                      : "Not set"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:underline"
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
