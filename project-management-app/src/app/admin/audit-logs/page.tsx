"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}

interface AuditLogFilters {
  action?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({ action: '', resourceType: '', dateFrom: '', dateTo: '' });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false });

      // Apply filters if set
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.resourceType) {
        query = query.eq("resource_type", filters.resourceType);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo + "T23:59:59");
      }

      const { data, error } = await query.limit(100);
      
      if (error) {
        console.error("Error fetching audit logs:", error);
      } else {
        setLogs(data || []);
      }
    } catch {
      console.error("Unexpected error in fetchAuditLogs:");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(name: keyof AuditLogFilters, value: string) {
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }

  function formatDetails(details: AuditLog['details']) {
    if (!details) return "No details";
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return "Invalid details format";
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Audit Logs</h1>
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
            <select
              name="resourceType"
              value={filters.resourceType}
              onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Resources</option>
              <option value="customer">Customer</option>
              <option value="project">Project</option>
              <option value="location">Location</option>
              <option value="contact">Contact</option>
              <option value="contractor">Contractor</option>
              <option value="stock_item">Stock Item</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchAuditLogs}
            className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Logs table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">No audit logs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Timestamp</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">User</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Action</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Resource Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Resource ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{formatTimestamp(log.created_at)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{log.user_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      log.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      log.action === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{log.resource_type}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{log.resource_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    <details>
                      <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-w-xs max-h-32">
                        {formatDetails(log.details)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
