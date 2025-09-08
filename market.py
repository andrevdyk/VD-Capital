import yfinance as yf
from datetime import datetime, timedelta
from supabase import create_client, Client

# ========================
# CONFIGURATION
# ========================
SUPABASE_URL = "https://nobtgazxiggvkrwxugpq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vYnRnYXp4aWdndmtyd3h1Z3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2Nzk5OTIsImV4cCI6MjA0MjI1NTk5Mn0.SWmzkATJ5uUNhCrFdXB-FeCEL3wcVk6p_eDqXpOD-qg"
TABLE_NAME = "forex_data"

# List of forex pairs (Yahoo tickers)
PAIRS = {
    "EURUSD": "EURUSD=X",
    "GBPUSD": "GBPUSD=X",
    "USDJPY": "USDJPY=X",
    "AUDUSD": "AUDUSD=X",
    "NZDUSD": "NZDUSD=X",
    "USDCAD": "USDCAD=X",
    "USDCHF": "USDCHF=X",
    "EURGBP": "EURGBP=X",
    "EURJPY": "EURJPY=X",
    "GBPJPY": "GBPJPY=X",
    "USDZAR": "USDZAR=X",
    "USDTRY": "USDTRY=X",
    "USDMXN": "USDMXN=X"
}

# Ranges
NOW = datetime.utcnow()
RANGES = {
    "60m": NOW - timedelta(days=1),     # 6 months
    #"4h": NOW - timedelta(days=730),     # 2 years
    "1d": NOW - timedelta(days=2)     # 5 years
}

# ========================
# INIT SUPABASE
# ========================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_and_format(ticker: str, pair: str, interval: str, start: datetime):
    """Fetch and format OHLCV data from Yahoo Finance."""
    try:
        df = yf.download(
            ticker,
            interval=interval,
            start=start.strftime("%Y-%m-%d"),
            end=NOW.strftime("%Y-%m-%d")
        )
        records = []
        for ts, row in df.iterrows():
            records.append({
                "pair": pair,
                "timestamp": ts.to_pydatetime().isoformat(),
                "open": row["Open"].item(),
                "high": row["High"].item(),
                "low": row["Low"].item(),
                "close": row["Close"].item(),
                "volume": row["Volume"].item(),
                "resolution": interval
            })
        return records
    except Exception as e:
        print(f"Error fetching {pair} {interval}: {e}")
        return []


def main():
    all_records = []
    for pair, ticker in PAIRS.items():
        for interval, start in RANGES.items():
            print(f"Fetching {pair} ({interval}) from {start.date()} to {NOW.date()}")
            records = fetch_and_format(ticker, pair, interval, start)
            all_records.extend(records)

            # Upload in chunks of 500 (Supabase API limit)
            for i in range(0, len(records), 500):
                chunk = records[i:i+500]
                supabase.table(TABLE_NAME).upsert(chunk).execute()

    print(f"Inserted total {len(all_records)} rows.")


if __name__ == "__main__":
    main()
