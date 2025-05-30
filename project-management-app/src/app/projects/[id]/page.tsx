"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { ProjectHierarchyView } from "@/components/ProjectHierarchy";
import { FiArrowLeft, FiEdit, FiCalendar, FiMapPin, FiUser, FiClock, FiExternalLink } from 'react-icons/fi';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const projectId = Array.isArray(id) ? id[0] : id;
  
  // Handle special routes - "new" should redirect to dedicated page
  if (projectId === 'new') {
    // This shouldn't happen since we have a dedicated /projects/new page
    // But if someone manually navigates here, redirect them
    if (typeof window !== 'undefined') {
      window.location.href = '/projects/new';
    }
    return null;
  }
  
  // Get project basic info using the existing hook
  const { projects, isLoading, error } = useProjects();
  const project = projects.find(p => p.id === projectId);
  
  // Debug info is available in the console and will be shown if project not found

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading project details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error loading project
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <Link 
            href="/projects?view=management"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FiArrowLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Project not found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          
          {/* Debug Information */}
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 max-w-md mx-auto">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              <strong>Debug Info:</strong>
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              • Requested project ID: {projectId}<br/>
              • Total projects available: {projects.length}<br/>
              • Loading state: {isLoading ? 'Yes' : 'No'}<br/>
              • Error: {error ? error.message : 'None'}
            </p>
            {projects.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs text-yellow-600 dark:text-yellow-400 cursor-pointer">
                  Show available projects
                </summary>
                <pre className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 whitespace-pre-wrap">
                  {JSON.stringify(projects.map(p => ({ 
                    id: p.id, 
                    name: p.name || p.project_name 
                  })), null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          <div className="mt-6">
            <Link 
              href="/projects?view=management"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <FiArrowLeft className="mr-1 h-4 w-4" />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get display name
  const displayName = project.name || project.project_name || 'Unnamed Project';

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link 
              href="/projects?view=management"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
            >
              <FiArrowLeft className="mr-1 h-4 w-4" />
              Back to Projects
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete project hierarchy with real-time progress tracking
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/projects/${projectId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
            
            <button
              onClick={() => window.open(`/projects/${projectId}/report`, '_blank')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiExternalLink className="mr-2 h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Project Summary Card */}
      <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Project Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Customer */}
          {project.customer_id && (
            <div className="flex items-center">
              <FiUser className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</p>
                <p className="text-sm text-gray-900 dark:text-white">{project.customer_id}</p>
              </div>
            </div>
          )}
          
          {/* Start Date */}
          {project.start_date && (
            <div className="flex items-center">
              <FiCalendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          
          {/* Location */}
          {(project.province || project.region) && (
            <div className="flex items-center">
              <FiMapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {[project.province, project.region].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
          
          {/* Created Date */}
          {project.created_at && (
            <div className="flex items-center">
              <FiClock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              ✨ Enhanced Project View
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              This view shows the complete project hierarchy with phases, steps, and tasks. Click on any section to expand and see detailed information including assignees, dependencies, and progress tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Project Hierarchy Component */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Hierarchy
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete breakdown of phases, steps, and tasks with real-time progress tracking
          </p>
        </div>
        
        {/* Main Hierarchy View */}
        <ProjectHierarchyView 
          projectId={projectId} 
          defaultExpanded={true}
        />
      </div>

      {/* Back to Projects Link */}
      <div className="mt-8 text-center">
        <Link 
          href="/projects?view=management"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Back to Project Management
        </Link>
      </div>
    </div>
  );
}