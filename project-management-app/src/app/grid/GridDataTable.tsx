"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);
import { supabase } from "@/lib/supabaseClient";
import { bulkArchiveRecords, SoftDeleteTable } from "@/lib/softDelete";
import { useSoftDelete } from "@/hooks/useSoftDelete";
import TableSelector from "./TableSelector";
import ActionButton from "@/components/ActionButton";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { FiDownload, FiArchive, FiAlertCircle, FiDatabase, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';

// Updated table list with known existing tables
const TABLES = [
  "projects",
  "new_customers", 
  "locations",
  "staff",
  "phases",
  "project_phases",
  "project_tasks",
  "tasks",
  "audit_logs",
  "stock_items",
  "materials",
  "contractors",
  "contacts"
];

interface GridStats {
  totalRows: number;
  archivedRows: number;
  activeRows: number;
  columns: number;
}

interface GridDataTableProps {
  initialTable?: string;
}

export default function GridDataTable({ initialTable = "projects" }: GridDataTableProps = {}) {
  const [table, setTable] = useState(initialTable);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GridStats>({ totalRows: 0, archivedRows: 0, activeRows: 0, columns: 0 });
  const gridRef = useRef<any>(null);
  const { bulkArchive, loading: archiveLoading, error: archiveError } = useSoftDelete();

  // Check if table has archived_at column
  const checkArchiveSupport = useCallback(async (tableName: string) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) return false;
      
      // Check if archived_at column exists in the first row
      return data && data.length > 0 && 'archived_at' in data[0];
    } catch {
      return false;
    }
  }, []);

  // Fetch data from selected table with improved error handling
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching data from table: ${table}`);
      
      // Check if table supports archiving
      const hasArchiveSupport = await checkArchiveSupport(table);
      console.log(`Table ${table} archive support:`, hasArchiveSupport);
      
      // Build base query
      let query = supabase.from(table).select("*");
      
      // Apply archive filter only if table supports it
      if (hasArchiveSupport && !showArchived) {
        // Show only non-archived records
        query = query.is('archived_at', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        setError(`Failed to fetch data from ${table}: ${error.message}`);
        setRowData([]);
        setColumnDefs([]);
        setStats({ totalRows: 0, archivedRows: 0, activeRows: 0, columns: 0 });
        setLoading(false);
        return;
      }

      console.log(`Fetched ${data?.length || 0} rows from ${table}`);
      
      // Set row data
      setRowData(data || []);
      
      // Generate column definitions
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]).map((key) => ({
          headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          field: key,
          sortable: true,
          filter: true,
          editable: key !== "id" && key !== "created_at" && key !== "updated_at", 
          resizable: true,
          minWidth: 100,
          // Special formatting for specific column types
          ...(key === 'archived_at' && {
            cellRenderer: (params: any) => {
              if (params.value) {
                return `<span class="text-red-600 text-xs">Archived: ${new Date(params.value).toLocaleDateString()}</span>`;
              }
              return '<span class="text-green-600 text-xs">Active</span>';
            }
          }),
          ...(key.includes('date') && {
            cellRenderer: (params: any) => {
              if (params.value) {
                return new Date(params.value).toLocaleDateString();
              }
              return '';
            }
          }),
          ...(key === 'id' && {
            width: 200,
            cellRenderer: (params: any) => {
              return `<span class="font-mono text-xs">${params.value}</span>`;
            }
          })
        }));
        
        setColumnDefs(columns);
        
        // Calculate stats
        const totalRows = data.length;
        let archivedRows = 0;
        let activeRows = 0;
        
        if (hasArchiveSupport) {
          // Get total counts including archived
          const { data: allData } = await supabase.from(table).select("archived_at");
          if (allData) {
            archivedRows = allData.filter(row => row.archived_at).length;
            activeRows = allData.filter(row => !row.archived_at).length;
          }
        } else {
          activeRows = totalRows;
        }
        
        setStats({
          totalRows: hasArchiveSupport ? activeRows + archivedRows : totalRows,
          archivedRows,
          activeRows,
          columns: columns.length
        });
      } else {
        // No data found
        setColumnDefs([]);
        setStats({ totalRows: 0, archivedRows: 0, activeRows: 0, columns: 0 });
      }
      
    } catch (error) {
      console.error(`Unexpected error fetching from ${table}:`, error);
      setError(`Unexpected error: ${error}`);
      setRowData([]);
      setColumnDefs([]);
      setStats({ totalRows: 0, archivedRows: 0, activeRows: 0, columns: 0 });
    } finally {
      setLoading(false);
    }
  }, [table, showArchived, checkArchiveSupport]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle cell edits with better error handling
  const onCellValueChanged = useCallback(async (event: any) => {
    const updated = event.data;
    const { id, ...rest } = updated;
    if (!id) return;
    
    try {
      const { error } = await supabase.from(table).update(rest).eq("id", id);
      if (error) {
        console.error('Update failed:', error);
        alert(`Update failed: ${error.message}`);
        // Revert the change
        event.node.setData(event.oldValue);
      }
    } catch (error) {
      console.error('Unexpected update error:', error);
      alert(`Unexpected update error: ${error}`);
    }
  }, [table]);

  // Export to CSV
  const onExport = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${table}_export_${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

  // Bulk archive selected (soft delete)
  const onBulkArchive = async () => {
    const selected = gridRef.current?.api.getSelectedRows();
    if (!selected || selected.length === 0) {
      alert("Please select rows to archive");
      return;
    }
    
    if (!confirm(`Are you sure you want to archive ${selected.length} selected items? They can be restored later.`)) {
      return;
    }
    
    const ids = selected.map((row: any) => row.id).filter(id => id);
    
    if (ids.length === 0) {
      alert("Selected rows do not have valid IDs");
      return;
    }
    
    try {
      const result = await bulkArchive(table as SoftDeleteTable, ids, {
        details: { 
          action: 'bulk_archive_from_grid',
          table: table,
          count: ids.length 
        },
        invalidateQueries: [table]
      });
      
      if (result.success) {
        alert(`Successfully archived ${ids.length} items`);
        await fetchData(); // Refresh data
      } else {
        alert(`Failed to archive items: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in bulk archive:', error);
      alert(`Error archiving items: ${error}`);
    }
  };

  // Refresh data
  const onRefresh = () => {
    fetchData();
  };

  // Get table display name
  const getTableDisplayName = (tableName: string) => {
    return tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FiDatabase className="mr-3" />
              Data Grid
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and manage data across all tables
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <ActionButton
              icon={<FiRefreshCw />}
              onClick={onRefresh}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              Refresh
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Table Selector and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <TableSelector table={table} setTable={setTable} tables={TABLES} />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Currently viewing: <span className="font-medium">{getTableDisplayName(table)}</span>
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Rows</div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{stats.totalRows}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <div className="text-sm font-medium text-green-900 dark:text-green-100">Active</div>
              <div className="text-lg font-bold text-green-900 dark:text-green-100">{stats.activeRows}</div>
            </div>
            {stats.archivedRows > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                <div className="text-sm font-medium text-orange-900 dark:text-orange-100">Archived</div>
                <div className="text-lg font-bold text-orange-900 dark:text-orange-100">{stats.archivedRows}</div>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Columns</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.columns}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton
            icon={<FiDownload />}
            onClick={onExport}
            variant="secondary"
            size="sm"
            disabled={rowData.length === 0}
          >
            Export CSV
          </ActionButton>
          
          <ActionButton
            icon={<FiArchive />}
            onClick={onBulkArchive}
            variant="danger"
            size="sm"
            disabled={archiveLoading || rowData.length === 0}
          >
            {archiveLoading ? 'Archiving...' : 'Archive Selected'}
          </ActionButton>
          
          {stats.archivedRows > 0 && (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                {showArchived ? <FiEye className="mr-1" /> : <FiEyeOff className="mr-1" />}
                Show archived items
              </span>
            </label>
          )}
          
          {archiveError && (
            <div className="flex items-center text-red-600 text-sm">
              <FiAlertCircle className="mr-1" />
              {archiveError.message}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Data Loading Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          How to use the Data Grid:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Double-click any cell to edit data inline (except ID and timestamp fields)</li>
          <li>• Select rows and use "Archive Selected" for bulk operations</li>
          <li>• Use column filters and sorting to find specific data</li>
          <li>• Export data to CSV for external analysis</li>
          <li>• Toggle "Show archived items" to view archived records</li>
        </ul>
      </div>

      {/* Data Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div
          className="ag-theme-balham w-full"
          style={{ 
            height: loading ? 400 : Math.max(400, Math.min(800, (rowData.length + 1) * 35 + 50)),
            minHeight: 400
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading {getTableDisplayName(table)}...</p>
              </div>
            </div>
          ) : rowData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FiDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No data found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The table "{getTableDisplayName(table)}" appears to be empty.
                </p>
                <ActionButton
                  icon={<FiRefreshCw />}
                  onClick={onRefresh}
                  variant="secondary"
                  size="sm"
                >
                  Try Again
                </ActionButton>
              </div>
            </div>
          ) : (
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
              }}
              onCellValueChanged={onCellValueChanged}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              animateRows={true}
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              suppressMenuHide={true}
              enableCellChangeFlash={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}