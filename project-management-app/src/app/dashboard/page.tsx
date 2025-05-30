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
      
      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Project Overview Card */}
        <Link href="/projects" className="bg-[#f0f5f9] dark:bg-[#00406a] p-6 rounded-lg shadow-sm border border-[#e0eaf3] dark:border-[#00527b] hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-medium text-[#003049] dark:text-white mb-2">Project overview, stats, and quick links</h3>
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-4">Get a comprehensive view of your projects at a glance.</p>
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