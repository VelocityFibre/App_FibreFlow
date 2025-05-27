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

export default function DashboardPage() {
  const [kpis, setKpis] = useState<{ label: string; count: number }[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentStockMovements, setRecentStockMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    async function fetchRecent() {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentProjects(projects || []);
      const { data: stockMovements } = await supabase
        .from("stock_movements")
        .select("id, created_at, type")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentStockMovements(stockMovements || []);
      setLoading(false);
    }
    fetchKPIs();
    fetchRecent();
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
  const config = KPI_CONFIG[idx];
  const cardContent = (
    <>
      <span className="text-lg text-gray-400 dark:text-gray-400 text-gray-700">{kpi.label}</span>
      <span className="text-3xl font-bold mt-2 text-gray-100 dark:text-gray-100 text-gray-900">{kpi.count}</span>
    </>
  );
  return config.link ? (
    <a key={kpi.label} href={config.link} className="rounded-lg p-6 shadow border flex flex-col items-center bg-gray-900 border-gray-800 dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
      {cardContent}
    </a>
  ) : (
    <div key={kpi.label} className="rounded-lg p-6 shadow border flex flex-col items-center bg-gray-900 border-gray-800 dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-200">
      {cardContent}
    </div>
  );
})}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg p-6 shadow border bg-gray-900 border-gray-800 dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-100 dark:text-gray-100 text-gray-900">Recent Projects</h3>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-500 text-gray-400">No recent projects.</p>
          ) : (
            <ul className="space-y-2">
              {recentProjects.map((proj) => (
                <li key={proj.id} className="text-gray-200 dark:text-gray-200 text-gray-900">
                  <span className="font-medium">{proj.name || `Project #${proj.id}`}</span>
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-400 text-gray-700">{proj.created_at?.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg p-6 shadow border bg-gray-900 border-gray-800 dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-100 dark:text-gray-100 text-gray-900">Recent Stock Movements</h3>
          {recentStockMovements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-500 text-gray-400">No recent stock movements.</p>
          ) : (
            <ul className="space-y-2">
              {recentStockMovements.map((move) => (
                <li key={move.id} className="text-gray-200 dark:text-gray-200 text-gray-900">
                  <span className="font-medium">{move.type || `Movement #${move.id}`}</span>
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-400 text-gray-700">{move.created_at?.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
