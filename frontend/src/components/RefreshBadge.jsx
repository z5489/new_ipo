import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react";

export function RefreshBadge({ lastUpdated, refetch }) {
  const [status, setStatus] = useState("idle"); // idle, triggering, triggered, polling, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [relativeTime, setRelativeTime] = useState("");
  const initialLastUpdatedRef = useRef(lastUpdated);


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

  // 2. Poll data.json once triggered to see when lastUpdated updates
  useEffect(() => {
    if (status !== "polling") return;

    let pollCount = 0;
    const maxPolls = 18; // 18 * 10 seconds = 3 minutes max

    const interval = setInterval(async () => {
      pollCount++;
      try {
        const res = await refetch();
        // Since refetch updates state in parent, we can check if it changed.
        // Wait, parent's lastUpdated state might change. Let's compare with the initial value before refresh.
        // If they differ, it means new data landed!
      } catch (e) {
        console.error("Polling fetch error:", e);
      }

      if (pollCount >= maxPolls) {
        setStatus("idle");
        setErrorMessage("Refresh timed out. Please check GitHub Actions logs.");
        setTimeout(() => setErrorMessage(""), 8000);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [status, refetch]);

  // Listen to lastUpdated updates to complete polling state
  useEffect(() => {
    if (status === "polling" && lastUpdated !== initialLastUpdatedRef.current) {
      setStatus("success");
      initialLastUpdatedRef.current = lastUpdated;
      setTimeout(() => setStatus("idle"), 5000);
    }
  }, [lastUpdated, status]);

  const handleRefresh = async () => {
    setStatus("triggering");
    initialLastUpdatedRef.current = lastUpdated;

    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
      });

      if (response.ok) {
        setStatus("polling");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
      setErrorMessage(e.message || "Failed to trigger GitHub Action.");
      
      // Fallback: Reload local data
      refetch();

      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 7000);
    }
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
          disabled={status === "triggering" || status === "polling"}
          className={`h-9 px-4 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all duration-200 ${
            status === "polling" || status === "triggering"
              ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-slate-950 border-slate-850 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900/40 hover:shadow-lg"
          }`}
        >
          <RefreshCw
            size={13}
            className={`${status === "triggering" || status === "polling" ? "animate-spin text-teal-400" : ""}`}
          />
          {status === "idle" && "Refresh Now"}
          {status === "triggering" && "Triggering..."}
          {status === "polling" && "Running Action (1-2m)..."}
          {status === "success" && "Refreshed!"}
          {status === "error" && "Failed"}
        </button>
      </div>

      {/* Messages */}
      {status === "polling" && (
        <div className="flex items-center gap-1.5 text-[11px] text-teal-400 bg-teal-950/20 border border-teal-800/30 px-3 py-2 rounded-lg leading-snug">
          <Info size={14} className="shrink-0" />
          <span>
            GitHub Action workflow dispatched successfully! Checking for fresh data every 10 seconds.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-400 bg-amber-950/20 border border-amber-800/30 px-3 py-2 rounded-lg leading-snug">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-800/30 px-3 py-2 rounded-lg leading-snug">
          <CheckCircle size={14} className="shrink-0" />
          <span>New market data fetched and loaded successfully!</span>
        </div>
      )}
    </div>
  );
}
