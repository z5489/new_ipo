import yfinance as yf
import requests
import json
import csv
import os
from datetime import datetime, timedelta

# Try to get the API key
FINNHUB_KEY = os.environ.get("FINNHUB_API_KEY")

# --- Load tickers from universe.csv ---
tickers = []
csv_path = "universe.csv"

if not os.path.exists(csv_path):
    print(f"Error: {csv_path} not found. Creating a default one.")
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Ticker"])
        for t in ["ARM", "RDDT", "CART", "ALAB", "KVUE", "BIRK", "PLTR", "SNOW", "ABNB", "DASH"]:
            writer.writerow([t])

with open(csv_path) as f:
    reader = csv.DictReader(f)
    for row in reader:
        if "Ticker" in row and row["Ticker"].strip():
            tickers.append(row["Ticker"].strip())

print(f"Loaded {len(tickers)} tickers from {csv_path}: {tickers}")

# --- Fetch market data ---
results = []
for ticker in tickers:
    print(f"Fetching data for {ticker}...")
    try:
        ticker_obj = yf.Ticker(ticker)
        info = ticker_obj.info or {}
        
        # Get history (6 months) to calculate changes, fallback dates, and charts
        hist = ticker_obj.history(period="6mo")
        
        # Extract prices
        price = info.get("currentPrice") or info.get("regularMarketPrice")
        prev_close = info.get("previousClose")
        
        week_ago_price = None
        month_ago_price = None
        
        if not hist.empty:
            if not price:
                price = float(hist["Close"].iloc[-1])
            if not prev_close and len(hist) >= 2:
                prev_close = float(hist["Close"].iloc[-2])
            
            # Calculate 1w and 1m base prices
            if len(hist) >= 6:
                week_ago_price = float(hist["Close"].iloc[-6])
            else:
                week_ago_price = float(hist["Close"].iloc[0])
                
            if len(hist) >= 22:
                month_ago_price = float(hist["Close"].iloc[-22])
            else:
                month_ago_price = float(hist["Close"].iloc[0])
                
            # Calculate MA10
            if len(hist) >= 10:
                ma10 = round(float(hist["Close"].tail(10).mean()), 2)
            else:
                ma10 = None
            
        def pct_change(current, base):
            if current is not None and base is not None and base != 0:
                return round((current - base) / base * 100, 2)
            return None

        # Extract IPO Date
        ipo_date_raw = info.get("ipoExpectedDate") or info.get("firstTradeDateEpochUtc")
        ipo_date = None
        
        if ipo_date_raw:
            if isinstance(ipo_date_raw, (int, float)):
                try:
                    ipo_date = datetime.utcfromtimestamp(ipo_date_raw).strftime("%Y-%m-%d")
                except Exception as ex:
                    print(f"Error parsing epoch {ipo_date_raw} for {ticker}: {ex}")
            elif isinstance(ipo_date_raw, str):
                ipo_date = ipo_date_raw.split("T")[0]
                
        # Fallback to the first day of available history if listed recently
        if not ipo_date and not hist.empty:
            try:
                first_date = hist.index[0]
                if hasattr(first_date, "strftime"):
                    ipo_date = first_date.strftime("%Y-%m-%d")
                else:
                    ipo_date = str(first_date).split(" ")[0]
            except Exception as ex:
                print(f"Error fallback date for {ticker}: {ex}")

        # Extract 6mo daily price history
        history_data = []
        if not hist.empty:
            for date_idx, row in hist.iterrows():
                try:
                    d_str = date_idx.strftime("%Y-%m-%d")
                    history_data.append({"date": d_str, "price": round(float(row["Close"]), 2)})
                except:
                    pass

        # Build data record
        results.append({
            "ticker": ticker,
            "name": info.get("longName") or info.get("shortName") or "N/A",
            "ipoDate": ipo_date,
            "marketCap": info.get("marketCap"),
            "avgVolume": info.get("averageVolume") or info.get("averageVolume10days"),
            "epsGrowthNextYear": info.get("earningsGrowth"), # earnings growth next year or trailing
            "price": price,
            "change1d": pct_change(price, prev_close),
            "change1w": pct_change(price, week_ago_price),
            "change1m": pct_change(price, month_ago_price),
            "sector": info.get("sector") or "N/A",
            "industry": info.get("industry") or "N/A",
            "peRatio": info.get("trailingPE") or info.get("forwardPE"),
            "ma10": ma10 if 'ma10' in locals() else None,
            "aboveMA10": bool(price > ma10) if 'ma10' in locals() and ma10 is not None and price is not None else False,
            "history": history_data
        })
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        results.append({
            "ticker": ticker,
            "name": "N/A",
            "ipoDate": None,
            "marketCap": None,
            "avgVolume": None,
            "epsGrowthNextYear": None,
            "price": None,
            "change1d": None,
            "change1w": None,
            "change1m": None,
            "sector": "N/A",
            "industry": "N/A",
            "peRatio": None,
            "history": [],
            "error": str(e)
        })

# Write to data.json with date suffix
output_data = {
    "lastUpdated": datetime.utcnow().isoformat() + "Z",
    "stocks": results
}

date_str = datetime.utcnow().strftime("%Y-%m-%d")
output_dir = os.path.join("frontend", "public", "output")
os.makedirs(output_dir, exist_ok=True)

data_filename = f"data_{date_str}.json"
dev_data_path = os.path.join(output_dir, data_filename)
with open(dev_data_path, "w") as f:
    json.dump(output_data, f, indent=2)
print(f"Successfully wrote data.json to {dev_data_path} ({len(results)} records).")

# --- Fetch upcoming IPOs from Finnhub ---
ipos = []
if FINNHUB_KEY:
    print("Fetching upcoming IPOs from Finnhub API...")
    try:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        in_30_str = (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d")
        url = (
            f"https://finnhub.io/api/v1/calendar/ipo"
            f"?from={today_str}&to={in_30_str}&token={FINNHUB_KEY}"
        )
        resp = requests.get(url, timeout=10)
        if resp.ok:
            ipos = resp.json().get("ipoCalendar", [])
            print(f"Fetched {len(ipos)} upcoming IPOs from Finnhub.")
        else:
            print(f"Finnhub API error (status code {resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"Error querying Finnhub API: {e}")
else:
    print("Warning: FINNHUB_API_KEY environment variable not found. Using mock upcoming IPOs.")
    # Provide highly realistic mock IPO data for development/demo
    mock_date_1 = (datetime.utcnow() + timedelta(days=4)).strftime("%Y-%m-%d")
    mock_date_2 = (datetime.utcnow() + timedelta(days=11)).strftime("%Y-%m-%d")
    mock_date_3 = (datetime.utcnow() + timedelta(days=18)).strftime("%Y-%m-%d")
    mock_date_4 = (datetime.utcnow() + timedelta(days=25)).strftime("%Y-%m-%d")
    
    ipos = [
        {
            "name": "Apex Artificial Intelligence Corp",
            "symbol": "AAIC",
            "exchange": "NASDAQ",
            "date": mock_date_1,
            "price": "18.00 - 20.00",
            "numberOfShares": 6000000
        },
        {
            "name": "BioHealth Therapeutics Inc",
            "symbol": "BHTI",
            "exchange": "NYSE",
            "date": mock_date_2,
            "price": "12.00 - 14.00",
            "numberOfShares": 4500000
        },
        {
            "name": "Nova Space Exploration Systems",
            "symbol": "NSXS",
            "exchange": "NASDAQ",
            "date": mock_date_3,
            "price": "24.00 - 26.00",
            "numberOfShares": 10000000
        },
        {
            "name": "EcoCharge Power Inc",
            "symbol": "ECPI",
            "exchange": "NYSE",
            "date": mock_date_4,
            "price": "15.00 - 17.00",
            "numberOfShares": 8000000
        }
    ]

# Write to upcoming_ipos.json with date suffix
output_ipos = {
    "lastUpdated": datetime.utcnow().isoformat() + "Z",
    "ipos": ipos
}

ipos_filename = f"upcoming_ipos_{date_str}.json"
dev_ipos_path = os.path.join(output_dir, ipos_filename)
with open(dev_ipos_path, "w") as f:
    json.dump(output_ipos, f, indent=2)
print(f"Successfully wrote upcoming_ipos.json to {dev_ipos_path} ({len(ipos)} records).")

# Update manifest.json
manifest_path = os.path.join(output_dir, "manifest.json")
manifest_data = {"availableDates": [], "latestDate": ""}

if os.path.exists(manifest_path):
    try:
        with open(manifest_path, "r") as f:
            manifest_data = json.load(f)
    except Exception as e:
        print(f"Warning: could not read manifest: {e}")

if date_str not in manifest_data["availableDates"]:
    manifest_data["availableDates"].append(date_str)

# Sort dates in reverse (newest first)
manifest_data["availableDates"].sort(reverse=True)
manifest_data["latestDate"] = manifest_data["availableDates"][0]

with open(manifest_path, "w") as f:
    json.dump(manifest_data, f, indent=2)
print(f"Successfully updated manifest.json at {manifest_path}. Available dates: {manifest_data['availableDates']}")
