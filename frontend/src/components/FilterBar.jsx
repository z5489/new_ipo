import React from "react";
import { RotateCcw, Flame, TrendingUp, Layers } from "lucide-react";

export function FilterBar({ filters, setFilters, defaultFilters, availableSectors = [] }) {
  const handleChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? "" : (name === "sector" || typeof value === "boolean" ? value : Number(value)),
    }));
  };

  const handleNumberChange = (name, rawValue) => {
    const numericStr = rawValue.replace(/[^0-9]/g, "");
    setFilters((prev) => ({
      ...prev,
      [name]: numericStr === "" ? "" : Number(numericStr),
    }));
  };

  const formatNumber = (num) => {
    if (num === "" || num === undefined || num === null) return "";
    return Number(num).toLocaleString();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const applyPreset = (preset) => {
    setFilters({
      ...defaultFilters,
      ...preset,
    });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 gap-4 flex flex-col">
      {/* Header and Presets */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase text-[11px] sm:text-[11px]">
            Screener Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure filtering rules or apply standard pre-sets.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-1.5">          <button
            onClick={() =>
              applyPreset({
                marketCapFloor: 10000000000, // $10B
              })
            }
            className="flex items-center gap-1.5 sm:gap-1 px-3 py-2 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] font-medium text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-full transition-all duration-200"
          >
            <TrendingUp size={12} />
            Mega Cap
          </button>

          <button
            onClick={() =>
              applyPreset({
                ipoDaysRange: 90, // 90 days
              })
            }
            className="flex items-center gap-1.5 sm:gap-1 px-3 py-2 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full transition-all duration-200"
          >
            <Flame size={12} />
            Recent 90 Days
          </button>
          
          <button
            onClick={() =>
              applyPreset({
                avgVolumeFloor: 5000000, // 5M
              })
            }
            className="flex items-center gap-1.5 sm:gap-1 px-3 py-2 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] font-medium text-blue-300 hover:text-blue-200 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-full transition-all duration-200"
          >
            <Layers size={12} />
            High Volume
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 sm:gap-1 px-3 py-2 sm:px-2.5 sm:py-1 text-xs sm:text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-200 sm:ml-1"
            title="Reset Filters"
          >
            <RotateCcw size={12} />
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Fundamental Row */}
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Fundamental Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Market Cap */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Min Market Cap ($)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatNumber(filters.marketCapFloor)}
                  onChange={(e) => handleNumberChange("marketCapFloor", e.target.value)}
                  className="w-full h-11 sm:h-9 pl-4 sm:pl-3 pr-12 sm:pr-10 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  placeholder="e.g. 2,000,000,000"
                />
                <span className="absolute right-4 sm:right-3 top-3.5 sm:top-2 text-[10px] text-slate-600 uppercase font-mono select-none">
                  USD
                </span>
              </div>
            </div>

            {/* Avg Volume */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Min 30-Day Avg Volume
              </label>
              <input
                type="text"
                value={formatNumber(filters.avgVolumeFloor)}
                onChange={(e) => handleNumberChange("avgVolumeFloor", e.target.value)}
                className="w-full h-11 sm:h-9 px-4 sm:px-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                placeholder="e.g. 1,000,000"
              />
            </div>

            {/* IPO Days Range */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                IPO Date Window (Last X Days)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={filters.ipoDaysRange}
                  onChange={(e) => handleChange("ipoDaysRange", e.target.value)}
                  className="w-full h-11 sm:h-9 pl-4 sm:pl-3 pr-14 sm:pr-12 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  placeholder="e.g. 365"
                />
                <span className="absolute right-4 sm:right-3 top-3.5 sm:top-2 text-[10px] text-slate-600 uppercase font-mono select-none">
                  Days
                </span>
              </div>
            </div>

            {/* Sector Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Sector
              </label>
              <div className="relative">
                <select
                  value={filters.sector || "All"}
                  onChange={(e) => handleChange("sector", e.target.value)}
                  className="w-full h-11 sm:h-9 px-4 sm:px-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Sectors</option>
                  {availableSectors.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
                {/* Custom arrow */}
                <div className="absolute right-4 sm:right-3 top-3.5 sm:top-2.5 pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Row */}
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Technical Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Above MA10 Toggle */}
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-11 sm:h-9 px-4 sm:px-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-lg text-sm text-slate-200 select-none transition-colors">
                <input
                  type="checkbox"
                  checked={filters.aboveMA10 || false}
                  onChange={(e) => handleChange("aboveMA10", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500/30 w-5 h-5 sm:w-4 sm:h-4"
                />
                <span>Price {'>'} 10-Day MA</span>
              </label>
            </div>

            {/* Above MA20 Toggle */}
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-11 sm:h-9 px-4 sm:px-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-lg text-sm text-slate-200 select-none transition-colors">
                <input
                  type="checkbox"
                  checked={filters.aboveMA20 || false}
                  onChange={(e) => handleChange("aboveMA20", e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500/30 w-5 h-5 sm:w-4 sm:h-4"
                />
                <span>Price {'>'} 20-Day MA</span>
              </label>
            </div>

            {/* Min RSI */}
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="text-xs font-medium text-slate-300">
                Min RSI (14)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.rsiMin}
                onChange={(e) => handleChange("rsiMin", e.target.value)}
                className="w-full h-11 sm:h-9 px-4 sm:px-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                placeholder="0"
              />
            </div>

            {/* Max RSI */}
            <div className="flex flex-col gap-1.5 justify-end">
              <label className="text-xs font-medium text-slate-300">
                Max RSI (14)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.rsiMax}
                onChange={(e) => handleChange("rsiMax", e.target.value)}
                className="w-full h-11 sm:h-9 px-4 sm:px-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                placeholder="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
