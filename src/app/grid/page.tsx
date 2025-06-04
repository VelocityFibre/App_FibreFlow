"use client";
import { useState, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Import AG Grid CSS
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

interface TableConfig {
  name: string;
  displayName: string;
  icon: string;
  columns: any[];
  demoData: any[];
}

const TABLES: TableConfig[] = [
  {
    name: "projects",
    displayName: "Projects",
    icon: "📁",
    columns: [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Project Name", width: 250 },
      { field: "status", headerName: "Status", width: 120, cellRenderer: (params: any) => {
        const value = params.value;
        const statusClasses: any = {
          "Active": "ff-status-active",
          "Planning": "ff-status-planning", 
          "Completed": "ff-status-completed"
        };
        const className = statusClasses[value] || "ff-status-pending";
        return `<span class="${className}">${value}</span>`;
      }},
      { field: "phase", headerName: "Phase", width: 150 },
      { field: "start_date", headerName: "Start Date", width: 120 },
      { field: "end_date", headerName: "End Date", width: 120 },
      { field: "project_manager", headerName: "Project Manager", width: 150 },
      { field: "budget", headerName: "Budget", width: 120, valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}` },
      { field: "completion", headerName: "Completion %", width: 120, cellRenderer: (params: any) => {
        const value = params.value || 0;
        return `<div style="display: flex; align-items: center;">
          <div style="flex: 1; background: #f3f4f6; height: 6px; border-radius: 3px; margin-right: 8px;">
            <div style="width: ${value}%; background: #6b7280; height: 100%; border-radius: 3px;"></div>
          </div>
          <span style="color: #374151; font-size: 13px;">${value}%</span>
        </div>`;
      }}
    ],
    demoData: [
      { id: 1, name: "Downtown Fiber Installation", status: "Active", phase: "Infrastructure", start_date: "2024-06-01", end_date: "2024-08-30", project_manager: "John Smith", budget: 250000, completion: 65 },
      { id: 2, name: "Business Park Network", status: "Active", phase: "Testing", start_date: "2024-05-15", end_date: "2024-07-15", project_manager: "Sarah Johnson", budget: 180000, completion: 85 },
      { id: 3, name: "Residential Area Expansion", status: "Planning", phase: "Design", start_date: "2024-07-01", end_date: "2024-10-30", project_manager: "Mike Wilson", budget: 320000, completion: 15 },
      { id: 4, name: "City Center Upgrade", status: "Completed", phase: "Completed", start_date: "2024-01-15", end_date: "2024-05-30", project_manager: "Emma Davis", budget: 150000, completion: 100 },
      { id: 5, name: "Industrial Zone Connection", status: "Active", phase: "Infrastructure", start_date: "2024-06-10", end_date: "2024-09-20", project_manager: "Tom Brown", budget: 280000, completion: 40 }
    ]
  },
  {
    name: "customers",
    displayName: "Customers",
    icon: "👥",
    columns: [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Customer Name", width: 200 },
      { field: "company", headerName: "Company", width: 200 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "phone", headerName: "Phone", width: 150 },
      { field: "service_type", headerName: "Service Type", width: 150 },
      { field: "status", headerName: "Status", width: 120 },
      { field: "monthly_revenue", headerName: "Monthly Revenue", width: 150, valueFormatter: (params: any) => `$${params.value?.toLocaleString() || 0}` }
    ],
    demoData: [
      { id: 1, name: "Acme Corporation", company: "Acme Corp", email: "contact@acme.com", phone: "(555) 123-4567", service_type: "Business Fiber", status: "Active", monthly_revenue: 2500 },
      { id: 2, name: "Tech Startup Inc", company: "Tech Startup", email: "info@techstartup.com", phone: "(555) 234-5678", service_type: "Dedicated Line", status: "Active", monthly_revenue: 5000 },
      { id: 3, name: "Local Restaurant", company: "Joe's Diner", email: "joe@diner.com", phone: "(555) 345-6789", service_type: "Business Basic", status: "Active", monthly_revenue: 300 },
      { id: 4, name: "Medical Center", company: "City Medical", email: "admin@citymedical.com", phone: "(555) 456-7890", service_type: "Enterprise", status: "Active", monthly_revenue: 8000 },
      { id: 5, name: "Law Firm LLC", company: "Smith & Associates", email: "contact@smithlaw.com", phone: "(555) 567-8901", service_type: "Business Plus", status: "Pending", monthly_revenue: 1500 }
    ]
  },
  {
    name: "materials",
    displayName: "Materials",
    icon: "🔧",
    columns: [
      { field: "id", headerName: "ID", width: 80 },
      { field: "sku", headerName: "SKU", width: 120 },
      { field: "name", headerName: "Material Name", width: 250 },
      { field: "category", headerName: "Category", width: 150 },
      { field: "quantity", headerName: "Quantity", width: 100 },
      { field: "unit", headerName: "Unit", width: 80 },
      { field: "unit_cost", headerName: "Unit Cost", width: 100, valueFormatter: (params: any) => `$${params.value?.toFixed(2) || 0}` },
      { field: "supplier", headerName: "Supplier", width: 150 },
      { field: "status", headerName: "Status", width: 120 }
    ],
    demoData: [
      { id: 1, sku: "FIB-SM-001", name: "Single Mode Fiber Cable - 1000m", category: "Fiber Cable", quantity: 25, unit: "spool", unit_cost: 450.00, supplier: "FiberTech Co", status: "In Stock" },
      { id: 2, sku: "CON-SC-002", name: "SC Fiber Connector", category: "Connectors", quantity: 500, unit: "pcs", unit_cost: 2.50, supplier: "ConnectPro", status: "In Stock" },
      { id: 3, sku: "SPL-1X8-003", name: "1x8 Fiber Splitter", category: "Splitters", quantity: 50, unit: "pcs", unit_cost: 35.00, supplier: "OptiSplit Inc", status: "Low Stock" },
      { id: 4, sku: "ENC-WP-004", name: "Weatherproof Enclosure", category: "Enclosures", quantity: 30, unit: "pcs", unit_cost: 125.00, supplier: "SafeBox Ltd", status: "In Stock" },
      { id: 5, sku: "OTD-MM-005", name: "OTDR Testing Kit", category: "Testing Equipment", quantity: 5, unit: "kit", unit_cost: 2500.00, supplier: "TestPro Systems", status: "In Stock" }
    ]
  },
  {
    name: "contractors",
    displayName: "Contractors",
    icon: "👷",
    columns: [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Contractor Name", width: 200 },
      { field: "company", headerName: "Company", width: 200 },
      { field: "specialization", headerName: "Specialization", width: 150 },
      { field: "phone", headerName: "Phone", width: 150 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "rate", headerName: "Hourly Rate", width: 120, valueFormatter: (params: any) => `$${params.value}/hr` },
      { field: "status", headerName: "Status", width: 120 },
      { field: "projects_completed", headerName: "Projects", width: 100 }
    ],
    demoData: [
      { id: 1, name: "Mike Johnson", company: "MJ Fiber Services", specialization: "Fiber Splicing", phone: "(555) 111-2222", email: "mike@mjfiber.com", rate: 75, status: "Available", projects_completed: 23 },
      { id: 2, name: "ABC Construction", company: "ABC Construction LLC", specialization: "Trenching", phone: "(555) 222-3333", email: "info@abcconstruct.com", rate: 120, status: "On Project", projects_completed: 45 },
      { id: 3, name: "Sarah Lee", company: "Network Pro", specialization: "Network Testing", phone: "(555) 333-4444", email: "sarah@networkpro.com", rate: 85, status: "Available", projects_completed: 18 },
      { id: 4, name: "Tech Install Co", company: "Tech Install Co", specialization: "Equipment Install", phone: "(555) 444-5555", email: "support@techinstall.com", rate: 95, status: "Available", projects_completed: 67 },
      { id: 5, name: "Dave Brown", company: "DB Consulting", specialization: "Project Management", phone: "(555) 555-6666", email: "dave@dbconsult.com", rate: 110, status: "On Project", projects_completed: 31 }
    ]
  }
];

export default function GridPage() {
  const [selectedTable, setSelectedTable] = useState<TableConfig>(TABLES[0]);
  const [quickFilter, setQuickFilter] = useState("");
  const gridRef = useRef<any>(null);

  // Export to CSV
  const onExport = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: `${selectedTable.name}_export_${new Date().toISOString().split('T')[0]}.csv`
    });
  }, [selectedTable]);

  // Default column definitions
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: true
  };

  // Grid options
  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    animateRows: true,
    rowSelection: 'multiple' as const,
    suppressRowClickSelection: true,
    enableCellTextSelection: true,
    ensureDomOrder: true
  };

  return (
    <div className="ff-page-container">
      {/* Header */}
      <div className="ff-page-header">
        <h1 className="ff-page-title">Data Management Grid</h1>
        <p className="ff-page-subtitle">
          Manage your fiber installation project data efficiently
        </p>
      </div>

      {/* Controls */}
      <div className="ff-card mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Table Selector */}
          <div className="flex items-center gap-2">
            <label className="ff-label">Select Table:</label>
            <select
              value={selectedTable.name}
              onChange={(e) => {
                const table = TABLES.find(t => t.name === e.target.value);
                if (table) setSelectedTable(table);
              }}
              className="ff-input"
            >
              {TABLES.map(table => (
                <option key={table.name} value={table.name}>
                  {table.icon} {table.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2 flex-1">
            <label className="ff-label">Quick Filter:</label>
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Search across all columns..."
              className="ff-input flex-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onExport}
              className="ff-button-primary flex items-center gap-2"
            >
              <span>📥</span> Export CSV
            </button>
            <button
              className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <span>➕</span> Add Record
            </button>
          </div>
        </div>

        {/* Table Info */}
        <div className="ff-muted-text">
          <span className="font-medium">{selectedTable.demoData.length}</span> records in {selectedTable.displayName} table
        </div>
      </div>

      {/* Grid */}
      <div className="ff-table-container">
        <div
          className="ag-theme-quartz"
          style={{ width: "100%", height: 600 }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={selectedTable.demoData}
            columnDefs={selectedTable.columns}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilter}
            {...gridOptions}
          />
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 ff-secondary-text">
        <p className="flex items-center gap-2">
          <span>💡</span> 
          <span>Double-click any cell to edit. Use Shift+Click to select multiple rows. Column headers can be clicked to sort.</span>
        </p>
      </div>
    </div>
  );
}