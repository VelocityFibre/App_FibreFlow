"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ModuleOverviewLayout from "@/components/ModuleOverviewLayout";
import ModuleOverviewCard from "@/components/ModuleOverviewCard";
import { ProjectList } from "@/components/ProjectHierarchy";
import { FiFolder, FiCalendar, FiAlertCircle, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customer");
  const view = searchParams.get("view");

  // Show overview if no specific view is requested
  if (!view) {
    return (
      <ModuleOverviewLayout 
        title="Projects" 
        description="Manage and track all your fibre deployment projects"
      >
        <ModuleOverviewCard
          title="Project Management"
          description="Manage your projects, track progress, and assign resources using the new hierarchy system."
          actionLabel="View Projects"
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

  // Show project management view
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Project Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your fiber optic installation projects with complete hierarchy visibility
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Feature Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FiFolder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🚀 New Hierarchy System
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Click on any project card to expand and view the complete Project → Phases → Steps → Tasks hierarchy with real-time progress tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Project List Component */}
      <div className="space-y-6">
        <ProjectList 
          customerId={customerId || undefined}
          showArchived={false}
        />
      </div>

      {/* Archived Projects Section */}
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Archived Projects
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Projects that have been archived but can be restored
          </p>
        </div>
        
        <ProjectList 
          customerId={customerId || undefined}
          showArchived={true}
        />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading projects...</span>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}