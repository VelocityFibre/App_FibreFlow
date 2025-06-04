"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProjectHierarchyTree } from "@/components/hierarchy/ProjectHierarchyTree";

// --- TypeScript interfaces ---
interface Project {
  id: string;
  name?: string;
  project_name?: string; // Add project_name field to match database schema
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


export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);


  async function fetchProject() {
    setLoading(true);
    console.log('Fetching project with ID:', id);
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error) {
      console.error('Error fetching project:', error);
      setLoading(false);
      return;
    }
    setProject(data);
    setLoading(false);
  }

  async function fetchLocation() {
    if (!project?.location_id) return;
    const { data: locationData, error: locationError } = await supabase
      .from("locations")
      .select("*")
      .eq("id", project.location_id)
      .single();
    if (locationError) {
      console.error('Error fetching location:', locationError);
    } else {
      setLocation(locationData);
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  if (loading) return (<div className="p-8">Loading...</div>);
  if (!project) return (<div className="p-8 text-red-500">Project not found.</div>);

  return (
    <div className="ff-page-container">
      <div className="ff-page-header">
        <h1 className="ff-page-title">{project.project_name || project.name || `Project #${project.id}`}</h1>
      </div>
      
      <section className="ff-section">
        <h2 className="ff-section-title">Project Details</h2>
        <div className="ff-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer ID</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{project.customer_id || 'Not assigned'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{project.created_at?.slice(0,10) || 'Unknown'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{project.start_date || 'Not set'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {location ? location.location_name : (project.location_id || 'Not assigned')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Province</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{project.province || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Region</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{project.region || 'Not specified'}</p>
          </div>
          </div>
        </div>
      </section>
      
      {/* --- NEW 4-LEVEL HIERARCHY SECTION --- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Project Hierarchy</h2>
          <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded">
            NEW: 4-Level Structure
          </span>
        </div>
        <ProjectHierarchyTree projectId={id as string} />
      </div>

      {/* Project Management Actions */}
      <section className="ff-section">
        <h2 className="ff-section-title">Project Management</h2>
        <div className="ff-grid-cards">
          <Link href={`/projects/${id}/tasks`} className="ff-card cursor-pointer group">
            <h3 className="ff-card-title group-hover:text-blue-600">Task Management</h3>
            <p className="ff-card-content">View and manage project phases, tasks, and assignments</p>
          </Link>
          
          <Link href={`/kanban?project=${id}`} className="ff-card cursor-pointer group">
            <h3 className="ff-card-title group-hover:text-blue-600">Kanban Board</h3>
            <p className="ff-card-content">Visual workflow management for this project</p>
          </Link>
          
          <Link href={`/projects`} className="ff-card cursor-pointer group">
            <h3 className="ff-card-title group-hover:text-blue-600">All Projects</h3>
            <p className="ff-card-content">Return to the projects overview</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

