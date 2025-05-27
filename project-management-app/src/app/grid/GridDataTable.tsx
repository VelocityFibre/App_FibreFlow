"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);
import { supabase } from "@/lib/supabaseClient";
import TableSelector from "./TableSelector";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";

const TABLES = [
  "stock_items",
  "projects",
  "customers",
  "materials",
  "stock_movements",
  "contractors",
  "contacts",
  "sheq",
  "meeting_summaries",
];

export default function GridDataTable() {
  // Default to 'stock_items' if present, otherwise first table
  const [table, setTable] = useState("stock_items");
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<any>(null);

  // Fetch data from selected table
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      setRowData([]);
      setColumnDefs([]);
      setLoading(false);
      return;
    }
    setRowData(data || []);
    if (data && data.length > 0) {
      setColumnDefs(
        Object.keys(data[0]).map((key) => ({
          headerName: key,
          field: key,
          sortable: true,
          filter: true,
          editable: key !== "id", // allow editing except for id
          resizable: true,
        }))
      );
    }
    setLoading(false);
  }, [table]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle cell edits
  const onCellValueChanged = useCallback(async (event: any) => {
    const updated = event.data;
    const { id, ...rest } = updated;
    if (!id) return;
    await supabase.from(table).update(rest).eq("id", id);
    // Optionally: refetch data or optimistically update
  }, [table]);

  // Export to CSV
  const onExport = () => {
    gridRef.current?.api.exportDataAsCsv();
  };

  // Bulk delete selected
  const onBulkDelete = async () => {
    const selected = gridRef.current?.api.getSelectedRows();
    if (!selected || selected.length === 0) return;
    const ids = selected.map((row: any) => row.id);
    await supabase.from(table).delete().in("id", ids);
    fetchData();
  };

  return (
    <div className="w-full">
      <TableSelector table={table} setTable={setTable} />
      <div className="flex gap-2 mb-2">
        <button onClick={onExport} className="bg-blue-600 px-4 py-2 rounded text-white">Export CSV</button>
        <button onClick={onBulkDelete} className="bg-red-600 px-4 py-2 rounded text-white">Delete Selected</button>
      </div>
      <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
        Tip: You can edit data inline by double-clicking any cell (except the ID column). Scroll horizontally to view more columns.
      </div>
      <div
        className="ag-theme-balham"
        style={{ width: "100%", minWidth: 1200, height: 700, overflowX: "auto" }}
      >
        {loading ? (
          <div className="text-gray-400 flex items-center justify-center h-full">Loading data...</div>
        ) : (
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            animateRows={true}
            domLayout="normal"
            rowSelection="multiple"
            onCellValueChanged={onCellValueChanged}
          />
        )}
      </div>
    </div>
  );
}
