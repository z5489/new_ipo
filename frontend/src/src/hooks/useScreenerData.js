import { useState, useEffect, useMemo } from "react";

export function useScreenerData() {
  const [stocks, setStocks] = useState([]);
  const [upcomingIpos, setUpcomingIpos] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [upcomingLastUpdated, setUpcomingLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both json files in parallel
      const [stocksRes, iposRes] = await Promise.all([
        fetch("./data.json?t=" + Date.now()).then((res) => {
          if (!res.ok) throw new Error("Failed to load screener data.");
          return res.json();
        }),
        fetch("./upcoming_ipos.json?t=" + Date.now()).then((res) => {
          if (!res.ok) throw new Error("Failed to load upcoming IPOs.");
          return res.json();
        }),
      ]);

      setStocks(stocksRes.stocks || []);
      setLastUpdated(stocksRes.lastUpdated || "");
      setUpcomingIpos(iposRes.ipos || []);
      setUpcomingLastUpdated(iposRes.lastUpdated || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    stocks,
    upcomingIpos,
    lastUpdated,
    upcomingLastUpdated,
    loading,
    error,
    refetch: fetchData,
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

      // 3. EPS Growth Filter
      if (filters.epsGrowthFloor !== "" && filters.epsGrowthFloor !== null && filters.epsGrowthFloor !== undefined) {
        if (stock.epsGrowthNextYear === null || stock.epsGrowthNextYear === undefined) {
          return false; // exclude missing
        }
        // yfinance EPS growth is decimal (e.g. 0.15 for 15%). Filter floor is in % (e.g. 0 for 0%).
        const epsGrowthPct = stock.epsGrowthNextYear * 100;
        if (epsGrowthPct < Number(filters.epsGrowthFloor)) {
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
