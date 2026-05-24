import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle } from "lucide-react";

export function RefreshBadge({ lastUpdated, refetch }) {
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const [relativeTime, setRelativeTime] = useState("");

  // 1. Calculate relative time
  useEffect(() => {
    if (!lastUpdated) return;

    const updateRelativeTime = () => {
      const diffMs = Date.now() - new Date(lastUpdated).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) {
        setRelativeTime("Just now");
      } else if (diffMins < 60) {
        setRelativeTime(`${diffMins}m ago`);
      } else if (diffHours < 24) {
        setRelativeTime(`${diffHours}h ago`);
      } else {
        setRelativeTime(new Date(lastUpdated).toLocaleDateString());
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = async () => {
    setStatus("loading");
    await refetch();
    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {/* Timestamp */}
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-lg select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span>Last Updated:</span>
            <span className="font-semibold text-slate-300 font-mono">{relativeTime}</span>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={status === "loading"}
          className={`h-9 px-4 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all duration-200 ${
            status === "loading"
              ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-slate-950 border-slate-850 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900/40 hover:shadow-lg"
          }`}
        >
          <RefreshCw
            size={13}
            className={`${status === "loading" ? "animate-spin text-teal-400" : ""}`}
          />
          {status === "idle" && "Refresh Now"}
          {status === "loading" && "Reloading..."}
          {status === "success" && "Reloaded!"}
        </button>
      </div>

      {/* Messages */}
      {status === "success" && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 px-3 py-2 rounded-lg leading-snug">
          <CheckCircle size={14} className="shrink-0" />
          <span>Local data reloaded successfully!</span>
        </div>
      )}
    </div>
  );
}
