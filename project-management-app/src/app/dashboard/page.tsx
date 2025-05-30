"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

type Project = {
  id: string;
  name: string;
  project_name?: string;
  created_at?: string;
};

type StockMovement = {
  id: string;
  type: string;
  created_at?: string;
};

export default function DashboardPage() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentStockMovements, setRecentStockMovements] = useState<StockMovement[]>([]);

  // Placeholder for data fetching
  useEffect(() => {
    // This would normally fetch data from your API
    // For now, we'll use empty arrays
    setRecentProjects([]);
    setRecentStockMovements([]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#003049] dark:text-white mb-4">Welcome to FiberFlow</h1>
        <p className="text-lg text-gray-900 dark:text-gray-100 mb-8 max-w-3xl mx-auto font-medium">
          FiberFlow is your modern project management platform for fiber deployment and
          infrastructure projects. Track progress, manage materials, collaborate with your
          team, and visualize your workflow - all in one place.
        </p>
      </div>
      
      {/* New Feature Announcement */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              🚀 New: Complete Project Hierarchy System
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Experience the new 4-level project structure: Project → Phases → Steps → Tasks with real-time progress tracking, status indicators, and expandable hierarchy views.
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/projects?view=management"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try New Project View
          </Link>
          <a 
            href="#features" 
            className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-200 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Project Overview Card - Enhanced */}
        <Link href="/projects?view=management" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-[#003049] dark:text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-[#003049] dark:text-white">Project Hierarchy ✨ NEW</h3>
          </div>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Manage projects with complete 4-level hierarchy, progress tracking, and expandable views.</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            Enhanced
          </span>
        </Link>
        
        {/* Visualization Card */}
        <Link href="/analytics/dashboard" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-2">Visualize and manage project tasks</h3>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Interactive dashboards to monitor progress and performance.</p>
        </Link>
        
        {/* Timeline Card */}
        <Link href="/gantt" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-2">Timeline view for project planning</h3>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Schedule and track project milestones with ease.</p>
        </Link>
      </div>
      
      {/* Second Row of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Data Management Card */}
        <Link href="/grid" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-2">Spreadsheet-style data management</h3>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Organize and analyze project data efficiently.</p>
        </Link>
        
        {/* Materials Card */}
        <Link href="/materials" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-2">Track site materials and stock</h3>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Manage inventory and material allocation across projects.</p>
        </Link>
        
        {/* User Management Card */}
        <Link href="/admin/auth" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-2">User login, registration, and roles</h3>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Control access and permissions for team members.</p>
        </Link>
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Recent Projects */}
        <div className="p-6 border border-[#e0eaf3] dark:border-[#00527b] rounded-lg bg-[#f0f5f9] dark:bg-[#00406a] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-[#003049] dark:text-white">Recent Projects</h3>
            <Link href="/projects" className="text-sm text-[#003049] dark:text-blue-300 hover:underline">View all</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-900 dark:text-gray-100">No recent projects found</p>
              <Link href="/projects/new" className="mt-3 px-4 py-2 bg-[#003049] text-white text-sm font-medium rounded-md transition-colors inline-block hover:bg-[#00406a]">
                Create Project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {recentProjects.map((proj) => (
                <div key={proj.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{proj.name || proj.project_name || `Project #${proj.id}`}</h4>
                    <p className="text-xs text-gray-900 dark:text-gray-100">{proj.created_at?.slice(0, 10)}</p>
                  </div>
                  <Link href={`/projects/${proj.id}`} className="text-xs text-[#003049] dark:text-blue-300 hover:underline">View</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Materials Tracking (renamed from Stock Items) */}
        <div className="p-6 border border-[#e0eaf3] dark:border-[#00527b] rounded-lg bg-[#f0f5f9] dark:bg-[#00406a] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-[#003049] dark:text-white">Materials Tracking</h3>
            <Link href="/materials" className="text-sm text-[#003049] dark:text-blue-300 hover:underline">View all</Link>
          </div>
          {recentStockMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-900 dark:text-gray-100">No materials tracking data found</p>
              <Link href="/materials/new" className="mt-3 px-4 py-2 bg-[#003049] text-white text-sm font-medium rounded-md transition-colors inline-block hover:bg-[#00406a]">
                Manage Materials
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {recentStockMovements.map((move) => (
                <div key={move.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{move.type || `Movement #${move.id}`}</h4>
                    <p className="text-xs text-gray-900 dark:text-gray-100">{move.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {move.type === 'IN' ? 'Received' : 'Shipped'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-900 dark:text-gray-100 mt-8 text-center">
        Use the sidebar to navigate between features. For help, see the README or project plan.
      </p>
    </div>
  );
}