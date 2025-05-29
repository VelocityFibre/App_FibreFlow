import React from "react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  code: string;
}

interface BOQManagementCardProps {
  loading: boolean;
  activeProjects: Project[];
}

export default function BOQManagementCard({
  loading,
  activeProjects,
}: BOQManagementCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">BOQ Management</h2>
        <div className="flex space-x-2">
          <Link
            href="/stock-management/boq/new"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600"
          >
            Create BOQ
          </Link>
          <Link
            href="/stock-management/boq"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Selection Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Create BOQ for Project
            </h3>
            {activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {activeProjects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/stock-management/boq/new?project=${project.id}`}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-green-700 dark:text-green-300">
                        {project.name}
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Project Code: {project.code}
                      </p>
                    </div>
                    <span className="text-green-600 dark:text-green-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No active projects found. Create a project first.
              </p>
            )}
          </div>

          {/* BOQ Templates Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              BOQ Templates
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/stock-management/boq/templates/fibre-deployment"
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">
                    Fibre Deployment
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Standard fibre deployment materials
                  </p>
                </div>
                <span className="text-blue-600 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </Link>
              <Link
                href="/stock-management/boq/templates/customer-installation"
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">
                    Customer Installation
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Home/business customer connection kit
                  </p>
                </div>
                <span className="text-blue-600 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
