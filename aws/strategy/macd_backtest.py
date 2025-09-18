import sys
import pandas as pd
import numpy as np
from pathlib import Path
from ta.trend import MACD
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, time
import warnings
warnings.filterwarnings('ignore')

# --------------------------- PARAMETERS ---------------------------
INPUT_CSV = sys.argv[1] if len(sys.argv) > 1 else "data.csv"

DATE_COL = "Date"
TIME_COL_ONLY = "Time"
CLOSE_COL = "Close"
HIGH_COL = "High"
LOW_COL = "Low"

# MACD params
FAST = 12
SLOW = 26
SIGNAL = 9

# Trading windows
RANGE_START = "07:00:00"    # Start of range calculation period
RANGE_END = "08:30:00"      # End of range calculation period
WINDOW_START = "08:31:00"   # Start of trading window
WINDOW_END = "10:00:00"     # End of trading window

# EURUSD: pip = 0.0001 -> 5 pips = 0.0005
PIP = 0.0001
TP_PIPS = 5
SL_PIPS = 25
TP = TP_PIPS * PIP
SL = SL_PIPS * PIP

# How to handle unresolved trades: "exclude", "eod_as_loss", "eod_as_win"
RESOLVE_UNRESOLVED = "exclude"

# Plot settings
PLOT_ENABLED = True
SHOW_PLOT = True  # Set to False if running headless


# --------------------------- UTILITIES ---------------------------
def compute_macd(df, close_col=CLOSE_COL):
    """Compute MACD using ta library with error handling"""
    try:
        if len(df) < max(SLOW, FAST, SIGNAL):
            print(f"Warning: Not enough data for MACD calculation. Need at least {max(SLOW, FAST, SIGNAL)} rows, got {len(df)}")
            return df
        
        macd = MACD(
            close=df[close_col],
            window_slow=SLOW,
            window_fast=FAST,
            window_sign=SIGNAL
        )
        df = df.copy()
        df["macd"] = macd.macd()
        df["macd_signal"] = macd.macd_signal()
        df["macd_hist"] = macd.macd_diff()
        df["macd_diff"] = df["macd"] - df["macd_signal"]
        return df
    except Exception as e:
        print(f"Error computing MACD: {e}")
        return df


def get_daily_range(df_day, high_col, low_col):
    """Get the high and low for the range period (07:00 - 08:29)"""
    times = df_day["Time"].dt.time
    range_mask = (times >= pd.to_datetime(RANGE_START).time()) & (times <= pd.to_datetime(RANGE_END).time())
    range_df = df_day[range_mask].copy()
    
    if range_df.empty:
        return None, None
    
    range_high = range_df[high_col].max()
    range_low = range_df[low_col].min()
    
    return range_high, range_low


def find_breakout_entry(df_day, range_high, range_low, high_col, low_col, close_col):
    """Find breakout entry in the trading window (08:30 - 09:00)"""
    times = df_day["Time"].dt.time
    window_mask = (times >= pd.to_datetime(WINDOW_START).time()) & (times <= pd.to_datetime(WINDOW_END).time())
    window_df = df_day[window_mask].copy()
    
    if window_df.empty:
        return None
    
    # Look for breakouts in chronological order
    for idx, row in window_df.iterrows():
        high = row[high_col]
        low = row[low_col]
        close = row[close_col]
        
        # High breakout -> SHORT signal
        if high > range_high:
            return {
                'type': 'SHORT',
                'entry_time': row['Time'],
                'entry_price': close,  # Use close price for entry
                'breakout_level': range_high,
                'trigger': 'high_break'
            }
        
        # Low breakout -> LONG signal  
        if low < range_low:
            return {
                'type': 'LONG',
                'entry_time': row['Time'],
                'entry_price': close,  # Use close price for entry
                'breakout_level': range_low,
                'trigger': 'low_break'
            }
    
    return None


def plot_trades(df, results_df, out_file="trades_plot.png"):
    """Plot price + MACD with trades marked"""
    if df.empty or results_df.empty:
        print("No data to plot")
        return
    
    # Determine the close column name
    close_col = CLOSE_COL if CLOSE_COL in df.columns else next((c for c in df.columns if c.startswith(CLOSE_COL)), CLOSE_COL)
    high_col = HIGH_COL if HIGH_COL in df.columns else next((c for c in df.columns if c.startswith(HIGH_COL)), HIGH_COL)
    low_col = LOW_COL if LOW_COL in df.columns else next((c for c in df.columns if c.startswith(LOW_COL)), LOW_COL)
    
    try:
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 10))
        
        # Convert time to datetime for better plotting
        df_plot = df.copy()
        if 'Time' in df_plot.columns:
            df_plot['Time'] = pd.to_datetime(df_plot['Time'])
        
        # --- Price subplot ---
        ax1.plot(df_plot["Time"], df_plot[close_col], label="Close Price", color="black", linewidth=0.8)
        
        # Plot range levels and breakout points
        entry_long_plotted = False
        entry_short_plotted = False
        tp_plotted = False
        sl_plotted = False
        range_plotted = False
        
        # Group by date to show daily ranges
        df_plot['date_local'] = df_plot['Time'].dt.date
        
        for _, trade in results_df.iterrows():
            entry_time = pd.to_datetime(trade["entry_time"])
            trade_date = entry_time.date()
            
            # Get data for this day to show range
            day_data = df_plot[df_plot['date_local'] == trade_date]
            if not day_data.empty:
                # Show range period (07:00-08:29) as shaded area
                range_start_time = pd.to_datetime(f"{trade_date} {RANGE_START}")
                range_end_time = pd.to_datetime(f"{trade_date} {RANGE_END}")
                
                if not range_plotted:
                    ax1.axvspan(range_start_time, range_end_time, alpha=0.1, color='yellow', 
                               label='Range Period (07:00-08:29)')
                    range_plotted = True
                else:
                    ax1.axvspan(range_start_time, range_end_time, alpha=0.1, color='yellow')
                
                # Show range high/low levels
                #ax1.axhline(y=trade["range_high"], color="blue", linestyle=":", alpha=0.5)
                #ax1.axhline(y=trade["range_low"], color="red", linestyle=":", alpha=0.5)
            
            if trade["direction"] == "LONG":
                color = "green"
                marker = "^"
                if not entry_long_plotted:
                    label = "Long Entry (Low Break)"
                    entry_long_plotted = True
                else:
                    label = None
            else:
                color = "red"
                marker = "v"
                if not entry_short_plotted:
                    label = "Short Entry (High Break)"
                    entry_short_plotted = True
                else:
                    label = None
            
            # Entry point
            ax1.scatter(entry_time, trade["entry_price"], color=color, marker=marker, 
                       s=100, label=label, zorder=5)
            
            # TP and SL levels (horizontal lines for reference)
            #ax1.axhline(y=trade["tp_price"], color="blue", linestyle="--", alpha=0.3)
            #ax1.axhline(y=trade["sl_price"], color="red", linestyle="--", alpha=0.3)
            
            # Mark resolution if available
            if trade["resolution"] == "tp":
                if not tp_plotted:
                    ax1.scatter(entry_time, trade["tp_price"], color="blue", marker="*", 
                               s=150, label="Take Profit Hit", zorder=5)
                    tp_plotted = True
                else:
                    ax1.scatter(entry_time, trade["tp_price"], color="blue", marker="*", 
                               s=150, zorder=5)
            elif trade["resolution"] == "sl":
                if not sl_plotted:
                    ax1.scatter(entry_time, trade["sl_price"], color="orange", marker="x", 
                               s=150, label="Stop Loss Hit", zorder=5)
                    sl_plotted = True
                else:
                    ax1.scatter(entry_time, trade["sl_price"], color="orange", marker="x", 
                               s=150, zorder=5)
        
        ax1.set_title(f"Breakout Strategy: Range {RANGE_START}-{RANGE_END}, Trade {WINDOW_START}-{WINDOW_END}", fontsize=14)
        ax1.set_ylabel("Price")
        ax1.legend(loc="upper left")
        ax1.grid(True, alpha=0.3)
        ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
        plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45)
        
        # --- MACD subplot (kept for reference) ---
        ax2.plot(df_plot["Time"], df_plot["macd"], label="MACD", color="blue", linewidth=1)
        ax2.plot(df_plot["Time"], df_plot["macd_signal"], label="Signal", color="orange", linewidth=1)
        ax2.bar(df_plot["Time"], df_plot["macd_hist"], label="Histogram", color="grey", alpha=0.4, width=0.0001)
        ax2.axhline(y=0, color="black", linestyle="-", alpha=0.3)
        
        # Mark breakout points on MACD
        for _, trade in results_df.iterrows():
            entry_time = pd.to_datetime(trade["entry_time"])
            color = "green" if trade["direction"] == "LONG" else "red"
            ax2.axvline(x=entry_time, color=color, linestyle="--", alpha=0.7, linewidth=2)
        
        ax2.set_title("MACD Indicator with Breakout Points", fontsize=14)
        ax2.set_xlabel("Time")
        ax2.set_ylabel("MACD Value")
        ax2.legend(loc="upper left")
        ax2.grid(True, alpha=0.3)
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45)
        
        plt.tight_layout()
        plt.savefig(out_file, dpi=150, bbox_inches='tight')
        print(f"✓ Plot saved to {out_file}")
        
        if SHOW_PLOT:
            plt.show()
        else:
            plt.close()
            
    except Exception as e:
        print(f"Error creating plot: {e}")
        plt.close()


def validate_data(df):
    """Validate the input data"""
    required_cols = [DATE_COL, TIME_COL_ONLY, CLOSE_COL, HIGH_COL, LOW_COL]
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"Error: Missing required columns: {missing_cols}")
        print(f"Available columns: {list(df.columns)}")
        return False
    
    if df.empty:
        print("Error: Input data is empty")
        return False
    
    return True


# --------------------------- MAIN ---------------------------
def run_backtest(input_csv):
    """Main backtesting function"""
    print(f"Starting backtest with file: {input_csv}")
    
    # Load and validate data
    try:
        df = pd.read_csv(input_csv)
        print(f"✓ Loaded {len(df)} rows from {input_csv}")
        print(f"Columns: {list(df.columns)}")
        
        # Handle duplicate column names
        df.columns = [f"{col}_{i}" if list(df.columns).count(col) > 1 else col 
                     for i, col in enumerate(df.columns)]
        
        # Check for duplicate column names after fixing
        if len(df.columns) != len(set(df.columns)):
            print("Warning: Still have duplicate columns after fixing")
            
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return None, None
    
    # Update column references if they were renamed
    original_cols = [DATE_COL, TIME_COL_ONLY, CLOSE_COL, HIGH_COL, LOW_COL]
    available_cols = list(df.columns)
    
    # Find the correct column names (in case of duplicates)
    date_col = DATE_COL if DATE_COL in available_cols else next((c for c in available_cols if c.startswith(DATE_COL)), None)
    time_col = TIME_COL_ONLY if TIME_COL_ONLY in available_cols else next((c for c in available_cols if c.startswith(TIME_COL_ONLY)), None)
    close_col = CLOSE_COL if CLOSE_COL in available_cols else next((c for c in available_cols if c.startswith(CLOSE_COL)), None)
    high_col = HIGH_COL if HIGH_COL in available_cols else next((c for c in available_cols if c.startswith(HIGH_COL)), None)
    low_col = LOW_COL if LOW_COL in available_cols else next((c for c in available_cols if c.startswith(LOW_COL)), None)
    
    # Validate we found all required columns
    if None in [date_col, time_col, close_col, high_col, low_col]:
        print(f"Error: Could not find all required columns")
        print(f"Looking for: {original_cols}")
        print(f"Found: Date={date_col}, Time={time_col}, Close={close_col}, High={high_col}, Low={low_col}")
        return None, None
    
    print(f"Using columns: Date={date_col}, Time={time_col}, Close={close_col}, High={high_col}, Low={low_col}")
    
    # Combine Date + Time -> single datetime
    print("Processing datetime columns...")
    try:
        df["DateTime"] = pd.to_datetime(
            df[date_col].astype(str) + " " + df[time_col].astype(str),
            errors="coerce"
        )
        
        # Remove rows with invalid dates
        initial_len = len(df)
        df = df.dropna(subset=["DateTime"]).copy()
        if len(df) < initial_len:
            print(f"Warning: Removed {initial_len - len(df)} rows with invalid datetime")
        
        # Filter to 2024-2025 only
        print("Filtering data to 2024-2025...")
        df = df[df["DateTime"].dt.year.isin([2024, 2025])].copy()
        print(f"✓ Filtered to 2024-2025: {len(df)} rows remaining")
        
        # Drop the original time column and rename DateTime
        if time_col in df.columns:
            df = df.drop(columns=[time_col])
        df = df.rename(columns={"DateTime": "Time"})
        df = df.sort_values("Time").reset_index(drop=True)
        print(f"✓ Processed datetime, {len(df)} valid rows remaining")
        
    except Exception as e:
        print(f"Error processing datetime: {e}")
        import traceback
        traceback.print_exc()
        return None, None
    
    # Compute MACD
    print("Computing MACD indicators...")
    df = compute_macd(df, close_col)
    
    if "macd_diff" not in df.columns:
        print("Error: MACD calculation failed")
        return None, None
    
    # Remove rows with NaN MACD values
    df = df.dropna(subset=["macd_diff"])
    print(f"✓ MACD computed, {len(df)} rows with valid MACD data")
    
    # Group by date and find trades
    print(f"Scanning for breakout trades...")
    print(f"Range calculation: {RANGE_START} - {RANGE_END}")
    print(f"Trading window: {WINDOW_START} - {WINDOW_END}")
    
    df["date_local"] = df["Time"].dt.date
    results = []
    
    for date, group in df.groupby("date_local"):
        # Get daily range (07:00 - 08:29)
        range_high, range_low = get_daily_range(group, high_col, low_col)
        
        if range_high is None or range_low is None:
            continue  # No range data for this day
        
        # Look for breakout in trading window (08:30 - 09:00)
        breakout = find_breakout_entry(group, range_high, range_low, high_col, low_col, close_col)
        
        if breakout is None:
            continue  # No breakout found
        
        # Set up trade parameters
        direction = breakout['type']
        entry_time = breakout['entry_time']
        entry_price = breakout['entry_price']
        
        if direction == "LONG":
            tp_price = entry_price + TP
            sl_price = entry_price - SL
        else:  # SHORT
            tp_price = entry_price - TP
            sl_price = entry_price + SL
        
        # Scan forward for TP/SL resolution
        resolution = "unresolved"
        exit_time = None
        exit_price = None
        
        # Look at all future data points after entry
        future_data = df[df["Time"] > entry_time].copy()
        
        for idx, future_row in future_data.iterrows():
            high = future_row[high_col]
            low = future_row[low_col]
            
            if direction == "LONG":
                if high >= tp_price:
                    resolution = "tp"
                    exit_time = future_row["Time"]
                    exit_price = tp_price
                    break
                elif low <= sl_price:
                    resolution = "sl"
                    exit_time = future_row["Time"]
                    exit_price = sl_price
                    break
            else:  # SHORT
                if low <= tp_price:
                    resolution = "tp"
                    exit_time = future_row["Time"]
                    exit_price = tp_price
                    break
                elif high >= sl_price:
                    resolution = "sl"
                    exit_time = future_row["Time"]
                    exit_price = sl_price
                    break
        
        # Handle unresolved trades
        if resolution == "unresolved" and RESOLVE_UNRESOLVED == "eod_as_loss":
            resolution = "sl"
        elif resolution == "unresolved" and RESOLVE_UNRESOLVED == "eod_as_win":
            resolution = "tp"
        
        # Calculate P&L
        if resolution == "tp":
            win, pips = True, TP_PIPS
        elif resolution == "sl":
            win, pips = False, -SL_PIPS
        else:
            win, pips = None, None  # Unresolved
        
        results.append({
            "date": date,
            "range_high": range_high,
            "range_low": range_low,
            "entry_time": entry_time,
            "entry_price": entry_price,
            "direction": direction,
            "breakout_level": breakout['breakout_level'],
            "trigger": breakout['trigger'],
            "tp_price": tp_price,
            "sl_price": sl_price,
            "exit_time": exit_time,
            "exit_price": exit_price,
            "resolution": resolution,
            "win": win,
            "pips": pips
        })
    
    # Create results DataFrame
    results_df = pd.DataFrame(results)
    
    if results_df.empty:
        print("No trades found in the specified time window")
        return results_df, df
    
    # Calculate statistics
    total_trades = len(results_df)
    resolved = results_df[results_df["win"].notnull()]
    wins = len(resolved[resolved["win"] == True])
    losses = len(resolved[resolved["win"] == False])
    unresolved = len(results_df[results_df["win"].isnull()])
    
    print("\n" + "="*60)
    print("BREAKOUT STRATEGY BACKTEST RESULTS")
    print("="*60)
    print(f"Range Period: {RANGE_START} - {RANGE_END}")
    print(f"Trading Window: {WINDOW_START} - {WINDOW_END}")
    print(f"Strategy: High break = SHORT, Low break = LONG")
    print(f"TP: {TP_PIPS} pips, SL: {SL_PIPS} pips")
    print("-" * 60)
    print(f"Total trades found: {total_trades}")
    print(f"Resolved trades: {len(resolved)}")
    print(f"Wins: {wins}")
    print(f"Losses: {losses}")
    print(f"Unresolved: {unresolved}")
    
    if len(resolved) > 0:
        win_rate = wins / len(resolved) * 100
        print(f"Win rate: {win_rate:.2f}%")
        
        total_pips = resolved["pips"].sum()
        print(f"Total pips: {total_pips:+.1f}")
        print(f"Average pips per trade: {total_pips/len(resolved):+.2f}")
        
        # Show breakdown by trigger type
        if not results_df.empty:
            long_trades = results_df[results_df["direction"] == "LONG"]
            short_trades = results_df[results_df["direction"] == "SHORT"]
            print(f"Long trades (low breaks): {len(long_trades)}")
            print(f"Short trades (high breaks): {len(short_trades)}")
    
    print("="*60)
    
    # Save results
    out_csv = Path(input_csv).with_name(Path(input_csv).stem + "_trade_log.csv")
    results_df.to_csv(out_csv, index=False)
    print(f"✓ Trade log saved to: {out_csv}")
    
    # Create plot
    if PLOT_ENABLED and not results_df.empty:
        plot_trades(df, results_df)
    
    return results_df, df


if __name__ == "__main__":
    try:
        results_df, df = run_backtest(INPUT_CSV)
        if results_df is not None:
            print("\n✓ Backtest completed successfully!")
        else:
            print("\n✗ Backtest failed")
    except KeyboardInterrupt:
        print("\nBacktest interrupted by user")
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()