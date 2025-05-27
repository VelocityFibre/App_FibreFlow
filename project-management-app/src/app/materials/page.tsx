"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface StockItem {
  id: string;
  created_time: string;
  item_no: number;
  description: string;
  uom: string;
  created_at?: string;
  updated_at?: string;
}

export default function MaterialsPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string|null>(null);
  const [newStockItem, setNewStockItem] = useState<Omit<StockItem, 'id' | 'created_at' | 'updated_at' | 'created_time'>>({ 
    item_no: 0,
    description: "",
    uom: ""
  });

  useEffect(() => {
    fetchStockItems();
  }, []);

  async function fetchStockItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("stock_items").select("*").order("name");
      
      if (error) {
        console.error("Error fetching stock items:", error);
      } else {
        console.log("Fetched stock items:", data);
        setStockItems(data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchStockItems:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(id: string) {
    const item = stockItems.find((i) => i.id === id);
    if (!item) return;
    
    try {
      const { error } = await supabase.from("stock_items").update(item).eq("id", id);
      if (error) {
        console.error("Error updating stock item:", error);
      } else {
        setEditing(null);
        fetchStockItems();
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
    }
  }

  async function handleAdd() {
    if (!newStockItem.item_no || !newStockItem.description || !newStockItem.uom) return;
    
    try {
      const { error } = await supabase.from("stock_items").insert([newStockItem]);
      if (error) {
        console.error("Error adding stock item:", error);
      } else {
        setNewStockItem({
          item_no: 0,
          description: "",
          uom: ""
        });
        fetchStockItems();
      }
    } catch (error) {
      console.error("Unexpected error in handleAdd:", error);
    }
  }

  function handleEditField(id: string, field: keyof StockItem, value: string | number) {
    setStockItems((prev) => prev.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Materials Management</h2>
      
      {/* Add new stock item form */}
      <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Add New Stock Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              placeholder="Item Number *"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStockItem.item_no}
              onChange={e => setNewStockItem({ ...newStockItem, item_no: Number(e.target.value) })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Description"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStockItem.description}
              onChange={e => setNewStockItem({ ...newStockItem, description: e.target.value })}
            />
          </div>
          <div>

          </div>
          <div>
            <input
              type="text"
              placeholder="UOM (e.g., meters, pieces)"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={newStockItem.uom}
              onChange={e => setNewStockItem({ ...newStockItem, uom: e.target.value })}
            />
          </div>
          <div>

          </div>
          <div className="flex items-end">
            <button
              className="bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md w-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={handleAdd}
            >
              Add Stock Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Stock items list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading stock items...</p>
        </div>
      ) : stockItems.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No stock items found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add your first stock item using the form above</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Description</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Quantity</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Unit</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {stockItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === item.id ? (
                      <input
                        type="number"
                        value={item.item_no}
                        onChange={e => handleEditField(item.id, "item_no", Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      item.item_no
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === item.id ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleEditField(item.id, "description", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {editing === item.id ? (
                      <input
                        type="text"
                        value={item.uom}
                        onChange={e => handleEditField(item.id, "uom", e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      item.uom
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {editing === item.id ? (
                      <div className="flex space-x-2">
                        <button 
                          className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                          onClick={() => handleSave(item.id)}
                        >
                          Save
                        </button>
                        <button 
                          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          onClick={() => setEditing(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="bg-black dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        onClick={() => setEditing(item.id)}
                      >
                        Edit
                      </button>
                    )}
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
