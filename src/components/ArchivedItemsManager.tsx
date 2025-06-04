"use client";

import { useState } from 'react';
import { useSoftDelete } from '@/hooks/useSoftDelete';
import { SoftDeleteTable } from '@/lib/softDelete';
import ActionButton from '@/components/ActionButton';
import { FiArchive, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

interface ArchivedItemsManagerProps {
  table: SoftDeleteTable;
  items: Array<{ id: string; name?: string; [key: string]: any }>;
  nameField?: string;
  onItemRestored?: (item: any) => void;
  refreshData: () => void;
  queryKeysToInvalidate?: string[];
}

/**
 * Component for managing archived items
 * 
 * This component displays a list of archived items and provides options to restore them.
 * It follows the project's UI patterns and styling guidelines.
 */
export default function ArchivedItemsManager({
  table,
  items,
  nameField = 'name',
  onItemRestored,
  refreshData,
  queryKeysToInvalidate = []
}: ArchivedItemsManagerProps) {
  const { unarchive, loading, error } = useSoftDelete();
  const [confirmingRestore, setConfirmingRestore] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle restoring an archived item
  const handleRestore = async (id: string, itemName: string) => {
    const result = await unarchive(table, id, {
      details: { itemName },
      invalidateQueries: queryKeysToInvalidate
    });

    if (result.success) {
      setSuccessMessage(`Successfully restored "${itemName}"`);
      setConfirmingRestore(null);
      
      // Call the onItemRestored callback if provided
      if (onItemRestored && result.data?.[0]) {
        onItemRestored(result.data[0]);
      }
      
      // Refresh the data
      refreshData();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 py-8">
          <FiArchive className="mr-2" />
          <span>No archived items found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <FiArchive className="mr-2" />
          <span>Archived Items</span>
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 flex items-center">
          <FiAlertTriangle className="mr-2" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Items list */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map(item => (
          <li key={item.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {item[nameField] || `Item ${item.id}`}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Archived: {new Date(item.archived_at).toLocaleString()}
                </p>
              </div>
              <div>
                {confirmingRestore === item.id ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Confirm restore?</span>
                    <ActionButton
                      onClick={() => handleRestore(item.id, item[nameField] || `Item ${item.id}`)}
                      disabled={loading}
                      variant="success"
                      size="sm"
                    >
                      Yes
                    </ActionButton>
                    <ActionButton
                      onClick={() => setConfirmingRestore(null)}
                      variant="secondary"
                      size="sm"
                    >
                      No
                    </ActionButton>
                  </div>
                ) : (
                  <ActionButton
                    onClick={() => setConfirmingRestore(item.id)}
                    icon={<FiRefreshCw />}
                    variant="secondary"
                    size="sm"
                  >
                    Restore
                  </ActionButton>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
