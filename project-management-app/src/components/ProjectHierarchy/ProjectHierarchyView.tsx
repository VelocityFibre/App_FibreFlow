"use client";
import React from 'react';
import { useProjectHierarchy } from '@/hooks/useProjectHierarchy';
import PhaseAccordion from './PhaseAccordion';
import { FiLoader, FiAlertCircle, FiFolder } from 'react-icons/fi';

interface ProjectHierarchyViewProps {
  projectId: string;
  defaultExpanded?: boolean;
}

/**
 * ProjectHierarchyView displays the complete 4-level hierarchy
 * for a project: Project → Phases → Steps → Tasks
 * 
 * Features:
 * - Fetches complete hierarchy using RPC functions
 * - Loading and error states
 * - Expandable phases with nested steps and tasks
 * - Real-time updates (when integrated with subscriptions)
 */
export const ProjectHierarchyView: React.FC<ProjectHierarchyViewProps> = ({ 
  projectId,
  defaultExpanded = false 
}) => {
  const { data: projectHierarchy, isLoading, error } = useProjectHierarchy(projectId);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <FiLoader className="animate-spin h-5 w-5 mr-2" />
          <span>Loading project hierarchy...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <FiAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Failed to load project hierarchy
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!projectHierarchy) {
    return (
      <div className="p-6 text-center">
        <FiFolder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Project not found
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This project may have been deleted or you may not have access to it.
        </p>
      </div>
    );
  }

  const phases = projectHierarchy.phases || [];

  if (phases.length === 0) {
    return (
      <div className="p-6 text-center">
        <FiFolder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          No phases defined
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          This project doesn't have any phases set up yet.
        </p>
        <div className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
          <p className="text-blue-700 dark:text-blue-300">
            <strong>Next steps:</strong> Add phases like Planning, IP, WIP, Handover, HOC, and FAC to structure this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Project Summary Header */}
      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {projectHierarchy.name}
            </h3>
            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{phases.length} phases</span>
              <span className="mx-2">•</span>
              <span>{phases.reduce((total, phase) => total + (phase.steps?.length || 0), 0)} steps</span>
              <span className="mx-2">•</span>
              <span>
                {phases.reduce((total, phase) => 
                  total + (phase.steps?.reduce((stepTotal, step) => 
                    stepTotal + (step.tasks?.length || 0), 0) || 0), 0
                )} tasks
              </span>
            </div>
          </div>
          
          {/* Project Progress */}
          {projectHierarchy.progress_percentage !== undefined && (
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</div>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectHierarchy.progress_percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {projectHierarchy.progress_percentage}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-3">
        {phases
          .sort((a, b) => a.order_index - b.order_index)
          .map((phase) => (
            <PhaseAccordion 
              key={phase.id}
              phase={phase}
              projectId={projectId}
              isExpanded={defaultExpanded}
            />
          ))}
      </div>

      {/* Hierarchy Summary Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Project ID: {projectId.slice(0, 8)}...</span>
          <span>Last updated: {new Date(projectHierarchy.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectHierarchyView;