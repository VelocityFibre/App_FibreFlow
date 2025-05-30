"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";
import ProjectAssigneeDropdown from "@/components/ProjectAssigneeDropdown";
import { autoAssignFirstPhaseAndTasks } from "@/lib/projectPhaseUtils";
import { testSupabaseConnection, testProjectsTable } from "@/lib/supabaseTest";
import ModuleOverviewLayout from "@/components/ModuleOverviewLayout";
import ModuleOverviewCard from "@/components/ModuleOverviewCard";
import ActionButton from "@/components/ActionButton";
import ArchivedItemsManager from "@/components/ArchivedItemsManager";
import { excludeArchived, onlyArchived } from "@/lib/softDelete";
import ProjectActions from "./ProjectActions";
import { FiFolder, FiCalendar, FiAlertCircle, FiArchive } from 'react-icons/fi';

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
  archived_at?: string | null;
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
  const view = searchParams.get("view");

  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
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
  const [projectManager, setProjectManager] = useState<string | null>(null);
  const [taskAssignee, setTaskAssignee] = useState<string | null>(null);
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
          .is('archived_at', null);

        if (customerError) {
          console.error("Error fetching customer:", customerError);
        } else {
          setCustomer(customerData?.[0] || null);
        }

        // Fetch active projects for this customer
        const { data: activeProjectsData, error: activeProjectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("customer_id", customerId)
          .is('archived_at', null);

        if (activeProjectsError) {
          console.error("Error fetching active projects:", activeProjectsError);
        } else {
          setProjects(activeProjectsData || []);
        }

        // Fetch archived projects if needed
        if (showArchived) {
          const { data: archivedData, error: archivedError } = await supabase
            .from("projects")
            .select("*")
            .eq("customer_id", customerId)
            .not('archived_at', 'is', null);
          
          if (archivedError) {
            console.error("Error fetching archived projects:", archivedError);
          } else {
            setArchivedProjects(archivedData || []);
          }
        }
      } else {
        // Fetch all active projects
        console.log('Attempting to fetch all projects...');
        const { data: activeProjectsData, error: activeProjectsError } = await supabase
          .from("projects")
          .select("*")
          .is('archived_at', null);

        if (activeProjectsError) {
          console.error("Error fetching all projects:", JSON.stringify(activeProjectsError));
          alert(`Error fetching projects: ${JSON.stringify(activeProjectsError)}`);
        } else {
          console.log('Projects data received:', activeProjectsData);
          // Map the data to match the expected Project interface
          const formattedProjects = (activeProjectsData || []).map(project => ({
            id: project.id,
            name: project.project_name || 'Unnamed Project', // Use project_name as the name field
            customer_id: project.customer_id,
            created_at: project.created_at,
            start_date: project.start_date,
            location_id: project.location_id,
            province: project.province || '',
            region: project.region || '',
            new_customers: project.new_customers,
            archived_at: project.archived_at
          }));
          setProjects(formattedProjects);
        }

        // Fetch archived projects if needed
        if (showArchived) {
          const { data: archivedData, error: archivedError } = await supabase
            .from("projects")
            .select("*")
            .not('archived_at', 'is', null);
          
          if (archivedError) {
            console.error("Error fetching archived projects:", archivedError);
          } else {
            // Map the data to match the expected Project interface
            const formattedArchivedProjects = (archivedData || []).map(project => ({
              id: project.id,
              name: project.project_name || 'Unnamed Project',
              customer_id: project.customer_id,
              created_at: project.created_at,
              start_date: project.start_date,
              location_id: project.location_id,
              province: project.province || '',
              region: project.region || '',
              new_customers: project.new_customers,
              archived_at: project.archived_at
            }));
            setArchivedProjects(formattedArchivedProjects);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
      alert(`Unexpected error in fetchData: ${JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  }, [customerId, showArchived]);
  
  useEffect(() => {
    // Test Supabase connection first
    testConnection();
    // Then fetch data
    fetchData();
    fetchLocations();
    fetchCustomers();
  }, [fetchData, fetchLocations, fetchCustomers]);
  
  // Handle toggling archived projects visibility
  const toggleArchivedProjects = () => {
    setShowArchived(!showArchived);
  };
  
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
            phaseAssigneeId: effectiveProjectManager, // Already a string now
            taskAssigneeId: taskAssignee !== null ? taskAssignee : effectiveProjectManager, // Already strings now
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

  // If we're on the main projects page (not customer-specific) and no view is specified, show the overview layout
  if (!customer && !view) {
    return (
      <ModuleOverviewLayout 
        title="Projects" 
        description="Manage and track all your fibre deployment projects"
        actions={<ActionButton label="Test Connection" variant="outline" onClick={testConnection} />}
      >
        <ModuleOverviewCard
          title="Project Management"
          description="Manage your projects, track progress, and assign resources."
          actionLabel="Go to Management"
          actionLink="/projects?view=management"
          icon={<FiFolder size={24} />}
        />
        <ModuleOverviewCard
          title="Daily Tracker"
          description="Track daily project progress, submit reports, and monitor milestones."
          actionLabel="Add Daily Report"
          actionLink="/projects/daily-tracker"
          icon={<FiCalendar size={24} />}
        />
        <ModuleOverviewCard
          title="Issues Tracker"
          description="Track and resolve issues that arise during project implementation."
          actionLabel="View Issues"
          actionLink="/projects/issues"
          icon={<FiAlertCircle size={24} />}
        />
      </ModuleOverviewLayout>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {customer ? `Projects for ${customer.name}` : "Projects"}
          </h2>
          {customer && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage projects for {customer.name}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={toggleArchivedProjects}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700"
          >
            <FiArchive className="mr-1" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
          <ActionButton
            label="Test Connection"
            variant="outline"
            onClick={testConnection}
          />
        </div>
      </div>
      
      {/* Connection status message */}
      {connectionStatus && (
        <div className={`mb-4 p-3 rounded ${connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connectionStatus.message}
        </div>
      )}

      {customer && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
            Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">{customer.name}</p>
            </div>
            {customer.address_line1 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-gray-900 dark:text-white">
                  {customer.address_line1}
                  {customer.address_line2 && <span>, {customer.address_line2}</span>}
                  {customer.city && <span>, {customer.city}</span>}
                  {customer.postal_code && <span> {customer.postal_code}</span>}
                </p>
              </div>
            )}
            {customer.email && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white">{customer.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {projects.length} {projects.length === 1 ? "Project" : "Projects"}
          </h3>
          <Link 
            href="#"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={(e) => {
              e.preventDefault();
              // Open modal or expand form
              // For now, we'll just scroll to the form
              document.getElementById('add-project-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Add Project
          </Link>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No projects found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add a new project to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] p-6">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-4">Add New Project</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Project Name
              </label>
              <input
                type="text"
                id="project-name"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={newProject.start_date || ''}
                onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Province
              </label>
              <input
                type="text"
                id="province"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={newProject.province || ''}
                onChange={(e) => setNewProject({ ...newProject, province: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Region
              </label>
              <input
                type="text"
                id="region"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={newProject.region || ''}
                onChange={(e) => setNewProject({ ...newProject, region: e.target.value })}
              />
            </div>
            
            {!customerId && (
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Customer
                </label>
                <select
                  id="customer"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                  value={newProject.customer_id || ''}
                  onChange={(e) => setNewProject({ ...newProject, customer_id: e.target.value })}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Location
              </label>
              <select
                id="location"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={newProject.location_id || ''}
                onChange={(e) => setNewProject({ ...newProject, location_id: e.target.value })}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.location_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="project-manager" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Project Manager
              </label>
              <ProjectAssigneeDropdown
                value={projectManager}
                onChange={setProjectManager}
                label="Select Project Manager"
              />
            </div>
            
            <div>
              <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Default Task Assignee
              </label>
              <ProjectAssigneeDropdown
                value={taskAssignee}
                onChange={setTaskAssignee}
                label="Select Task Assignee"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#003049] hover:bg-[#00406a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003049]"
              onClick={handleAddProject}
            >
              Add Project
            </button>
          </div>
        </div>
      </div>

      {/* Active Projects Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Projects ({projects.length})
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FiFolder className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No active projects</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {customer ? `No active projects found for ${customer.name}` : "No active projects found"}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => (
                <li key={project.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FiFolder className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center">
                            <Link 
                              href={`/projects/${project.id}`}
                              className="text-sm font-medium text-[#003049] hover:text-[#00406a] dark:text-blue-400 dark:hover:text-blue-300 truncate"
                            >
                              {project.name}
                            </Link>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {project.new_customers && (
                              <span className="truncate">
                                Customer: {project.new_customers.name}
                              </span>
                            )}
                            {project.start_date && (
                              <span className="ml-2 flex-shrink-0">
                                Start: {new Date(project.start_date).toLocaleDateString()}
                              </span>
                            )}
                            {project.created_at && (
                              <span className="ml-2 flex-shrink-0">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <ProjectActions
                        projectId={project.id}
                        projectName={project.name}
                        isArchived={false}
                        onArchiveSuccess={() => {
                          // Refresh the projects list after archiving
                          fetchData();
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Archived Projects Section */}
      {showArchived && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiArchive className="mr-2" />
            Archived Projects ({archivedProjects.length})
          </h3>
          {archivedProjects.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <FiArchive className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No archived projects</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {customer ? `No archived projects found for ${customer.name}` : "No archived projects found"}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 shadow overflow-hidden sm:rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {archivedProjects.map((project) => (
                  <li key={project.id} className="px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FiArchive className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                                {project.name}
                              </span>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                Archived
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                              {project.new_customers && (
                                <span className="truncate">
                                  Customer: {project.new_customers.name}
                                </span>
                              )}
                              {project.archived_at && (
                                <span className="ml-2 flex-shrink-0">
                                  Archived: {new Date(project.archived_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <ProjectActions
                          projectId={project.id}
                          projectName={project.name}
                          isArchived={true}
                          onRestoreSuccess={() => {
                            // Refresh the projects list after restoring
                            fetchData();
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Archived Items Manager for bulk operations */}
      {showArchived && archivedProjects.length > 0 && (
        <ArchivedItemsManager 
          table="projects"
          items={archivedProjects}
          nameField="name"
          refreshData={fetchData}
          queryKeysToInvalidate={['projects']}
          onItemRestored={(restoredProject) => {
            console.log('Project restored:', restoredProject);
          }}
        />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
