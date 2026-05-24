import React from "react";
import { Calendar, DollarSign, Tag, Landmark } from "lucide-react";

export function UpcomingIPOs({ ipos, lastUpdated }) {
  const formatShares = (num) => {
    if (num === null || num === undefined) return "N/A";
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to estimate total capital raised based on the price range
  const estimateRaise = (priceStr, shares) => {
    if (!priceStr || !shares) return null;
    try {
      // price range is usually like "14.00 - 16.00" or similar
      const parts = priceStr.split("-").map(p => parseFloat(p.trim().replace("$", "")));
      if (parts.length === 1 && !isNaN(parts[0])) {
        return parts[0] * shares;
      } else if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const midPrice = (parts[0] + parts[1]) / 2;
        return midPrice * shares;
      }
    } catch (e) {
      // ignore parsing error
    }
    return null;
  };

  const formatCurrency = (val) => {
    if (!val) return null;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Panel Sub-Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase text-[11px]">
            Upcoming IPO Calendar (Next 30 Days)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            US Exchange listings scheduled for pricing. Sourced from Finnhub.
          </p>
        </div>
        {lastUpdated && (
          <div className="text-[11px] font-mono text-slate-600 bg-slate-900/30 px-2 py-0.5 rounded border border-slate-800/50">
            Calendar updated: {new Date(lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      {ipos.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-8 text-center text-slate-500 text-sm">
          No upcoming IPOs found in the next 30 days.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ipos.map((ipo, idx) => {
            const raise = estimateRaise(ipo.price, ipo.numberOfShares);
            return (
              <div
                key={`${ipo.symbol || 'TBD'}-${idx}`}
                className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
              >
                {/* Visual Accent Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-500/5 group-hover:to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Top line: Symbol and Exchange */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="inline-flex items-center text-xs font-mono font-bold px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md">
                      {ipo.symbol || "TBD"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Landmark size={12} className="text-slate-500" />
                      {ipo.exchange || "Exchange TBD"}
                    </span>
                  </div>

                  {/* Company Name */}
                  <h3 className="text-sm font-semibold text-slate-100 mb-4 line-clamp-2 min-h-[40px] leading-tight">
                    {ipo.name}
                  </h3>
                </div>

                {/* Listing Details List */}
                <div className="border-t border-slate-800/60 pt-3 flex flex-col gap-2.5">
                  {/* Expected Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={13} className="text-slate-600" />
                      Expected Date
                    </span>
                    <span className="font-medium text-slate-300 font-mono">
                      {formatDate(ipo.date)}
                    </span>
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <DollarSign size={13} className="text-slate-600" />
                      Price Range
                    </span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {ipo.price ? `$${ipo.price}` : "TBD"}
                    </span>
                  </div>

                  {/* Shares Offered */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Tag size={13} className="text-slate-600" />
                      Shares Offered
                    </span>
                    <span className="font-medium text-slate-300 font-mono">
                      {formatShares(ipo.numberOfShares)}
                    </span>
                  </div>

                  {/* Estimated Raising amount */}
                  {raise && (
                    <div className="flex items-center justify-between text-xs border-t border-dashed border-slate-800/40 pt-2.5">
                      <span className="text-slate-500">Est. Raising Size</span>
                      <span className="font-semibold text-teal-400 font-mono">
                        {formatCurrency(raise)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
