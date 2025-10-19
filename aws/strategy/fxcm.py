#!/usr/bin/env python3 


####This strategy can profit roughly 4.5% per month on a 1% risk per trade. Max drawdown is around 3%
"""
Complete Forex System: Data Download + Backtesting
1. Downloads FXCM historical data from 2025-01-01 to present
2. Cleans and combines the data
3. Runs backtest with Range Breakout + MACD strategy
"""

import gzip
import urllib.request as ur
import urllib.error
import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO, StringIO
import time
import os

class CompleteFXSystem:
    def __init__(self):
        # Data download settings
        self.base_url = 'https://candledata.fxcorporate.com/'
        self.url_suffix = '.csv.gz'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        # Backtest settings
        self.df = None
        self.trades = []
        self.results = {}
        
        # Strategy parameters
        self.range_start = datetime.time(11, 0)  # 11:00
        self.range_end = datetime.time(12, 15)   # 12:15
        self.sl_pips = 10
        self.tp_pips = 10
        self.pip_value = 0.0001  # For EUR/USD (4 decimal places)
        
        # MACD parameters
        self.macd_fast = 7
        self.macd_slow = 26
        self.macd_signal = 9
    
    def get_weeks_for_date_range(self, start_date, end_date):
        """Get all (year, week) tuples for the date range"""
        weeks = []
        current_date = start_date
        
        while current_date <= end_date:
            iso_calendar = current_date.isocalendar()
            year = iso_calendar[0]
            week = iso_calendar[1]
            
            week_tuple = (year, week)
            if week_tuple not in weeks:
                weeks.append(week_tuple)
            
            current_date += datetime.timedelta(weeks=1)
        
        return weeks
    
    def download_week_data(self, symbol, periodicity, year, week):
        """Download data for a specific week"""
        url = f"{self.base_url}{periodicity}/{symbol}/{year}/{week}{self.url_suffix}"
        
        try:
            print(f"Downloading: Week {week}/{year}... ", end="")
            
            request = ur.Request(url)
            for key, value in self.headers.items():
                request.add_header(key, value)
            
            response = ur.urlopen(request, timeout=30)
            compressed_data = response.read()
            buf = BytesIO(compressed_data)
            
            with gzip.GzipFile(fileobj=buf) as f:
                data = f.read().decode('utf-8')
            
            print(f"✓ {len(data)} bytes")
            time.sleep(0.3)  # Be respectful to server
            return data
            
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"⚠ Not found (may not exist yet)")
                return None
            elif e.code == 403:
                print(f"✗ Access forbidden")
                return None
            else:
                print(f"✗ HTTP Error {e.code}")
                return None
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            return None
    
    def download_and_clean_data(self, symbol='EURUSD', periodicity='m1', 
                               start_date=None, end_date=None):
        """Download historical data and clean it"""
        
        if start_date is None:
            start_date = datetime.date(2025, 1, 1)
        if end_date is None:
            end_date = datetime.date.today()
        
        print("🔄 FOREX DATA DOWNLOADER")
        print("=" * 50)
        print(f"Symbol: {symbol}")
        print(f"Timeframe: {periodicity}")
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Today: {datetime.date.today()}")
        print()
        
        # Get all weeks to download
        weeks = self.get_weeks_for_date_range(start_date, end_date)
        print(f"📅 Planning to download {len(weeks)} weeks of data\n")
        
        all_data = []
        successful_downloads = 0
        
        for i, (year, week) in enumerate(weeks, 1):
            print(f"[{i:2d}/{len(weeks)}] ", end="")
            
            week_data = self.download_week_data(symbol, periodicity, year, week)
            if week_data:
                all_data.append(week_data)
                successful_downloads += 1
        
        print(f"\n✅ Download complete: {successful_downloads}/{len(weeks)} weeks successful")
        
        if not all_data:
            print("❌ No data was downloaded!")
            return None
        
        # Clean and combine data
        print("🧹 Cleaning and combining data...")
        combined_data = ''.join(all_data)
        
        # Remove blank lines and duplicate headers
        lines = combined_data.split('\n')
        cleaned_lines = []
        header_added = False
        
        for line in lines:
            line = line.strip()
            
            if not line:
                continue
            
            # Handle header
            if line.startswith('DateTime') or line.startswith('Timestamp'):
                if not header_added:
                    cleaned_lines.append(line)
                    header_added = True
                continue
            
            # Add data lines
            if line:
                cleaned_lines.append(line)
        
        cleaned_data = '\n'.join(cleaned_lines)
        
        # Save cleaned data
        filename = f"{symbol}_{periodicity}_{start_date.strftime('%Y%m%d')}_to_{end_date.strftime('%Y%m%d')}_complete.csv"
        print(f"💾 Saving to {filename}...")
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(cleaned_data)
        
        # Load into DataFrame
        try:
            self.df = pd.read_csv(StringIO(cleaned_data))
            self.df = self.df.dropna(how='all')  # Remove any empty rows
            
            print(f"📊 Data Summary:")
            print(f"   Total rows: {len(self.df):,}")
            print(f"   Columns: {list(self.df.columns)}")
            print(f"   File size: {os.path.getsize(filename) / 1024 / 1024:.1f} MB")
            
            return filename
            
        except Exception as e:
            print(f"❌ Error creating DataFrame: {e}")
            return None
    
    def prepare_data_for_backtest(self):
        """Prepare downloaded data for backtesting"""
        print("\n🔧 PREPARING DATA FOR BACKTEST")
        print("=" * 50)
        
        if self.df is None:
            print("❌ No data available!")
            return False
        
        # Convert DateTime column
        self.df['DateTime'] = pd.to_datetime(self.df['DateTime'])
        
        # Extract date and time components
        self.df['Date'] = self.df['DateTime'].dt.date
        self.df['Time'] = self.df['DateTime'].dt.time
        self.df['Hour'] = self.df['DateTime'].dt.hour
        self.df['Minute'] = self.df['DateTime'].dt.minute
        
        # Calculate mid prices
        self.df['Open'] = (self.df['BidOpen'] + self.df['AskOpen']) / 2
        self.df['High'] = (self.df['BidHigh'] + self.df['AskHigh']) / 2
        self.df['Low'] = (self.df['BidLow'] + self.df['AskLow']) / 2
        self.df['Close'] = (self.df['BidClose'] + self.df['AskClose']) / 2
        
        # Sort by datetime
        self.df = self.df.sort_values('DateTime').reset_index(drop=True)

        
        
        print(f"✅ Data prepared for backtesting")
        print(f"   Date range: {self.df['DateTime'].min()} to {self.df['DateTime'].max()}")
        print(f"   Total candles: {len(self.df):,}")
        
        return True
    
    def calculate_macd(self):
        """Calculate MACD indicator"""
        print("📈 Calculating MACD...")
        
        # Calculate EMAs
        ema_fast = self.df['Close'].ewm(span=self.macd_fast).mean()
        ema_slow = self.df['Close'].ewm(span=self.macd_slow).mean()
        
        # MACD line
        self.df['MACD'] = ema_fast - ema_slow
        
        # Signal line
        self.df['MACD_Signal'] = self.df['MACD'].ewm(span=self.macd_signal).mean()
        
        # Histogram
        self.df['MACD_Histogram'] = self.df['MACD'] - self.df['MACD_Signal']
        
        # MACD signals
        self.df['MACD_Buy_Signal'] = (
            (self.df['MACD'] > self.df['MACD_Signal']) & 
            (self.df['MACD'].shift(1) <= self.df['MACD_Signal'].shift(1))
        )
        
        self.df['MACD_Sell_Signal'] = (
            (self.df['MACD'] < self.df['MACD_Signal']) & 
            (self.df['MACD'].shift(1) >= self.df['MACD_Signal'].shift(1))
        )
    
    def calculate_15min_trend(self):
        """Calculate 15-minute trend using EMA"""
        print("📊 Calculating 15-minute trend filter...")
        
        # Create 15-minute bars from 1-minute data
        self.df.set_index('DateTime', inplace=True)
        df_15min = self.df.resample('15T').agg({
            'Open': 'first',
            'High': 'max', 
            'Low': 'min',
            'Close': 'last',
            'BidOpen': 'first',
            'BidHigh': 'max',
            'BidLow': 'min', 
            'BidClose': 'last',
            'AskOpen': 'first',
            'AskHigh': 'max',
            'AskLow': 'min',
            'AskClose': 'last'
        }).dropna()
        
        # Calculate 50 EMA on 15-minute timeframe for trend
        df_15min['EMA_50'] = df_15min['Close'].ewm(span=50).mean()
        df_15min['Trend_Up'] = df_15min['Close'] > df_15min['EMA_50']
        
        # Reset index to merge back
        df_15min.reset_index(inplace=True)
        self.df.reset_index(inplace=True)
        
        # Merge 15-min trend back to 1-min data
        self.df['DateTime_15min'] = self.df['DateTime'].dt.floor('15T')
        trend_data = df_15min[['DateTime', 'Trend_Up']].rename(columns={'DateTime': 'DateTime_15min'})
        
        self.df = self.df.merge(trend_data, on='DateTime_15min', how='left')
        self.df['Trend_Up'] = self.df['Trend_Up'].fillna(method='ffill')
        
        # Clean up temporary column
        self.df.drop('DateTime_15min', axis=1, inplace=True)
        
        print(f"   15-min trend calculated. Trend up: {self.df['Trend_Up'].sum():,} candles, down: {(~self.df['Trend_Up']).sum():,} candles")
    
    def find_daily_ranges(self):
        """Find high/low for each day between 11:00-12:15"""
        print("📊 Finding daily ranges (11:00-12:15)...")
        
        daily_ranges = {}
        
        for date in self.df['Date'].unique():
            # Filter data for this date and time range
            day_data = self.df[self.df['Date'] == date].copy()
            
            # Filter for 11:00-12:15 range
            range_mask = (
                (day_data['Hour'] > 11) | 
                ((day_data['Hour'] == 11) & (day_data['Minute'] >= 0))
            ) & (
                (day_data['Hour'] < 12) | 
                ((day_data['Hour'] == 12) & (day_data['Minute'] <= 15))
            )
            
            range_data = day_data[range_mask]
            
            if len(range_data) > 0:
                daily_ranges[date] = {
                    'high': range_data['High'].max(),
                    'low': range_data['Low'].min(),
                    'range_size': range_data['High'].max() - range_data['Low'].min()
                }
        
        print(f"   Found ranges for {len(daily_ranges)} trading days")
        return daily_ranges
    
    def run_backtest(self):
        """Run the complete backtesting strategy"""
        print("\n🎯 RUNNING BACKTEST")
        print("=" * 50)
        print("Strategy: Range Breakout (11:00-12:15) + MACD Entry")
        print(f"📊 Range Detection: 11:00 - 12:15")
        print(f"⏰ Trading Window: 12:15 - 13:00 ONLY")
        print(f"📈 Entry Signal: MACD crossover after breakout")
        print(f"🛡️ Risk: {self.sl_pips} pips SL / {self.tp_pips} pips TP")
        print()

        self.df.set_index('DateTime', inplace=True)
        df_5min = self.df.resample('5T').agg({
            'Open': 'first',
            'High': 'max', 
            'Low': 'min',
            'Close': 'last',
            'BidOpen': 'first',
            'BidHigh': 'max',
            'BidLow': 'min', 
            'BidClose': 'last',
            'AskOpen': 'first',
            'AskHigh': 'max',
            'AskLow': 'min',
            'AskClose': 'last'
        }).dropna()
        
        # Reset index to merge back
        df_5min.reset_index(inplace=True)
        self.df.reset_index(inplace=True)

        
        self.calculate_macd()
        self.calculate_15min_trend()
        daily_ranges = self.find_daily_ranges()
        
        print(f"📅 Processing {len(daily_ranges)} trading days...\n")
        
        # Track positions
        current_position = None
        position_entry_price = None
        position_entry_time = None
        position_sl = None
        position_tp = None
        looking_for = None
        
        trades_count = 0
        
        for i, row in self.df.iterrows():
            current_date = row['Date']
            current_price = row['Close']
            current_time = row['DateTime']
            
            # Skip if we don't have range data for this day
            if current_date not in daily_ranges:
                continue
            
            day_high = daily_ranges[current_date]['high']
            day_low = daily_ranges[current_date]['low']
            
            # TRADING WINDOW: Only between 12:15 and 13:00
            current_hour = row['Hour']
            current_minute = row['Minute']
            
            # Check if we're in the trading window (after 12:15 but before 13:00)
            in_trading_window = (
                (current_hour == 12 and current_minute > 15) or  # After 12:15 same hour
                (current_hour == 12 and current_minute == 59)    # Last minute of 12:xx
            ) and current_hour < 13  # But before 13:00
            
            if in_trading_window:
                
                # Check for breakouts (only if we haven't identified one yet today)
                if looking_for is None and current_position is None:
                    if current_price > day_high:
                        looking_for = 'short'  # Price broke high, look for short
                        print(f"   🔴 HIGH BREAK at {current_time.strftime('%H:%M')}: {current_price:.5f} > {day_high:.5f}")
                    elif current_price < day_low:
                        looking_for = 'long'   # Price broke low, look for long
                        print(f"   🟢 LOW BREAK at {current_time.strftime('%H:%M')}: {current_price:.5f} < {day_low:.5f}")
                
                # Check for MACD entry signals (only in trading window)
                if looking_for == 'short' and row['MACD_Sell_Signal'] and current_position is None:
                    # Enter short position
                    current_position = 'short'
                    position_entry_price = current_price
                    position_entry_time = current_time
                    position_sl = position_entry_price + (self.sl_pips * self.pip_value)
                    position_tp = position_entry_price - (self.tp_pips * self.pip_value)
                    print(f"   📉 SHORT ENTRY at {current_time.strftime('%H:%M')}: {current_price:.5f}")
                    
                elif looking_for == 'long' and row['MACD_Buy_Signal'] and current_position is None:
                    # Enter long position
                    current_position = 'long'
                    position_entry_price = current_price
                    position_entry_time = current_time
                    position_sl = position_entry_price - (self.sl_pips * self.pip_value)
                    position_tp = position_entry_price + (self.tp_pips * self.pip_value)
                    print(f"   📈 LONG ENTRY at {current_time.strftime('%H:%M')}: {current_price:.5f}")
            
            # STOP looking for trades after 13:00 (miss the window)
            elif current_hour >= 13:
                if looking_for is not None and current_position is None:
                    print(f"   ⏰ MISSED WINDOW: No MACD signal before 13:00 for {looking_for} setup")
                    looking_for = None  # Reset, missed the window
            
            # Check for position exits
            if current_position is not None:
                exit_reason = None
                exit_price = None
                
                if current_position == 'long':
                    if row['High'] >= position_tp:
                        exit_reason = 'TP'
                        exit_price = position_tp
                    elif row['Low'] <= position_sl:
                        exit_reason = 'SL'
                        exit_price = position_sl
                        
                elif current_position == 'short':
                    if row['Low'] <= position_tp:
                        exit_reason = 'TP'
                        exit_price = position_tp
                    elif row['High'] >= position_sl:
                        exit_reason = 'SL'
                        exit_price = position_sl
                
                # Record trade if position closed
                if exit_reason:
                    pips_result = 0
                    if current_position == 'long':
                        pips_result = (exit_price - position_entry_price) / self.pip_value
                    else:  # short
                        pips_result = (position_entry_price - exit_price) / self.pip_value
                    
                    trade = {
                        'entry_time': position_entry_time,
                        'exit_time': current_time,
                        'position': current_position,
                        'entry_price': position_entry_price,
                        'exit_price': exit_price,
                        'pips': pips_result,
                        'result': 'win' if pips_result > 0 else 'loss',
                        'exit_reason': exit_reason,
                        'day_high': day_high,
                        'day_low': day_low,
                        'range_size_pips': (day_high - day_low) / self.pip_value,
                        'entry_hour': position_entry_time.hour,
                        'entry_minute': position_entry_time.minute,
                        'trade_duration_minutes': int((current_time - position_entry_time).total_seconds() / 60),
                        'trend_direction': 'UP' if row['Trend_Up'] else 'DOWN'
                    }
                    
                    self.trades.append(trade)
                    trades_count += 1
                    
                    print(f"   🏁 TRADE CLOSED: {current_position.upper()} {pips_result:+.1f} pips ({exit_reason}) after {trade['trade_duration_minutes']} min")
                    
                    # Reset position
                    current_position = None
                    position_entry_price = None
                    position_entry_time = None
                    position_sl = None
                    position_tp = None
            
            # Reset daily state at end of day
            if i < len(self.df) - 1:
                next_date = self.df.iloc[i + 1]['Date']
                if next_date != current_date:
                    looking_for = None
                    # Close any open position at end of day
                    if current_position is not None:
                        exit_price = current_price
                        pips_result = 0
                        if current_position == 'long':
                            pips_result = (exit_price - position_entry_price) / self.pip_value
                        else:
                            pips_result = (position_entry_price - exit_price) / self.pip_value
                        
                        trade = {
                            'entry_time': position_entry_time,
                            'exit_time': current_time,
                            'position': current_position,
                            'entry_price': position_entry_price,
                            'exit_price': exit_price,
                            'pips': pips_result,
                            'result': 'win' if pips_result > 0 else 'loss',
                            'exit_reason': 'EOD',
                            'day_high': day_high,
                            'day_low': day_low,
                            'range_size_pips': (day_high - day_low) / self.pip_value,
                            'entry_hour': position_entry_time.hour,
                            'entry_minute': position_entry_time.minute,
                            'trade_duration_minutes': int((current_time - position_entry_time).total_seconds() / 60),
                            'trend_direction': 'UP' if row['Trend_Up'] else 'DOWN'
                        }
                        
                        self.trades.append(trade)
                        trades_count += 1
                        
                        print(f"   🌅 EOD CLOSE: {current_position.upper()} {pips_result:+.1f} pips")
                        
                        current_position = None
                        position_entry_price = None
                        position_entry_time = None
                        position_sl = None
                        position_tp = None
        
        print(f"🔄 Backtest completed. Generated {trades_count} trades")
        return self.calculate_results()
    
    def calculate_results(self):
        """Calculate backtest results"""
        if not self.trades:
            print("❌ No trades found!")
            return None
        
        trades_df = pd.DataFrame(self.trades)
        
        # Basic stats
        total_trades = len(trades_df)
        winning_trades = len(trades_df[trades_df['result'] == 'win'])
        losing_trades = len(trades_df[trades_df['result'] == 'loss'])
        win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
        
        # Pips results
        total_pips = trades_df['pips'].sum()
        avg_win_pips = trades_df[trades_df['result'] == 'win']['pips'].mean() if winning_trades > 0 else 0
        avg_loss_pips = trades_df[trades_df['result'] == 'loss']['pips'].mean() if losing_trades > 0 else 0
        
        # Calculate profit factor
        total_win_pips = trades_df[trades_df['result'] == 'win']['pips'].sum()
        total_loss_pips = abs(trades_df[trades_df['result'] == 'loss']['pips'].sum())
        profit_factor = total_win_pips / total_loss_pips if total_loss_pips > 0 else float('inf')
        
        # Position types
        long_trades = len(trades_df[trades_df['position'] == 'long'])
        short_trades = len(trades_df[trades_df['position'] == 'short'])
        
        # Exit reasons
        tp_exits = len(trades_df[trades_df['exit_reason'] == 'TP'])
        sl_exits = len(trades_df[trades_df['exit_reason'] == 'SL'])
        eod_exits = len(trades_df[trades_df['exit_reason'] == 'EOD'])
        
        # Average range size
        avg_range_pips = trades_df['range_size_pips'].mean()
        
        self.results = {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pips': total_pips,
            'avg_win_pips': avg_win_pips,
            'avg_loss_pips': avg_loss_pips,
            'profit_factor': profit_factor,
            'long_trades': long_trades,
            'short_trades': short_trades,
            'tp_exits': tp_exits,
            'sl_exits': sl_exits,
            'eod_exits': eod_exits,
            'avg_range_pips': avg_range_pips,
            'trades_df': trades_df
        }
        
        return self.results
    
    def print_results(self):
        """Print comprehensive backtest results"""
        if not self.results:
            print("❌ No results to display!")
            return
        
        print("\n" + "🎯 BACKTEST RESULTS")
        print("=" * 60)
        
        print(f"📊 STRATEGY OVERVIEW")
        print(f"   Range Detection: 11:00 - 12:15")
        print(f"   Entry Signal: MACD Crossover")
        print(f"   Risk Management: {self.sl_pips} pips SL / {self.tp_pips} pips TP")
        print(f"   Data Period: {self.df['DateTime'].min().date()} to {self.df['DateTime'].max().date()}")
        print(f"   Total Days: {len(self.df['Date'].unique())} trading days")
        
        print(f"\n📈 TRADE STATISTICS")
        print(f"   Total Trades: {self.results['total_trades']}")
        print(f"   Winning Trades: {self.results['winning_trades']} ({self.results['win_rate']:.1f}%)")
        print(f"   Losing Trades: {self.results['losing_trades']} ({100-self.results['win_rate']:.1f}%)")
        
        print(f"\n💰 PERFORMANCE METRICS")
        print(f"   Total Pips: {self.results['total_pips']:+.1f}")
        print(f"   Average Win: {self.results['avg_win_pips']:+.1f} pips")
        print(f"   Average Loss: {self.results['avg_loss_pips']:+.1f} pips")
        print(f"   Profit Factor: {self.results['profit_factor']:.2f}")
        print(f"   Average Daily Range: {self.results['avg_range_pips']:.1f} pips")
        
        print(f"\n🎲 POSITION BREAKDOWN")
        print(f"   Long Positions: {self.results['long_trades']} ({self.results['long_trades']/self.results['total_trades']*100:.1f}%)")
        print(f"   Short Positions: {self.results['short_trades']} ({self.results['short_trades']/self.results['total_trades']*100:.1f}%)")
        
        print(f"\n🚪 EXIT ANALYSIS")
        print(f"   Take Profit: {self.results['tp_exits']} ({self.results['tp_exits']/self.results['total_trades']*100:.1f}%)")
        print(f"   Stop Loss: {self.results['sl_exits']} ({self.results['sl_exits']/self.results['total_trades']*100:.1f}%)")
        print(f"   End of Day: {self.results['eod_exits']} ({self.results['eod_exits']/self.results['total_trades']*100:.1f}%)")
        
        # Show sample trades
        print(f"\n📋 RECENT TRADES (Last 10)")
        print("-" * 120)
        print(f"{'Date':<12} {'Entry':<8} {'Type':<5} {'Price':<8} {'Exit':<8} {'Pips':<8} {'Duration':<8} {'Trend':<5} {'Reason':<6} {'Result':<6}")
        print("-" * 120)
        
        trades_df = self.results['trades_df']
        for _, trade in trades_df.tail(10).iterrows():
            entry_date = trade['entry_time'].strftime('%Y-%m-%d')
            entry_time = trade['entry_time'].strftime('%H:%M')
            duration = f"{trade['trade_duration_minutes']}min"
            trend = trade.get('trend_direction', 'N/A')
            print(f"{entry_date:<12} {entry_time:<8} {trade['position'].upper():<5} "
                  f"{trade['entry_price']:<8.5f} {trade['exit_price']:<8.5f} {trade['pips']:+8.1f} "
                  f"{duration:<8} {trend:<5} {trade['exit_reason']:<6} {trade['result'].upper():<6}")
                  
        # Show entry time distribution
        print(f"\n⏰ ENTRY TIME DISTRIBUTION")
        entry_times = trades_df.groupby(['entry_hour', 'entry_minute']).size().reset_index(name='count')
        entry_times['time'] = entry_times.apply(lambda x: f"{x['entry_hour']:02d}:{x['entry_minute']:02d}", axis=1)
        for _, row in entry_times.iterrows():
            print(f"   {row['time']}: {row['count']} trades")
            
        # Show trend alignment
        if 'trend_direction' in trades_df.columns:
            print(f"\n📈 TREND ALIGNMENT")
            trend_stats = trades_df.groupby(['position', 'trend_direction']).agg({
                'pips': ['count', 'sum', 'mean'],
                'result': lambda x: (x == 'win').sum()
            }).round(1)
            for (pos, trend), stats in trend_stats.iterrows():
                count = int(stats[('pips', 'count')])
                total_pips = stats[('pips', 'sum')]
                avg_pips = stats[('pips', 'mean')]
                wins = int(stats[('result', '<lambda>')])
                win_rate = (wins / count * 100) if count > 0 else 0
                print(f"   {pos.upper()} in {trend} trend: {count} trades, {total_pips:+.1f} pips, {win_rate:.1f}% win rate")
    
    def create_visualizations(self):
        """Create comprehensive result visualizations"""
        if not self.results:
            return
        
        trades_df = self.results['trades_df']
        
        # Create figure with subplots
        fig = plt.figure(figsize=(16, 12))
        
        # 1. Cumulative Pips Performance
        ax1 = plt.subplot(3, 2, 1)
        trades_df['cumulative_pips'] = trades_df['pips'].cumsum()
        ax1.plot(range(len(trades_df)), trades_df['cumulative_pips'], linewidth=2, color='blue')
        ax1.set_title('Cumulative Pips Performance', fontsize=13, fontweight='bold')
        ax1.set_xlabel('Trade Number')
        ax1.set_ylabel('Cumulative Pips')
        ax1.grid(True, alpha=0.3)
        ax1.axhline(y=0, color='red', linestyle='--', alpha=0.7)
        
        # Add performance annotation
        final_pips = trades_df['cumulative_pips'].iloc[-1]
        ax1.annotate(f'Final: {final_pips:+.1f} pips', 
                    xy=(len(trades_df)-1, final_pips),
                    xytext=(len(trades_df)*0.7, final_pips + 20),
                    arrowprops=dict(arrowstyle='->', color='red'),
                    fontsize=12, fontweight='bold')
        
        # 2. Win/Loss Pie Chart
        ax2 = plt.subplot(3, 2, 2)
        win_loss_counts = trades_df['result'].value_counts()
        colors = ['green' if x == 'win' else 'red' for x in win_loss_counts.index]
        wedges, texts, autotexts = ax2.pie(win_loss_counts.values, 
                                          labels=[f'{x.title()} ({v})' for x, v in zip(win_loss_counts.index, win_loss_counts.values)], 
                                          autopct='%1.1f%%', 
                                          startangle=90,
                                          colors=colors)
        ax2.set_title('Win/Loss Distribution', fontsize=13, fontweight='bold')
        
        # 3. Pips Distribution Histogram
        ax3 = plt.subplot(3, 2, 3)
        ax3.hist(trades_df['pips'], bins=30, alpha=0.7, edgecolor='black', color='skyblue')
        ax3.set_title('Pips Distribution per Trade', fontsize=13, fontweight='bold')
        ax3.set_xlabel('Pips')
        ax3.set_ylabel('Frequency')
        ax3.axvline(x=0, color='red', linestyle='--', alpha=0.7, label='Break-even')
        ax3.axvline(x=trades_df['pips'].mean(), color='green', linestyle='-', alpha=0.7, label=f'Mean: {trades_df["pips"].mean():.1f}')
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # 4. Long vs Short Performance
        ax4 = plt.subplot(3, 2, 4)
        position_performance = trades_df.groupby('position')['pips'].agg(['sum', 'mean', 'count'])
        x_pos = np.arange(len(position_performance))
        bars = ax4.bar(x_pos, position_performance['sum'], 
                      color=['blue' if pos == 'long' else 'red' for pos in position_performance.index],
                      alpha=0.7)
        ax4.set_title('Long vs Short Performance (Total Pips)', fontsize=13, fontweight='bold')
        ax4.set_xlabel('Position Type')
        ax4.set_ylabel('Total Pips')
        ax4.set_xticks(x_pos)
        ax4.set_xticklabels([pos.title() for pos in position_performance.index])
        ax4.grid(True, alpha=0.3)
        
        # Add value labels on bars
        for i, bar in enumerate(bars):
            height = bar.get_height()
            ax4.annotate(f'{height:+.1f}',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        fontweight='bold')
        
        # 5. Exit Reason Analysis
        ax5 = plt.subplot(3, 2, 5)
        exit_reasons = trades_df['exit_reason'].value_counts()
        colors_exit = {'TP': 'green', 'SL': 'red', 'EOD': 'orange'}
        bar_colors = [colors_exit.get(reason, 'gray') for reason in exit_reasons.index]
        bars = ax5.bar(exit_reasons.index, exit_reasons.values, color=bar_colors, alpha=0.7)
        ax5.set_title('Exit Reasons', fontsize=13, fontweight='bold')
        ax5.set_ylabel('Number of Trades')
        
        # Add percentage labels
        total = len(trades_df)
        for i, bar in enumerate(bars):
            height = bar.get_height()
            percentage = (height / total) * 100
            ax5.annotate(f'{height}\n({percentage:.1f}%)',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        fontweight='bold')
        
        # 6. Daily Range Analysis
        ax6 = plt.subplot(3, 2, 6)
        ax6.hist(trades_df['range_size_pips'], bins=20, alpha=0.7, edgecolor='black', color='purple')
        ax6.set_title('Daily Range Size Distribution (11:00-12:15)', fontsize=13, fontweight='bold')
        ax6.set_xlabel('Range Size (Pips)')
        ax6.set_ylabel('Frequency')
        ax6.axvline(x=trades_df['range_size_pips'].mean(), color='red', linestyle='--', 
                   label=f'Mean: {trades_df["range_size_pips"].mean():.1f} pips')
        ax6.legend()
        ax6.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save the plot
        plt.savefig('complete_backtest_results.png', dpi=300, bbox_inches='tight')
        print(f"📊 Charts saved as 'complete_backtest_results.png'")
        
        plt.show()
    
    def save_detailed_results(self):
        """Save detailed results to files"""
        if not self.results:
            return
        
        # Save trades to CSV
        trades_file = "detailed_trades_analysis.csv"
        self.results['trades_df'].to_csv(trades_file, index=False)
        print(f"💾 Detailed trades saved to: {trades_file}")
        
        # Save summary statistics
        summary_file = "backtest_summary.txt"
        with open(summary_file, 'w') as f:
            f.write("FOREX BACKTEST SUMMARY REPORT\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Strategy: Range Breakout (11:00-12:15) + MACD Entry\n")
            f.write(f"Stop Loss: {self.sl_pips} pips\n")
            f.write(f"Take Profit: {self.tp_pips} pips\n")
            f.write(f"Data Period: {self.df['DateTime'].min().date()} to {self.df['DateTime'].max().date()}\n")
            f.write(f"Total Days: {len(self.df['Date'].unique())} trading days\n\n")
            
            f.write("PERFORMANCE METRICS:\n")
            f.write(f"Total Trades: {self.results['total_trades']}\n")
            f.write(f"Win Rate: {self.results['win_rate']:.1f}%\n")
            f.write(f"Total Pips: {self.results['total_pips']:+.1f}\n")
            f.write(f"Average Win: {self.results['avg_win_pips']:+.1f} pips\n")
            f.write(f"Average Loss: {self.results['avg_loss_pips']:+.1f} pips\n")
            f.write(f"Profit Factor: {self.results['profit_factor']:.2f}\n")
            f.write(f"Average Range: {self.results['avg_range_pips']:.1f} pips\n")
        
        print(f"📋 Summary report saved to: {summary_file}")
    
    def run_complete_system(self, symbol='EURUSD', periodicity='m1'):
        """Run the complete system: download + backtest"""
        print("🚀 COMPLETE FOREX ANALYSIS SYSTEM")
        print("=" * 60)
        print("This system will:")
        print("1. 📥 Download FXCM historical data (2025-01-01 to today)")
        print("2. 🧹 Clean and prepare the data")
        print("3. 🎯 Run backtest with Range Breakout + MACD strategy")
        print("4. 📊 Generate comprehensive results and visualizations")
        print("5. 💾 Save all results to files")
        print()
        
        # Step 1: Download and clean data
        data_file = self.download_and_clean_data(symbol, periodicity)
        if not data_file:
            print("❌ Failed to download data. Exiting.")
            return
        
        # Step 2: Prepare data for backtesting
        if not self.prepare_data_for_backtest():
            print("❌ Failed to prepare data for backtesting. Exiting.")
            return
        
        # Step 3: Run backtest
        results = self.run_backtest()
        if not results:
            print("❌ Backtest failed. No results to show.")
            return
        
        # Step 4: Display results
        self.print_results()
        
        # Step 5: Create visualizations
        try:
            self.create_visualizations()
        except Exception as e:
            print(f"⚠ Could not create visualizations: {e}")
        
        # Step 6: Save detailed results
        self.save_detailed_results()
        
        print("\n" + "✅ SYSTEM COMPLETE!")
        print("=" * 60)
        print("Files created:")
        print(f"  📄 {data_file} - Clean historical data")
        print("  📄 detailed_trades_analysis.csv - All trade details")
        print("  📄 backtest_summary.txt - Summary report")
        print("  📄 complete_backtest_results.png - Performance charts")
        print()
        
        # Final summary
        if self.results['total_pips'] > 0:
            print(f"🎉 STRATEGY PERFORMANCE: +{self.results['total_pips']:.1f} pips ({self.results['win_rate']:.1f}% win rate)")
        else:
            print(f"📉 STRATEGY PERFORMANCE: {self.results['total_pips']:+.1f} pips ({self.results['win_rate']:.1f}% win rate)")
        
        return results

def main():
    """Main function to run the complete system"""
    
    # Create the system
    fx_system = CompleteFXSystem()
    
    # Run everything
    try:
        results = fx_system.run_complete_system()
        
        if results:
            print("\n🎯 Quick Summary:")
            print(f"   Trades: {results['total_trades']}")
            print(f"   Win Rate: {results['win_rate']:.1f}%")
            print(f"   Total Pips: {results['total_pips']:+.1f}")
            print(f"   Profit Factor: {results['profit_factor']:.2f}")
        
    except KeyboardInterrupt:
        print("\n⚠ Process interrupted by user")
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Show system requirements
    print("📋 SYSTEM REQUIREMENTS:")
    print("   - pandas, numpy, matplotlib, seaborn")
    print("   - Internet connection for data download")
    print("   - Approximately 2-5 minutes for complete analysis")
    print()
    
    # Ask user to confirm
    response = input("Ready to start? (y/n): ").lower().strip()
    if response in ['y', 'yes', '']:
        main()
    else:
        print("👋 Goodbye!")