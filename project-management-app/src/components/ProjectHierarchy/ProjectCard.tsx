"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/hooks/useProjects';
import { FiFolder, FiChevronDown, FiChevronRight, FiCalendar, FiUser, FiMapPin, FiArchive } from 'react-icons/fi';
import ProjectHierarchyView from './ProjectHierarchyView';

interface ProjectCardProps {
  project: Project;
  showArchived?: boolean;
}

/**
 * ProjectCard component displays a single project with expandable hierarchy
 * 
 * Features:
 * - Project basic info (name, dates, location)
 * - Expandable to show phases/steps/tasks (future implementation)
 * - Archive status indicator
 * - Responsive design
 * - Dark mode support
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  showArchived = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the display name (handle both name and project_name fields)
  const displayName = project.name || project.project_name || 'Unnamed Project';
  
  // Format dates
  const createdDate = project.created_at 
    ? new Date(project.created_at).toLocaleDateString()
    : null;
  const startDate = project.start_date 
    ? new Date(project.start_date).toLocaleDateString()
    : null;
  const archivedDate = project.archived_at 
    ? new Date(project.archived_at).toLocaleDateString()
    : null;

  const isArchived = !!project.archived_at;

  return (
    <div className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
      ${isArchived ? 'opacity-75' : ''}
    `}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0">
              {isArchived ? (
                <FiArchive className="h-5 w-5 text-gray-400" />
              ) : (
                <FiFolder className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center">
                <Link 
                  href={`/projects/${project.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                >
                  {displayName}
                </Link>
                {isArchived && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    Archived
                  </span>
                )}
              </div>
              
              {/* Project metadata */}
              <div className="mt-1 flex flex-col space-y-1">
                {startDate && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiCalendar className="mr-1 h-3 w-3" />
                    Start: {startDate}
                  </div>
                )}
                
                {project.province && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiMapPin className="mr-1 h-3 w-3" />
                    {project.province}{project.region && `, ${project.region}`}
                  </div>
                )}
                
                {project.current_phase && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiUser className="mr-1 h-3 w-3" />
                    Phase: {project.current_phase}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Expand/Collapse button for future hierarchy */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse project details' : 'Expand project details'}
          >
            {isExpanded ? (
              <FiChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <FiChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable content area - project hierarchy */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ProjectHierarchyView projectId={project.id} />
        </div>
      )}

      {/* Card Footer with quick actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ID: {project.id.slice(0, 8)}...
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/projects/${project.id}`}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View Details
            </Link>
            {!isArchived && (
              <Link
                href={`/projects/${project.id}/edit`}
                className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;