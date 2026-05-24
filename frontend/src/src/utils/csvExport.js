/**
 * Converts stock records to CSV format.
 * @param {Array} data - Array of stock objects.
 * @returns {string} CSV formatted string.
 */
export function convertToCSV(data) {
  const headers = [
    "Ticker",
    "Company Name",
    "IPO Date",
    "Market Cap",
    "Avg Volume (30-day)",
    "EPS Growth Next Year (%)",
    "Current Price",
    "1-Day Price Change (%)",
    "1-Week Price Change (%)",
    "1-Month Price Change (%)",
    "Sector",
    "Industry",
    "P/E Ratio"
  ];

  const formatValue = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "string") {
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    return val;
  };

  const rows = data.map(stock => {
    // yfinance earningsGrowth is typically a decimal (e.g. 0.15 for 15%). We multiply by 100 for percentage representation.
    const epsGrowthVal = (stock.epsGrowthNextYear !== null && stock.epsGrowthNextYear !== undefined)
      ? (stock.epsGrowthNextYear * 100).toFixed(2)
      : null;

    return [
      formatValue(stock.ticker),
      formatValue(stock.name),
      formatValue(stock.ipoDate),
      formatValue(stock.marketCap),
      formatValue(stock.avgVolume),
      formatValue(epsGrowthVal),
      formatValue(stock.price),
      formatValue(stock.change1d),
      formatValue(stock.change1w),
      formatValue(stock.change1m),
      formatValue(stock.sector),
      formatValue(stock.industry),
      formatValue(stock.peRatio)
    ];
  });

  return [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
}

/**
 * Initiates a browser download for a CSV string.
 * @param {string} csvContent - The CSV string content.
 * @param {string} filename - Output file name.
 */
export function downloadCSV(csvContent, filename = "ipo_screener_results.csv") {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
