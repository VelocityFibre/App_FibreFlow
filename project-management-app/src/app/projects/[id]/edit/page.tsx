"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { createAuditLog, AuditAction, AuditResourceType } from "@/lib/auditLogger";

interface Project {
  id: string;
  project_name: string;
  customer_id?: string;
  created_at?: string;
  start_date?: string;
  location_id?: string;
  province?: string;
  region?: string;
}

interface Location {
  id: string;
  location_name: string;
}

interface Customer {
  id: string;
  name: string;
}

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project>({
    id: "",
    project_name: "",
    province: "",
    region: "",
    start_date: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();
        
        if (projectError) {
          console.error("Error fetching project:", projectError);
          setError(`Error fetching project: ${projectError.message}`);
          setLoading(false);
          return;
        }
        
        if (!projectData) {
          setError("Project not found");
          setLoading(false);
          return;
        }
        
        setProject(projectData);
        
        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("*")
          .order("location_name");
        
        if (locationsError) {
          console.error("Error fetching locations:", locationsError);
        } else {
          setLocations(locationsData || []);
        }
        
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("new_customers")
          .select("id, name")
          .order("name");
        
        if (customersError) {
          console.error("Error fetching customers:", customersError);
        } else {
          setCustomers(customersData || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
    
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Create a clean payload with only fields that exist in the database
      const payload = {
        project_name: project.project_name,
        start_date: project.start_date || null,
        location_id: project.location_id || null,
        // NOTE: province, region, and customer_id fields don't exist in the database schema
      };
      
      // Remove null values to prevent overwriting with nulls
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === null) {
          delete payload[key as keyof typeof payload];
        }
      });
      
      // Update project
      const { error: updateError } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", projectId);
      
      if (updateError) {
        console.error("Error updating project:", updateError);
        setError(`Failed to update project: ${updateError.message}`);
        setSaving(false);
        return;
      }
      
      // Create audit log
      await createAuditLog(
        AuditAction.UPDATE,
        AuditResourceType.PROJECT,
        projectId,
        payload
      );
      
      // Navigate back to project details
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error("Unexpected error in handleSubmit:", error);
      setError("An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Project</h2>
          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
            Update project details for {project.project_name}
          </p>
        </div>
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Project Name *
              </label>
              <input
                type="text"
                id="project-name"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={project.project_name || ""}
                onChange={(e) => setProject({ ...project, project_name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={project.start_date || ""}
                onChange={(e) => setProject({ ...project, start_date: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Province
              </label>
              <input
                type="text"
                id="province"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={project.province || ""}
                onChange={(e) => setProject({ ...project, province: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Region
              </label>
              <input
                type="text"
                id="region"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={project.region || ""}
                onChange={(e) => setProject({ ...project, region: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Customer
              </label>
              <select
                id="customer"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={project.customer_id || ""}
                onChange={(e) => setProject({ ...project, customer_id: e.target.value || undefined })}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Location
              </label>
              <select
                id="location"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
                value={project.location_id || ""}
                onChange={(e) => setProject({ ...project, location_id: e.target.value || undefined })}
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.location_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003049] hover:bg-[#00406a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003049] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
