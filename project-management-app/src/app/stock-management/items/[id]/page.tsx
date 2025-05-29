"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface StockItem {
  id: string;
  name: string;
  category: string;
  uom: string;
  itemCode: string;
  currentStock: number;
  minStock: number;
  supplierName: string;
  lastUpdated: string;
  // Additional properties for the detail page
  description?: string;
  sku?: string;
  status?: string;
  image_url?: string;
  // These properties are used in the detail page but not in the main list
  maxStock?: number;
  reorderPoint?: number;
  costPerUnit?: number;
}

interface StockMovement {
  id: string;
  stock_item_id: string;
  quantity: number;
  movement_type: string;
  reference?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export default function StockItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stockItem, setStockItem] = useState<StockItem | null>(null);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string>("");
  
  // Set itemId in a useEffect to avoid direct params access
  useEffect(() => {
    if (params && params.id) {
      setItemId(params.id);
    }
  }, [params])
  
  useEffect(() => {
    // Only run this effect when itemId is available
    if (!itemId) return;
    
    async function fetchStockItem() {
      setLoading(true);
      
      try {
        // For now, we'll use mock data since the database tables don't exist yet
        setTimeout(() => {
          const mockStockItem: StockItem = {
            id: itemId,
            name: "Fiber Optic Cable - Single Mode",
            category: "Cables",
            uom: "meter",
            itemCode: "FOC-SM-001",
            currentStock: 1500,
            minStock: 200,
            supplierName: "Fiber Optics Inc.",
            lastUpdated: new Date().toISOString(),
            description: "Single mode fiber optic cable, 9/125µm, suitable for long-distance transmission with low attenuation. Compliant with ITU-T G.652 standards.",
            sku: "FOC-SM-001",
            status: "Active",
            maxStock: 3000,
            reorderPoint: 500,
            costPerUnit: 2.50,
            image_url: "https://example.com/fiber-cable.jpg",
          };
          
          const mockMovements: StockMovement[] = [
            {
              id: "1",
              stock_item_id: itemId,
              quantity: 500,
              movement_type: "Stock In",
              reference: "PO-2023-056",
              notes: "Regular stock replenishment",
              created_at: "2023-05-20T14:45:00Z",
              created_by: "John Doe"
            },
            {
              id: "2",
              stock_item_id: itemId,
              quantity: -200,
              movement_type: "Stock Out",
              reference: "PRJ-2023-089",
              notes: "Allocated to Project XYZ",
              created_at: "2023-05-15T10:30:00Z",
              created_by: "Jane Smith"
            },
            {
              id: "3",
              stock_item_id: itemId,
              quantity: -50,
              movement_type: "Stock Out",
              reference: "PRJ-2023-092",
              notes: "Emergency allocation",
              created_at: "2023-05-10T09:15:00Z",
              created_by: "Jane Smith"
            }
          ];
          
          setStockItem(mockStockItem);
          setRecentMovements(mockMovements);
          setLoading(false);
        }, 1000);
        
        // The following code is commented out until the database tables are created
        /*
        // Fetch stock item details
        const { data: itemData, error: itemError } = await supabase
          .from("stock_items")
          .select(`
            *,
            category:stock_categories(name)
          `)
          .eq("id", itemId)
          .single();
        
        if (itemError) {
          throw new Error(itemError.message);
        }
        
        // Fetch recent movements for this item
        const { data: movementsData, error: movementsError } = await supabase
          .from("stock_movements")
          .select("*")
          .eq("stock_item_id", itemId)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (movementsError) {
          throw new Error(movementsError.message);
        }
        
        setStockItem(itemData);
        setRecentMovements(movementsData || []);
        */
      } catch (error) {
        console.error("Error fetching stock item:", error);
        setError("Failed to load stock item details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchStockItem();
  }, [itemId]); // Only re-run when itemId changes
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 my-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!stockItem) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stock item not found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The requested stock item could not be found.
        </p>
        <div className="mt-6">
          <Link
            href="/stock-management/items"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Back to Stock Items
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate stock status
  const stockStatus = () => {
    if (stockItem.currentStock <= stockItem.minStock) {
      return {
        label: "Low Stock",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      };
    } else if (stockItem.currentStock >= (stockItem.minStock * 3)) {
      // Using minStock * 3 as a rough estimate for overstocked
      return {
        label: "Overstocked",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      };
    } else {
      return {
        label: "In Stock",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      };
    }
  };
  
  const status = stockStatus();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link
            href="/stock-management/items"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
          >
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Stock Items
          </Link>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/stock-management/items/${params.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </Link>
          <Link
            href={`/stock-management/items/${params.id}/movements/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Add Movement
          </Link>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {stockItem.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                SKU: {stockItem.sku}
              </p>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                stockItem.status === "Active" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : stockItem.status === "Discontinued" 
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}>
                {stockItem.status}
              </span>
              <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Item Details</h4>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.description || "No description available"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.category || "Uncategorized"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit of Measure</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.uom}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Item Code</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.itemCode}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.supplierName}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.status || "Active"}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(stockItem.lastUpdated).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Inventory Information</h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stock Level</p>
                    <p className={`text-2xl font-bold ${
                      stockItem.currentStock <= stockItem.minStock 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {stockItem.currentStock} {stockItem.uom}
                    </p>
                  </div>
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Maximum Stock Level</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.maxStock} {stockItem.uom}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reorder Point</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {stockItem.reorderPoint} {stockItem.uom}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Value</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    ${((stockItem.currentStock || 0) * (stockItem.costPerUnit || 0)).toFixed(2)}
                  </dd>
                </div>
              </dl>
              
              {stockItem.image_url && (
                <div className="mt-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Image</dt>
                  <dd className="mt-1">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      <img
                        src={stockItem.image_url}
                        alt={stockItem.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    </div>
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Stock Movements */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Stock Movements
            </h3>
            <Link
              href={`/stock-management/items/${itemId}/movements`}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentMovements.length > 0 ? (
                recentMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movement.movement_type === "Stock In" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      }`}>
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className={movement.quantity > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {movement.quantity > 0 ? "+" : ""}{movement.quantity} {stockItem.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {movement.reference || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {movement.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {movement.created_by || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No recent stock movements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
