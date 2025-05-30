"use client";
import { FiDatabase, FiChevronDown } from "react-icons/fi";

interface TableSelectorProps {
  table: string;
  setTable: (table: string) => void;
  tables?: string[];
}

const DEFAULT_TABLES = [
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

export default function TableSelector({ table, setTable, tables = DEFAULT_TABLES }: TableSelectorProps) {
  // Format table name for display
  const formatTableName = (tableName: string) => {
    return tableName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center text-gray-700 dark:text-gray-300">
        <FiDatabase className="mr-2" />
        <span className="font-medium">Table:</span>
      </div>
      
      <div className="relative">
        <select
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
        >
          {tables.map((tableName) => (
            <option key={tableName} value={tableName}>
              {formatTableName(tableName)}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <FiChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {/* Table count indicator */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {tables.length} tables available
      </div>
    </div>
  );
}