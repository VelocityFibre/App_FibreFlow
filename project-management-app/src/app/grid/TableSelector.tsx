"use client";
import { useState } from "react";

const TABLES = [
  "projects",
  "customers",
  "materials",
  "stock_items",
  "stock_movements",
  "contractors",
  "contacts",
  "sheq",
  "meeting_summaries",
];

export default function TableSelector({ table, setTable }: { table: string; setTable: (t: string) => void }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <label htmlFor="table-select" className="text-lg font-medium text-gray-300">Table:</label>
      <select
        id="table-select"
        value={table}
        onChange={e => setTable(e.target.value)}
        className="bg-gray-800 text-gray-100 px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring"
      >
        {TABLES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}
