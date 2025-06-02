"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface StockItem {
  id: string;
  created_time: string;
  item_no: number;
  description: string;
  uom: string;
  created_at: string;
  updated_at: string;
}

export default function StockItemsPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockItems();
  }, []);

  async function fetchStockItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("stock_items").select("*");
      if (error) {
        console.error("Error fetching stock items:", error);
      } else {
        setStock(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchStockItems:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Stock Items</h2>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading stock on hand...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item No</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UOM</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-gray-500 dark:text-gray-400">No stock items found.</td>
                </tr>
              ) : (
                stock.map((record) => (
                  <tr key={record.id}>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.created_time}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.item_no}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.uom}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.created_at}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{record.updated_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
