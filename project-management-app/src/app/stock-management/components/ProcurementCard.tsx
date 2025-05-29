import React from "react";
import Link from "next/link";

interface ProcurementCardProps {
  loading: boolean;
}

export default function ProcurementCard({ loading }: ProcurementCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Procurement</h2>
        <Link
          href="/stock-management/procurement"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Procurement Actions */}
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/stock-management/procurement/rfq/new"
              className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div>
                <h3 className="font-medium text-purple-700 dark:text-purple-300">
                  Create New RFQ
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Request quotes from suppliers
                </p>
              </div>
              <span className="text-purple-600 dark:text-purple-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </span>
            </Link>

            <Link
              href="/stock-management/procurement/po/new"
              className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <div>
                <h3 className="font-medium text-indigo-700 dark:text-indigo-300">
                  Create Purchase Order
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Generate new purchase order
                </p>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
            </Link>
          </div>

          {/* Quote Comparison Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Quote Comparison
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Compare supplier quotes to find the best prices and optimal supplier mix.
              </p>
              <Link
                href="/stock-management/procurement/comparison"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-600"
              >
                View Comparisons
              </Link>
            </div>
          </div>

          {/* Procurement Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-1">
                Open RFQs
              </h4>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">0</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">
                Pending Orders
              </h4>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
