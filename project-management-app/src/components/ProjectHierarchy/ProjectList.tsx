"use client";
import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  customerId?: string;
  limit?: number;
  showArchived?: boolean;
}

/**
 * Simple ProjectList component for displaying projects
 * 
 * No virtualization for current scale (10 projects) - will add virtualization
 * when we reach 50-100+ projects as per implementation roadmap.
 * 
 * Features:
 * - Clean grid layout
 * - Loading states
 * - Error handling
 * - Empty state messaging
 * - Project cards with expandable hierarchy
 */
export const ProjectList: React.FC<ProjectListProps> = ({ 
  customerId, 
  limit, 
  showArchived = false 
}) => {
  const { projects, isLoading, error } = useProjects(limit, showArchived);
  
  // Note: Debug info will be shown in the UI when no projects are found
  
  // Filter by customer if specified
  const filteredProjects = React.useMemo(() => {
    if (!customerId) return projects;
    return projects.filter(project => project.customer_id === customerId);
  }, [projects, customerId]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={index}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Error loading projects
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {showArchived ? 'No archived projects' : 'No active projects'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {customerId 
            ? `No ${showArchived ? 'archived' : 'active'} projects found for this customer`
            : `${showArchived ? 'No archived projects found' : 'Get started by creating your first project'}`
          }
        </p>
        
        {/* Debug Information */}
        {!showArchived && !customerId && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              <strong>Debug Info:</strong>
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              • Total projects loaded: {projects.length}<br/>
              • Show archived: {showArchived ? 'Yes' : 'No'}<br/>
              • Customer filter: {customerId || 'None'}<br/>
              • Loading: {isLoading ? 'Yes' : 'No'}<br/>
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
                    name: p.name || p.project_name,
                    archived_at: p.archived_at 
                  })), null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Projects count header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
          {showArchived && ' (Archived)'}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {showArchived ? 'Showing archived items' : 'Showing active items'}
        </span>
      </div>

      {/* Projects grid - responsive layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project}
            showArchived={showArchived}
          />
        ))}
      </div>

      {/* Performance note for future optimization */}
      {filteredProjects.length > 50 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                <strong>Performance note:</strong> You have {filteredProjects.length} projects. 
                Consider enabling virtualization when you reach 100+ projects for optimal performance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;