import React, { useState, useMemo } from "react";
import { useScreenerData, useFilteredStocks } from "./hooks/useScreenerData";
import { FilterBar } from "./components/FilterBar";
import { ScreenerTable } from "./components/ScreenerTable";
import { UpcomingIPOs } from "./components/UpcomingIPOs";
import { ExportButton } from "./components/ExportButton";
import { RefreshBadge } from "./components/RefreshBadge";
import { Layers, Calendar, BarChart3, TrendingUp, Sparkles } from "lucide-react";

const DEFAULT_FILTERS = {
  marketCapFloor: 2000000000,    // $2B
  avgVolumeFloor: 1000000,       // 1M
  ipoDaysRange: 365,             // 365 days (1 year)
};

function App() {
  const {
    availableDates,
    selectedDate,
    setSelectedDate,
    stocks,
    upcomingIpos,
    lastUpdated,
    upcomingLastUpdated,
    loading,
    error,
    refetch,
  } = useScreenerData();

  const [activeTab, setActiveTab] = useState("screener");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Apply filters client-side
  const filteredStocks = useFilteredStocks(stocks, filters);

  // Stats / KPI Metrics calculations
  const totalTickersCount = stocks.length;
  const filteredCount = filteredStocks.length;
  const passRate = totalTickersCount > 0 ? ((filteredCount / totalTickersCount) * 100).toFixed(0) : 0;

  const medianMarketCap = useMemo(() => {
    const caps = filteredStocks
      .map((s) => s.marketCap)
      .filter((c) => c !== null && c !== undefined)
      .sort((a, b) => a - b);
    
    if (caps.length === 0) return 0;
    const mid = Math.floor(caps.length / 2);
    return caps.length % 2 !== 0 ? caps[mid] : (caps[mid - 1] + caps[mid]) / 2;
  }, [filteredStocks]);

  const formatMC = (num) => {
    if (!num) return "$0";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              IPO Screener <span className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium">V1.0</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live market intelligence and calendar monitoring for recent public offerings.
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          {/* Date Selector */}
          {availableDates.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-850 px-3 h-9 rounded-lg">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 select-none">
                Report:
              </span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 border-none outline-none focus:ring-0 cursor-pointer font-mono font-semibold"
              >
                {availableDates.map((date) => (
                  <option key={date} value={date} className="bg-slate-950 text-slate-200">
                    {date}
                  </option>
                ))}
              </select>
            </div>
          )}

          <RefreshBadge lastUpdated={lastUpdated} refetch={refetch} />
        </div>
      </header>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total universe */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 pt-4 pb-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Ticker Universe
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[24px] font-bold leading-[1.1] text-white">
              {totalTickersCount}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">monitored</span>
          </div>
        </div>

        {/* Card 2: Passed Stocks */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 pt-4 pb-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Passed Screener
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[24px] font-bold leading-[1.1] text-teal-400">
              {filteredCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({passRate}% pass rate)
            </span>
          </div>
        </div>

        {/* Card 3: Median Market Cap */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 pt-4 pb-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Median MC (Passed)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[24px] font-bold leading-[1.1] text-white">
              {formatMC(medianMarketCap)}
            </span>
          </div>
        </div>

        {/* Card 4: Upcoming listings */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 pt-4 pb-3 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Upcoming IPOs (30d)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[24px] font-bold leading-[1.1] text-purple-400">
              {upcomingIpos.length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">scheduled</span>
          </div>
        </div>
      </section>

      {/* Tabs Selector & Toolbar Row */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/60 pb-1">
        {/* Tabs switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900">
          <button
            onClick={() => setActiveTab("screener")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              activeTab === "screener"
                ? "bg-slate-850 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 size={13} />
            IPO Screener
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              activeTab === "upcoming"
                ? "bg-slate-850 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar size={13} />
            Upcoming IPOs
            {upcomingIpos.length > 0 && (
              <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.2 rounded-full border border-purple-500/25">
                {upcomingIpos.length}
              </span>
            )}
          </button>
        </div>

        {/* Global actions (Export CSV) visible only under Screener tab */}
        {activeTab === "screener" && (
          <div className="self-end sm:self-auto">
            <ExportButton data={filteredStocks} />
          </div>
        )}
      </section>

      {/* Main Tab Views */}
      <main className="flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Retrieving market datasets...</span>
          </div>
        ) : error ? (
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-6 text-center text-rose-300 text-sm">
            Failed to load data files. Make sure the Python fetch script has run.
            <div className="mt-2 text-xs text-rose-400 font-mono">{error}</div>
          </div>
        ) : (
          <>
            {activeTab === "screener" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  defaultFilters={DEFAULT_FILTERS}
                />
                <ScreenerTable stocks={filteredStocks} />
              </div>
            )}

            {activeTab === "upcoming" && (
              <div className="animate-fadeIn">
                <UpcomingIPOs ipos={upcomingIpos} lastUpdated={upcomingLastUpdated} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
