import yfinance as yf
from datetime import datetime, timedelta, timezone
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

# Fix deprecated datetime.utcnow()
NOW = datetime.now(timezone.utc)
RANGES = {
    "60m": NOW - timedelta(days=3),     # Extended to 5 days for better data availability
    "1d": NOW - timedelta(days=5)     # Extended to 30 days
}

# ========================
# INIT SUPABASE
# ========================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_and_format(ticker: str, pair: str, interval: str, start: datetime):
    """Fetch and format OHLCV data from Yahoo Finance."""
    try:
        print(f"  Attempting to fetch {ticker} data...")
        df = yf.download(
            ticker,
            interval=interval,
            start=start.strftime("%Y-%m-%d"),
            end=NOW.strftime("%Y-%m-%d"),
            auto_adjust=True,  # Explicitly set to avoid warning
            progress=False     # Reduce output noise
        )
        
        if df.empty:
            print(f"  No data returned for {pair} ({interval})")
            return []
            
        records = []
        for ts, row in df.iterrows():
            # Handle both single-level and multi-level column indexes
            if isinstance(df.columns, pd.MultiIndex):
                # Multi-level columns (when multiple tickers)
                open_val = row[("Open", ticker)] if ("Open", ticker) in row.index else row["Open"].iloc[0]
                high_val = row[("High", ticker)] if ("High", ticker) in row.index else row["High"].iloc[0]
                low_val = row[("Low", ticker)] if ("Low", ticker) in row.index else row["Low"].iloc[0]
                close_val = row[("Close", ticker)] if ("Close", ticker) in row.index else row["Close"].iloc[0]
                volume_val = row[("Volume", ticker)] if ("Volume", ticker) in row.index else row["Volume"].iloc[0]
            else:
                # Single-level columns (single ticker)
                open_val = row["Open"]
                high_val = row["High"]
                low_val = row["Low"]
                close_val = row["Close"]
                volume_val = row["Volume"]
            
            # Skip rows with NaN values
            if pd.isna(open_val) or pd.isna(high_val) or pd.isna(low_val) or pd.isna(close_val):
                continue
                
            records.append({
                "pair": pair,
                "timestamp": ts.to_pydatetime().replace(tzinfo=timezone.utc).isoformat(),
                "open": float(open_val),
                "high": float(high_val),
                "low": float(low_val),
                "close": float(close_val),
                "volume": int(volume_val) if not pd.isna(volume_val) else 0,
                "resolution": interval
            })
        
        print(f"  Successfully fetched {len(records)} records for {pair} ({interval})")
        return records
        
    except Exception as e:
        print(f"  Error fetching {pair} ({interval}): {e}")
        return []


def upload_with_fallback(records, table_name):
    """Upload records with fallback strategies for conflict resolution."""
    if not records:
        return
        
    try:
        # Method 1: Try upsert with on_conflict (requires unique constraint)
        print(f"    Attempting upsert with conflict resolution...")
        supabase.table(table_name).upsert(
            records,
            on_conflict=["pair", "timestamp", "resolution"]
        ).execute()
        print(f"    Successfully upserted {len(records)} records")
        
    except Exception as upsert_error:
        print(f"    Upsert failed: {upsert_error}")
        print(f"    Trying alternative approach...")
        
        try:
            # Method 2: Try simple upsert without on_conflict specification
            supabase.table(table_name).upsert(records).execute()
            print(f"    Successfully upserted {len(records)} records (no conflict spec)")
            
        except Exception as simple_upsert_error:
            print(f"    Simple upsert failed: {simple_upsert_error}")
            print(f"    Trying insert with ignore conflicts...")
            
            try:
                # Method 3: Try regular insert (will fail on duplicates but continue)
                supabase.table(table_name).insert(records).execute()
                print(f"    Successfully inserted {len(records)} records")
                
            except Exception as insert_error:
                print(f"    Insert failed: {insert_error}")
                print(f"    Trying individual record processing...")
                
                # Method 4: Process records individually
                successful_inserts = 0
                for record in records:
                    try:
                        supabase.table(table_name).insert(record).execute()
                        successful_inserts += 1
                    except Exception:
                        # Skip duplicates silently
                        continue
                        
                print(f"    Successfully processed {successful_inserts}/{len(records)} records individually")


def main():
    # Add pandas import for data handling
    import pandas as pd
    globals()['pd'] = pd
    
    all_records = []
    
    for pair, ticker in PAIRS.items():
        print(f"\nProcessing {pair}...")
        
        for interval, start in RANGES.items():
            print(f"Fetching {pair} ({interval}) from {start.date()} to {NOW.date()}")
            records = fetch_and_format(ticker, pair, interval, start)
            
            if records:
                all_records.extend(records)
                
                # Upload in chunks of 500 (Supabase API limit)
                print(f"  Uploading {len(records)} records in chunks...")
                for i in range(0, len(records), 500):
                    chunk = records[i:i+500]
                    print(f"    Uploading chunk {i//500 + 1} ({len(chunk)} records)")
                    upload_with_fallback(chunk, TABLE_NAME)
            else:
                print(f"  No records to upload for {pair} ({interval})")

    print(f"\n=== SUMMARY ===")
    print(f"Total records processed: {len(all_records)}")
    print("Upload completed!")


if __name__ == "__main__":
    main()