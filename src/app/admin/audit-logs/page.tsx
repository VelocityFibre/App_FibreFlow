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
    <div className="space-y-12">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-8 mb-12">
        <h1 className="text-5xl font-light text-gray-900 mb-4">Audit Logs</h1>
        <p className="text-xl text-gray-600 font-light">Monitor system activity and user actions</p>
      </div>
      
      {/* Filters Section */}
      <section className="mb-20">
        <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-3xl font-light text-gray-900 mb-12">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                name="action"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                name="resourceType"
                value={filters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={fetchAuditLogs}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </section>
      
      {/* Logs Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-light text-gray-900 mb-12">Activity Log</h2>
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 font-light">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-xl">
            <p className="text-xl text-gray-600 font-light">No audit logs found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Timestamp</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">User</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Action</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Resource Type</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Resource ID</th>
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900">{formatTimestamp(log.created_at)}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">{log.user_id}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          log.action === 'create' ? 'bg-green-100 text-green-700' :
                          log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                          log.action === 'delete' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{log.resource_type}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 font-mono">{log.resource_id}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        <details>
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">View Details</summary>
                          <pre className="mt-3 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-w-xs max-h-32 border border-gray-100">
                            {formatDetails(log.details)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
