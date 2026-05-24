import React from "react";
import { Download } from "lucide-react";
import { convertToCSV, downloadCSV } from "../utils/csvExport";

export function ExportButton({ data }) {
  const handleExport = () => {
    if (data.length === 0) return;
    const csvContent = convertToCSV(data);
    downloadCSV(csvContent, `ipo_screener_filtered_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <button
      onClick={handleExport}
      disabled={data.length === 0}
      className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:bg-slate-800/80 disabled:text-slate-600 border border-teal-500/20 disabled:border-slate-800 rounded-lg hover:shadow-lg hover:shadow-teal-500/10 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all duration-200"
      title={data.length === 0 ? "No data to export" : `Export ${data.length} filtered rows to CSV`}
    >
      <Download size={13} />
      <span>Export CSV ({data.length})</span>
    </button>
  );
}
