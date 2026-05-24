import { useState, useEffect, useMemo, useCallback } from "react";

export function useScreenerData() {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [stocks, setStocks] = useState([]);
  const [upcomingIpos, setUpcomingIpos] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [upcomingLastUpdated, setUpcomingLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch available dates from manifest
  const fetchManifest = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}output/manifest.json?t=` + Date.now());
      if (!res.ok) throw new Error("Manifest not found");
      const manifest = await res.json();
      const dates = manifest.availableDates || [];
      setAvailableDates(dates);
      return dates;
    } catch (e) {
      console.warn("Failed to load date manifest, falling back to current date.", e);
      // Fallback: use today's date in YYYY-MM-DD format
      const todayStr = new Date().toISOString().split("T")[0];
      setAvailableDates([todayStr]);
      return [todayStr];
    }
  }, []);

  // 2. Fetch data for a specific date
  const fetchDataForDate = useCallback(async (date) => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const [stocksRes, iposRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}output/data_${date}.json?t=` + Date.now()).then((res) => {
          if (!res.ok) throw new Error(`Failed to load screener data for ${date}.`);
          return res.json();
        }),
        fetch(`${import.meta.env.BASE_URL}output/upcoming_ipos_${date}.json?t=` + Date.now()).then((res) => {
          if (!res.ok) throw new Error(`Failed to load upcoming IPOs for ${date}.`);
          return res.json();
        }),
      ]);

      setStocks(stocksRes.stocks || []);
      setLastUpdated(stocksRes.lastUpdated || "");
      setUpcomingIpos(iposRes.ipos || []);
      setUpcomingLastUpdated(iposRes.lastUpdated || "");
    } catch (err) {
      console.error(err);
      setError(err.message || `An error occurred while loading reports for ${date}.`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load manifest on mount
  useEffect(() => {
    const init = async () => {
      const dates = await fetchManifest();
      if (dates.length > 0) {
        setSelectedDate(dates[0]); // default to latest date
      }
    };
    init();
  }, [fetchManifest]);

  // Refetch when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchDataForDate(selectedDate);
    }
  }, [selectedDate, fetchDataForDate]);

  // Full refresh (e.g. after dispatching manual action)
  const handleFullRefresh = async () => {
    // Reload manifest first, in case new date is available
    const dates = await fetchManifest();
    if (dates.length > 0) {
      setSelectedDate(dates[0]); // select the latest date
      await fetchDataForDate(dates[0]);
    }
  };

  return {
    availableDates,
    selectedDate,
    setSelectedDate,
    stocks,
    upcomingIpos,
    lastUpdated,
    upcomingLastUpdated,
    loading,
    error,
    refetch: handleFullRefresh,
  };
}

/**
 * Filter hook to apply criteria client-side.
 */
export function useFilteredStocks(stocks, filters) {
  return useMemo(() => {
    return stocks.filter((stock) => {


      // 1. Market Cap Filter
      if (filters.marketCapFloor !== "" && filters.marketCapFloor !== null && filters.marketCapFloor !== undefined) {
        if (stock.marketCap === null || stock.marketCap === undefined) {
          return false; // exclude missing
        }
        if (stock.marketCap < Number(filters.marketCapFloor)) {
          return false;
        }
      }

      // 2. Volume Filter
      if (filters.avgVolumeFloor !== "" && filters.avgVolumeFloor !== null && filters.avgVolumeFloor !== undefined) {
        if (stock.avgVolume === null || stock.avgVolume === undefined) {
          return false; // exclude missing
        }
        if (stock.avgVolume < Number(filters.avgVolumeFloor)) {
          return false;
        }
      }



      // 4. IPO Date Range Filter (within last X days)
      if (filters.ipoDaysRange !== "" && filters.ipoDaysRange !== null && filters.ipoDaysRange !== undefined) {
        if (!stock.ipoDate) {
          return false; // exclude missing
        }
        
        try {
          const ipoDate = new Date(stock.ipoDate);
          const today = new Date();
          
          // Clear time for date calculation
          ipoDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          const diffTime = today.getTime() - ipoDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Must be within [0, ipoDaysRange]
          if (diffDays < 0 || diffDays > Number(filters.ipoDaysRange)) {
            return false;
          }
        } catch (e) {
          return false; // if parsing fails, exclude
        }
      }

      return true;
    });
  }, [stocks, filters]);
}
