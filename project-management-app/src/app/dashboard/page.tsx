"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const KPI_CONFIG = [
  { label: "Projects", table: "new_projects", link: "/projects" },
  { label: "Contacts", table: "contacts" },
  { label: "Contractors", table: "contractors" },
  { label: "Stock Items", table: "stock_items" },
  { label: "Locations", table: "locations" },
  { label: "Customers", table: "new_customers", link: "/customers" },
];

type KPI = {
  label: string;
  count: number;
};

type Project = {
  id: string;
  name?: string;
  created_at?: string;
};

type StockMovement = {
  id: string;
  type?: string;
  created_at?: string;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentStockMovements, setRecentStockMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    async function fetchKPIs() {
      const results = await Promise.all(
        KPI_CONFIG.map(async ({ label, table }) => {
          const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
          return { label, count: count || 0 };
        })
      );
      setKpis(results);
    }
    async function fetchRecentProjects() {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentProjects(projects || []);
    }
    async function fetchRecentStockMovements() {
      const { data: stockMovements } = await supabase
        .from("stock_movements")
        .select("id, created_at, type")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentStockMovements(stockMovements || []);
    }
    fetchKPIs();
    fetchRecentProjects();
    fetchRecentStockMovements();
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your projects and activities</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Export
          </button>
          <button className="px-4 py-2 bg-black dark:bg-white rounded-md text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            New Project
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const config = KPI_CONFIG[idx];
          if (!config) return null;
          
          const cardContent = (
            <>
              <div className="w-full">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-semibold text-gray-900 dark:text-white">{kpi.count}</span>
                </div>
              </div>
            </>
          );
          
          return config.link ? (
            <a 
              key={kpi.label} 
              href={config.link} 
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {cardContent}
            </a>
          ) : (
            <div 
              key={kpi.label} 
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900"
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Project Progress</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Weekly</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md">Monthly</button>
            </div>
          </div>
          <div className="h-64 w-full flex items-end justify-between px-2">
            {/* Simulated chart bars */}
            <div className="flex flex-col items-center">
              <div className="h-32 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Jan</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-48 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Feb</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Mar</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-56 w-12 bg-gray-900 dark:bg-gray-100 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Apr</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-40 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">May</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Jun</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Jul</span>
            </div>
          </div>
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-6">Project Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">65%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">25%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">10%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div className="bg-gray-900 dark:bg-gray-100 h-1 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent Projects</h3>
            <a href="/projects" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">View all</a>
          </div>
          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No recent projects found</p>
              <a href="/projects" className="mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                Create Project
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentProjects.map((proj) => (
                <div key={proj.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{proj.name || `Project #${proj.id}`}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{proj.created_at?.slice(0, 10)}</p>
                  </div>
                  <a href={`/projects/${proj.id}`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">View</a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Stock Movements</h3>
            <a href="/materials" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">View all</a>
          </div>
          {recentStockMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No recent stock movements</p>
              <a href="/materials" className="mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                Manage Inventory
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentStockMovements.map((move) => (
                <div key={move.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{move.type || `Movement #${move.id}`}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{move.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {move.type === 'IN' ? 'Received' : 'Shipped'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
