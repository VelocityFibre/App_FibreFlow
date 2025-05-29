"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Define interfaces for our data types
interface StockItem {
  id: string;
  name: string;
  sku: string;
  current_quantity: number;
  reorder_point?: number;
  unit: string;
  category_id?: string;
}

interface StockMovement {
  id: string;
  movement_number: string;
  movement_date: string;
  movement_type: string;
  quantity: number;
  stock_items: {
    name: string;
    sku: string;
  };
}

interface Project {
  id: string;
  name: string;
  code: string;
}

export default function StockManagementPage() {
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      try {
        // For now, we'll just set loading to false after a delay
        // since the database tables don't exist yet
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        
        // The following code is commented out until the database tables are created
        /*
        // Fetch stock items with low stock
        const { data: lowStock, error: lowStockError } = await supabase
          .from("stock_items")
          .select("id, name, sku, current_quantity, reorder_point, unit")
          .lt("current_quantity", "reorder_point")
          .gt("reorder_point", 0)
          .order("name");
        
        if (lowStockError) {
          console.error("Error fetching low stock items:", lowStockError);
        } else {
          setLowStockItems(lowStock || []);
        }
        
        // Fetch recent stock movements
        const { data: movements, error: movementsError } = await supabase
          .from("stock_movements")
          .select(`
            id, 
            movement_number, 
            movement_date, 
            movement_type, 
            quantity, 
            stock_items(name, sku)
          `)
          .order("movement_date", { ascending: false })
          .limit(5);
        
        if (movementsError) {
          console.error("Error fetching recent movements:", movementsError);
        } else {
          setRecentMovements(movements || []);
        }
        
        // Fetch active projects
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, code")
          .eq("status", "Active")
          .order("name");
        
        if (projectsError) {
          console.error("Error fetching active projects:", projectsError);
        } else {
          setActiveProjects(projects || []);
        }
        
        // Fetch total stock items count
        const { data: items, error: itemsError } = await supabase
          .from("stock_items")
          .select("id, name, sku, current_quantity, unit, category_id")
          .order("name")
          .limit(10);
        
        if (itemsError) {
          console.error("Error fetching stock items:", itemsError);
        } else {
          setStockItems(items || []);
        }
        */
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Dashboard Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Dashboard</h2>
            <Link
              href="/stock-management/inventory"
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
            <p className="text-gray-500 dark:text-gray-400">Inventory dashboard will be implemented soon.</p>
          )}
        </div>
        
        {/* Stock Items Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Items</h2>
            <div className="flex space-x-2">
              <Link
                href="/stock-management/items/new"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Add Item
              </Link>
              <Link
                href="/stock-management/items"
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
            <p className="text-gray-500 dark:text-gray-400">Stock items will be implemented soon.</p>
          )}
        </div>
        
        {/* BOQ Management Card */}
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
            <p className="text-gray-500 dark:text-gray-400">BOQ management will be implemented soon.</p>
          )}
        </div>
        
        {/* Procurement Card */}
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
            <p className="text-gray-500 dark:text-gray-400">Procurement features will be implemented soon.</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/stock-management/items"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="ml-4">
                <h3 className="font-medium text-blue-700 dark:text-blue-300">Stock Items</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Manage inventory items</p>
              </div>
            </Link>
            
            <Link 
              href="/stock-management/boq"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="ml-4">
                <h3 className="font-medium text-green-700 dark:text-green-300">BOQ Management</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Create and manage BOQs</p>
              </div>
            </Link>
            
            <Link 
              href="/stock-management/procurement"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="ml-4">
                <h3 className="font-medium text-purple-700 dark:text-purple-300">Procurement</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">RFQs and Purchase Orders</p>
              </div>
            </Link>
            
            <Link 
              href="/stock-management/suppliers"
              className="flex items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="ml-4">
                <h3 className="font-medium text-amber-700 dark:text-amber-300">Suppliers</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">Manage supplier information</p>
              </div>
            </Link>
            
            <Link 
              href="/stock-management/movements"
              className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div className="ml-4">
                <h3 className="font-medium text-red-700 dark:text-red-300">Stock Movements</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Track inventory changes</p>
              </div>
            </Link>
            
            <Link 
              href="/stock-management/reports"
              className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <div className="ml-4">
                <h3 className="font-medium text-indigo-700 dark:text-indigo-300">Reports</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Analytics and reporting</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
