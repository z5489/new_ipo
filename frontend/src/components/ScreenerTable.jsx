import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import Chart from "react-apexcharts";

export function ScreenerTable({ stocks }) {
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTicker, setExpandedTicker] = useState(null);
  const itemsPerPage = 50;

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc (most useful for financial indicators)
    }
    setCurrentPage(1); // Reset to first page
  };

  const sortedStocks = useMemo(() => {
    if (!sortField) return stocks;

    const directionMultiplier = sortDirection === "asc" ? 1 : -1;

    return [...stocks].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nulls / undefined - always put them at the bottom
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Handle string comparison (e.g. ticker, name, sector)
      if (typeof valA === "string" && typeof valB === "string") {
        return valA.localeCompare(valB) * directionMultiplier;
      }

      // Handle numeric comparison
      return (Number(valA) - Number(valB)) * directionMultiplier;
    });
  }, [stocks, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedStocks.length / itemsPerPage));
  const paginatedStocks = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedStocks.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedStocks, currentPage]);

  // Formatters
  const formatMarketCap = (num) => {
    if (num === null || num === undefined) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono">N/A</span>;
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatVolume = (num) => {
    if (num === null || num === undefined) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono">N/A</span>;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatEPSGrowth = (num) => {
    if (num === null || num === undefined) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono">N/A</span>;
    const val = (num * 100).toFixed(1);
    const isPositive = num >= 0;
    return (
      <span className={`font-mono font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
        {isPositive ? "+" : ""}{val}%
      </span>
    );
  };

  const formatPrice = (num) => {
    if (num === null || num === undefined) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono">N/A</span>;
    return `$${num.toFixed(2)}`;
  };

  const formatPE = (num) => {
    if (num === null || num === undefined) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono font-normal">N/A</span>;
    return <span className="font-mono">{num.toFixed(1)}</span>;
  };

  const formatPriceChange = (val) => {
    if (val === null || val === undefined) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono">N/A</span>;
    const isPositive = val >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md border font-mono ${
          isPositive
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}
      >
        {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
        {Math.abs(val).toFixed(2)}%
      </span>
    );
  };

  const formatIPODate = (dateStr) => {
    if (!dateStr) return <span className="text-[11px] bg-slate-800/60 text-slate-500 border border-slate-700/30 px-1.5 py-0.5 rounded-md font-mono">N/A</span>;
    return <span className="font-mono text-slate-300">{dateStr}</span>;
  };

  const SortHeader = ({ label, field }) => (
    <th
      onClick={() => handleSort(field)}
      className="cursor-pointer select-none py-3 px-3 hover:bg-slate-800/40 text-slate-400 text-left font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800 transition-colors whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          size={11}
          className={`${
            sortField === field ? "text-teal-400" : "text-slate-600 hover:text-slate-400"
          }`}
        />
      </div>
    </th>
  );

  return (
    <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col shadow-2xl">
      {/* Scrollable container with sticky header and column */}
      <div className="max-h-[60vh] overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
              {/* Sticky Ticker Column Header */}
              <th
                onClick={() => handleSort("ticker")}
                className="cursor-pointer select-none py-3 px-3 hover:bg-slate-800/40 text-slate-400 text-left font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800 transition-colors sticky left-0 z-40 bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.3)] whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  Ticker
                  <ArrowUpDown
                    size={11}
                    className={`${
                      sortField === "ticker" ? "text-teal-400" : "text-slate-600"
                    }`}
                  />
                </div>
              </th>
              
              <SortHeader label="Company Name" field="name" />
              <SortHeader label="IPO Date" field="ipoDate" />
              <SortHeader label="Market Cap" field="marketCap" />
              <SortHeader label="Avg Volume" field="avgVolume" />
              <SortHeader label="EPS Growth Y+1" field="epsGrowthNextYear" />
              <SortHeader label="Price" field="price" />
              <SortHeader label="1D Chg" field="change1d" />
              <SortHeader label="1W Chg" field="change1w" />
              <SortHeader label="1M Chg" field="change1m" />
              <SortHeader label="Sector" field="sector" />
              <SortHeader label="Industry" field="industry" />
              <SortHeader label="P/E" field="peRatio" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-8 text-slate-500 text-sm">
                  No stocks match the screening criteria.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock) => (
                <React.Fragment key={stock.ticker}>
                  <tr
                    onClick={() => setExpandedTicker(expandedTicker === stock.ticker ? null : stock.ticker)}
                    className="hover:bg-slate-900/30 transition-colors duration-150 group cursor-pointer"
                  >
                    {/* Sticky Ticker Column Body */}
                    <td className="py-2.5 px-3 sticky left-0 z-20 bg-slate-950 group-hover:bg-slate-900/60 shadow-[2px_0_5px_rgba(0,0,0,0.3)] border-r border-slate-800/40">
                      <div className="font-semibold text-slate-100 group-hover:text-teal-400 transition-colors">
                        {stock.ticker}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-sm max-w-xs truncate" title={stock.name}>
                      {stock.name}
                    </td>
                    <td className="py-2.5 px-3 text-sm">{formatIPODate(stock.ipoDate)}</td>
                    <td className="py-2.5 px-3 text-sm font-mono text-slate-300">{formatMarketCap(stock.marketCap)}</td>
                    <td className="py-2.5 px-3 text-sm font-mono text-slate-300">{formatVolume(stock.avgVolume)}</td>
                    <td className="py-2.5 px-3 text-sm">{formatEPSGrowth(stock.epsGrowthNextYear)}</td>
                    <td className="py-2.5 px-3 text-sm font-mono text-slate-200 font-semibold">{formatPrice(stock.price)}</td>
                    <td className="py-2.5 px-3 text-sm">{formatPriceChange(stock.change1d)}</td>
                    <td className="py-2.5 px-3 text-sm">{formatPriceChange(stock.change1w)}</td>
                    <td className="py-2.5 px-3 text-sm">{formatPriceChange(stock.change1m)}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 max-w-xs truncate" title={stock.sector}>
                      {stock.sector}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 max-w-xs truncate" title={stock.industry}>
                      {stock.industry}
                    </td>
                    <td className="py-2.5 px-3 text-sm font-mono text-slate-300">{formatPE(stock.peRatio)}</td>
                  </tr>
                  
                  {expandedTicker === stock.ticker && (
                    <tr className="bg-slate-900/40">
                      <td colSpan={13} className="p-0 border-b border-slate-800/40">
                        {stock.history && stock.history.length > 0 && stock.history[0].open !== undefined ? (
                          <div className="sticky left-0 w-[calc(100vw-2rem)] md:w-[calc(100vw-4rem)] max-w-[1280px] p-4">
                            <div className="h-[350px] w-full min-w-0" style={{ minWidth: 0 }}>
                              <h3 className="text-sm font-semibold text-slate-300 mb-2">{stock.name} ({stock.ticker}) - 6 Month Price History</h3>
                              <div className="h-[320px] w-full">
                              <Chart
                                type="candlestick"
                                height="100%"
                                width="100%"
                                series={[
                                  {
                                    name: "Price",
                                    type: "candlestick",
                                    data: stock.history.map(d => ({
                                      x: new Date(d.date),
                                      y: [d.open, d.high, d.low, d.close]
                                    }))
                                  },
                                  {
                                    name: "10-Day MA",
                                    type: "line",
                                    data: stock.history.map(d => ({
                                      x: new Date(d.date),
                                      y: d.ma10
                                    }))
                                  }
                                ]}
                                options={{
                                  chart: {
                                    background: 'transparent',
                                    toolbar: { show: false },
                                    animations: { enabled: false },
                                    zoom: { enabled: false },
                                    pan: { enabled: false }
                                  },
                                  theme: { mode: 'dark' },
                                  xaxis: {
                                    type: 'datetime',
                                    labels: { style: { colors: '#94a3b8' } },
                                    axisBorder: { show: false },
                                    axisTicks: { show: false }
                                  },
                                  yaxis: {
                                    tooltip: { enabled: true },
                                    labels: {
                                      style: { colors: '#94a3b8' },
                                      formatter: (val) => `$${val.toFixed(2)}`
                                    }
                                  },
                                  grid: {
                                    borderColor: '#1e293b',
                                    strokeDashArray: 3,
                                  },
                                  plotOptions: {
                                    candlestick: {
                                      colors: {
                                        upward: '#2dd4bf',
                                        downward: '#f43f5e'
                                      },
                                      wick: { useFillColor: true }
                                    }
                                  },
                                  stroke: {
                                    width: [1, 2],
                                    curve: 'smooth'
                                  },
                                  colors: ['#2dd4bf', '#f59e0b'],
                                  tooltip: {
                                    theme: 'dark',
                                    shared: true
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="sticky left-0 w-[calc(100vw-2rem)] md:w-[calc(100vw-4rem)] max-w-[1280px] text-center text-sm text-slate-500 py-8">
                            No candlestick data available for {stock.ticker}.
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="bg-slate-900/40 border-t border-slate-800/80 px-4 py-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
        <div>
          Showing {stocks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, stocks.length)} of {stocks.length} matches
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-slate-800 rounded bg-slate-950 hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-950 disabled:hover:text-slate-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-slate-400">
              Page <span className="text-slate-200 font-medium">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-slate-800 rounded bg-slate-950 hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-950 disabled:hover:text-slate-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
