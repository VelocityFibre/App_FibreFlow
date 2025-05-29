import React from "react";
import Link from "next/link";

interface StockItem {
  id: string;
  name: string;
  sku: string;
  current_quantity: number;
  reorder_point: number;
  unit: string;
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

interface InventoryDashboardCardProps {
  loading: boolean;
  lowStockItems: StockItem[];
  recentMovements: StockMovement[];
}

export default function InventoryDashboardCard({
  loading,
  lowStockItems,
  recentMovements,
}: InventoryDashboardCardProps) {
  return (
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
        <div className="space-y-6">
          {/* Low Stock Alert Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Low Stock Alerts
            </h3>
            {lowStockItems.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-red-200 dark:border-red-900">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-red-50 dark:bg-red-900/20">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider"
                      >
                        SKU
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider"
                      >
                        Current
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider"
                      >
                        Reorder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.sku}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                          {item.current_quantity} {item.unit}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.reorder_point} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No low stock items found.
              </p>
            )}
          </div>

          {/* Recent Movements Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Recent Stock Movements
            </h3>
            {recentMovements.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(movement.movement_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {movement.stock_items?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              movement.movement_type === "Received"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : movement.movement_type === "Issued"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                : movement.movement_type === "Returned"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {movement.movement_type}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {movement.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recent movements found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
