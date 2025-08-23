import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import yfinance as yf
import warnings
warnings.filterwarnings('ignore')

class TradingStrategyBacktester:
    def __init__(self, symbol='EURUSD=X', timeframe='1h', initial_capital=10000):
        """
        Initialize the backtester
        
        Args:
            symbol: Trading symbol (default: EURUSD=X for Yahoo Finance)
            timeframe: Data timeframe (1m, 5m, 15m, 1h, 1d)
            initial_capital: Starting capital for backtesting
        """
        self.symbol = symbol
        self.timeframe = timeframe
        self.initial_capital = initial_capital
        self.data = None
        self.signals = None
        self.results = None

    def load_csv_data(self, filepath):
        """
        Load OHLCV data from a local CSV file.
        """
        df = pd.read_csv(
            filepath,
            sep=';',
            names=['datetime', 'Open', 'High', 'Low', 'Close', 'Volume'],
            header=0
        )
        
        # Parse datetime
        df['datetime'] = pd.to_datetime(df['datetime'], format='%Y%m%d %H%M%S')
        df.set_index('datetime', inplace=True)
        
        self.data = df
        print(f"Loaded {len(df)} rows from {filepath}")
        
        # Add technical indicators
        self.add_technical_indicators()

        
    def fetch_data(self, period='1mo'):
        """
        Fetch OHLCV data from Yahoo Finance
        Note: Yahoo Finance has limitations on 1min data (typically last 7 days)
        
        Args:
            period: Data period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')
        """
        try:
            ticker = yf.Ticker(self.symbol)
            self.data = ticker.history(period=period, interval=self.timeframe)
            
            if self.data.empty:
                raise ValueError("No data fetched. Check symbol and timeframe.")
                
            print(f"Fetched {len(self.data)} rows of {self.timeframe} data for {self.symbol}")
            print(f"Date range: {self.data.index[0]} to {self.data.index[-1]}")
            
            # Add technical indicators
            self.add_technical_indicators()
            
        except Exception as e:
            print(f"Error fetching data: {e}")
            # Generate sample data for demonstration
            self.generate_sample_data()
    
    def generate_sample_data(self, days=5):
        """Generate sample EURUSD data for demonstration with proper timezone"""
        print("Generating sample EURUSD data for demonstration...")
        
        # Create date range in UTC
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        dates = pd.date_range(start=start_date, end=end_date, freq='1min', tz='UTC')
        
        # Generate realistic EURUSD price data
        np.random.seed(42)
        n_points = len(dates)
        
        # Start around typical EURUSD price
        initial_price = 1.0850
        
        # Generate price movements with some trend and noise
        returns = np.random.normal(0, 0.0001, n_points)  # Small returns for 1-min data
        prices = [initial_price]
        
        for i in range(1, n_points):
            # Add some mean reversion and momentum
            momentum = returns[i-1] * 0.1
            mean_reversion = (1.0850 - prices[-1]) * 0.001
            new_return = returns[i] + momentum + mean_reversion
            new_price = prices[-1] * (1 + new_return)
            prices.append(new_price)
        
        # Create OHLC data
        df_data = []
        for i in range(0, len(prices)-4, 1):  # Every minute
            open_price = prices[i]
            close_price = prices[i+1] if i+1 < len(prices) else prices[i]
            high_price = max(open_price, close_price) + np.random.uniform(0, 0.0005)
            low_price = min(open_price, close_price) - np.random.uniform(0, 0.0005)
            volume = np.random.randint(1000, 10000)
            
            df_data.append({
                'Open': open_price,
                'High': high_price,
                'Low': low_price,
                'Close': close_price,
                'Volume': volume
            })
        
        self.data = pd.DataFrame(df_data, index=dates[:len(df_data)])
        self.add_technical_indicators()
        print(f"Generated {len(self.data)} rows of sample data")
        print(f"Date range: {self.data.index[0]} to {self.data.index[-1]}")
        
        # Show SAST times for verification
        sast_times = self.data.index.tz_convert('Africa/Johannesburg')
        print(f"SAST range: {sast_times[0]} to {sast_times[-1]}")
    
    
    def add_technical_indicators(self):
        """Add common technical indicators to the dataset"""
        # Simple Moving Averages
        self.data['SMA_10'] = self.data['Close'].rolling(window=10).mean()
        self.data['SMA_20'] = self.data['Close'].rolling(window=20).mean()
        self.data['SMA_50'] = self.data['Close'].rolling(window=50).mean()
        
        # Exponential Moving Averages
        self.data['EMA_12'] = self.data['Close'].ewm(span=12).mean()
        self.data['EMA_26'] = self.data['Close'].ewm(span=26).mean()
        
        # MACD
        self.data['MACD'] = self.data['EMA_12'] - self.data['EMA_26']
        self.data['MACD_Signal'] = self.data['MACD'].ewm(span=9).mean()
        self.data['MACD_Histogram'] = self.data['MACD'] - self.data['MACD_Signal']
        
        # RSI
        delta = self.data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        self.data['RSI'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        self.data['BB_Middle'] = self.data['Close'].rolling(window=20).mean()
        bb_std = self.data['Close'].rolling(window=20).std()
        self.data['BB_Upper'] = self.data['BB_Middle'] + (bb_std * 2)
        self.data['BB_Lower'] = self.data['BB_Middle'] - (bb_std * 2)
        
        # Price change and returns
        self.data['Price_Change'] = self.data['Close'].pct_change()
        
    def simple_ma_crossover_strategy(self, fast_period=10, slow_period=20):
        """
        Simple Moving Average Crossover Strategy
        Buy when fast MA crosses above slow MA
        Sell when fast MA crosses below slow MA
        """
        fast_ma = self.data['Close'].rolling(window=fast_period).mean()
        slow_ma = self.data['Close'].rolling(window=slow_period).mean()
        
        # Generate signals
        signals = pd.DataFrame(index=self.data.index)
        signals['Price'] = self.data['Close']
        signals['Fast_MA'] = fast_ma
        signals['Slow_MA'] = slow_ma
        
        # Create signals (1 for buy, -1 for sell, 0 for hold)
        signals['Signal'] = 0
        signals['Signal'][fast_period:] = np.where(
            signals['Fast_MA'][fast_period:] > signals['Slow_MA'][fast_period:], 1, 0
        )
        signals['Position'] = signals['Signal'].diff()
        
        return signals
    
    def macd_strategy(self):
        """
        MACD Strategy
        Buy when MACD crosses above signal line
        Sell when MACD crosses below signal line
        """
        signals = pd.DataFrame(index=self.data.index)
        signals['Price'] = self.data['Close']
        signals['MACD'] = self.data['MACD']
        signals['MACD_Signal'] = self.data['MACD_Signal']
        
        # Create signals
        signals['Signal'] = 0
        signals['Signal'] = np.where(signals['MACD'] > signals['MACD_Signal'], 1, 0)
        signals['Position'] = signals['Signal'].diff()
        
        return signals
    
    def daily_macd_strategy_230pm(self):
        """
        Daily MACD Strategy - Trade once per day at 2:30 PM SAST
        - At 2:30 PM SAST, check MACD signal
        - If MACD > Signal Line: Buy (or hold long position)
        - If MACD < Signal Line: Sell (or hold short position)
        - Only one trade per day at the specified time
        """
        signals = pd.DataFrame(index=self.data.index)
        signals['Price'] = self.data['Close']
        signals['MACD'] = self.data['MACD']
        signals['MACD_Signal'] = self.data['MACD_Signal']
        
        # Initialize signals
        signals['Signal'] = 0
        signals['Position'] = 0
        signals['Trade_Time'] = False
        
        # Find 2:30 PM SAST times (14:30)
        target_time = pd.Timestamp('14:30:00').time()
        
        # Group by date to ensure only one trade per day
        current_position = 0
        last_trade_date = None
        
        for i, (timestamp, row) in enumerate(signals.iterrows()):
            # Handle timezone conversion properly
            try:
                # If already timezone-aware, just convert to SAST
                if timestamp.tz is not None:
                    sast_time = timestamp.tz_convert('Africa/Johannesburg')
                else:
                    # If timezone-naive, assume UTC and convert to SAST
                    sast_time = timestamp.tz_localize('UTC').tz_convert('Africa/Johannesburg')
            except:
                # Fallback: assume UTC and convert
                try:
                    sast_time = timestamp.tz_localize('UTC').tz_convert('Africa/Johannesburg')
                except:
                    # If all else fails, add 2 hours (SAST = UTC+2)
                    sast_time = timestamp + pd.Timedelta(hours=2)
            
            current_date = sast_time.date()
            current_time = sast_time.time()
            
            # Check if it's 2:30 PM SAST and we haven't traded today
            is_trade_time = (current_time.hour == 14 and current_time.minute == 30)
            
            if is_trade_time and current_date != last_trade_date:
                # Check MACD signal
                macd_val = row['MACD']
                macd_signal_val = row['MACD_Signal']
                
                if not pd.isna(macd_val) and not pd.isna(macd_signal_val):
                    if macd_val > macd_signal_val:
                        # MACD above signal line - Buy signal
                        new_position = 1
                    else:
                        # MACD below signal line - Sell signal
                        new_position = -1
                    
                    # Only create position change if different from current
                    if new_position != current_position:
                        signals.loc[timestamp, 'Position'] = new_position - current_position
                        current_position = new_position
                        last_trade_date = current_date
                        signals.loc[timestamp, 'Trade_Time'] = True
                        
                        print(f"Trade Signal at {sast_time}: {'BUY' if new_position == 1 else 'SELL'} "
                              f"(MACD: {macd_val:.6f}, Signal: {macd_signal_val:.6f})")
            
            # Maintain current position
            signals.loc[timestamp, 'Signal'] = current_position
        
        return signals
    
    def rsi_strategy(self, oversold=30, overbought=70):
        """
        RSI Mean Reversion Strategy
        Buy when RSI < oversold level
        Sell when RSI > overbought level
        """
        signals = pd.DataFrame(index=self.data.index)
        signals['Price'] = self.data['Close']
        signals['RSI'] = self.data['RSI']
        
        # Create signals
        signals['Signal'] = 0
        signals['Signal'] = np.where(signals['RSI'] < oversold, 1, 
                                   np.where(signals['RSI'] > overbought, -1, 0))
        signals['Position'] = signals['Signal'].diff()
        
        return signals

    def zigzag_imbalance_strategy(self):
        """
        Zigzag Imbalance Strategy:
        
        - Check prior hour high/low before 14:31 SAST.
        - Fade breakouts in opposite direction.
        - Require 2 change-of-structure points.
        - Detect imbalance:
            bearish: candle 2 low > candle 0 high
            bullish: candle 2 high < candle 0 low
        - Place limit order at imbalance price.
        - SL = trend high/low, TP = 1:1 RR.
        """
        signals = pd.DataFrame(index=self.data.index)
        signals['Price'] = self.data['Close']
        signals['Signal'] = 0
        signals['Position'] = 0
        signals['Trade_Time'] = False
        
        # Find timestamps for prior hour before 14:31
        sast = self.data.index.tz_convert('Africa/Johannesburg')
        target_date = None
        current_position = 0
        
        for i in range(3, len(self.data)):
            timestamp = self.data.index[i]
            sast_time = timestamp.tz_convert('Africa/Johannesburg')
            current_date = sast_time.date()
            current_time = sast_time.time()
            
            # Only trade after 14:30
            if current_time < pd.Timestamp('14:31:00').time():
                continue
            
            # Calculate prior hour high/low for this day
            if target_date != current_date:
                # Determine time range 13:30 to 14:30
                prior_start = pd.Timestamp(f"{current_date} 13:30:00").tz_localize('Africa/Johannesburg').tz_convert('UTC')
                prior_end = pd.Timestamp(f"{current_date} 14:30:00").tz_localize('Africa/Johannesburg').tz_convert('UTC')
                prior_data = self.data.loc[(self.data.index >= prior_start) & (self.data.index < prior_end)]
                
                if prior_data.empty:
                    continue
                
                prior_high = prior_data['High'].max()
                prior_low = prior_data['Low'].min()
                
                target_date = current_date
            
            # Check if price broke prior hour range
            price = self.data['Close'].iloc[i]
            broke_high = price > prior_high
            broke_low = price < prior_low
            
            if broke_high or broke_low:
                # Check for trend (simple swing detection)
                highs = []
                lows = []
                
                lookback = 30  # look back up to ~30 candles
                for j in range(i - lookback, i):
                    if j < 2:
                        continue
                    # detect swing highs
                    if (self.data['High'].iloc[j] > self.data['High'].iloc[j - 1]) and \
                    (self.data['High'].iloc[j] > self.data['High'].iloc[j + 1]):
                        highs.append((self.data.index[j], self.data['High'].iloc[j]))
                    # detect swing lows
                    if (self.data['Low'].iloc[j] < self.data['Low'].iloc[j - 1]) and \
                    (self.data['Low'].iloc[j] < self.data['Low'].iloc[j + 1]):
                        lows.append((self.data.index[j], self.data['Low'].iloc[j]))
                
                uptrend = len(highs) >= 2 and highs[-1][1] > highs[-2][1]
                downtrend = len(lows) >= 2 and lows[-1][1] < lows[-2][1]
                
                # Check for imbalance
                candle_0 = self.data.iloc[i]
                candle_1 = self.data.iloc[i - 1]
                candle_2 = self.data.iloc[i - 2]
                
                bearish_imbalance = candle_2['Low'] > candle_0['High']
                bullish_imbalance = candle_2['High'] < candle_0['Low']
                
                if broke_high and uptrend and bearish_imbalance:
                    # Fade the breakout → look for sell
                    entry = candle_0['High']
                    sl = max([h[1] for h in highs[-2:]])
                    tp = entry - (sl - entry)
                    
                    # Simulate immediate fill
                    signals.iloc[i, signals.columns.get_loc('Signal')] = -1
                    signals.iloc[i, signals.columns.get_loc('Position')] = -1
                    signals.iloc[i, signals.columns.get_loc('Trade_Time')] = True
                    print(f"SELL signal at {sast_time}: Entry={entry:.5f}, SL={sl:.5f}, TP={tp:.5f}")
                
                elif broke_low and downtrend and bullish_imbalance:
                    # Fade the breakout → look for buy
                    entry = candle_0['Low']
                    sl = min([l[1] for l in lows[-2:]])
                    tp = entry + (entry - sl)
                    
                    signals.iloc[i, signals.columns.get_loc('Signal')] = 1
                    signals.iloc[i, signals.columns.get_loc('Position')] = 1
                    signals.iloc[i, signals.columns.get_loc('Trade_Time')] = True
                    print(f"BUY signal at {sast_time}: Entry={entry:.5f}, SL={sl:.5f}, TP={tp:.5f}")
                
        return signals

    
    def bollinger_bands_strategy(self):
        """
        Bollinger Bands Mean Reversion Strategy
        Buy when price touches lower band
        Sell when price touches upper band
        """
        signals = pd.DataFrame(index=self.data.index)
        signals['Price'] = self.data['Close']
        signals['BB_Upper'] = self.data['BB_Upper']
        signals['BB_Lower'] = self.data['BB_Lower']
        signals['BB_Middle'] = self.data['BB_Middle']
        
        # Create signals
        signals['Signal'] = 0
        signals['Signal'] = np.where(signals['Price'] <= signals['BB_Lower'], 1,
                                   np.where(signals['Price'] >= signals['BB_Upper'], -1, 0))
        signals['Position'] = signals['Signal'].diff()
        
        return signals
    
    def backtest_strategy(self, signals, transaction_cost=0.0001):
        """
        Backtest the trading strategy
        
        Args:
            signals: DataFrame with trading signals
            transaction_cost: Cost per trade (spread + commission)
        """
        # Initialize portfolio
        portfolio = pd.DataFrame(index=signals.index)
        portfolio['Price'] = signals['Price']
        portfolio['Signal'] = signals['Signal']
        portfolio['Position'] = signals['Position']
        
        # Calculate position sizes (for simplicity, use fixed position size)
        portfolio['Holdings'] = portfolio['Signal'] * 100  # 100 units per signal
        portfolio['Cash'] = self.initial_capital
        
        # Calculate portfolio value
        portfolio['Total'] = portfolio['Cash'] + (portfolio['Holdings'] * portfolio['Price'])
        
        # Calculate returns
        portfolio['Returns'] = portfolio['Total'].pct_change()
        portfolio['Strategy_Returns'] = portfolio['Holdings'].shift(1) * portfolio['Price'].pct_change()
        
        # Apply transaction costs
        trades = portfolio['Position'].abs().sum()
        total_transaction_cost = trades * transaction_cost * self.initial_capital
        portfolio['Total'] -= total_transaction_cost / len(portfolio)
        
        # Calculate cumulative returns
        portfolio['Cumulative_Returns'] = (1 + portfolio['Returns']).cumprod()
        portfolio['Cumulative_Strategy_Returns'] = (1 + portfolio['Strategy_Returns']).cumprod()
        
        return portfolio
    
    def calculate_performance_metrics(self, portfolio):
        """Calculate key performance metrics"""
        returns = portfolio['Returns'].dropna()
        strategy_returns = portfolio['Strategy_Returns'].dropna()
        
        # Basic metrics
        total_return = (portfolio['Total'].iloc[-1] / self.initial_capital - 1) * 100
        
        # Risk metrics
        volatility = returns.std() * np.sqrt(252 * 24 * 60) * 100  # Annualized volatility for 1-min data
        
        # Sharpe ratio (assuming 0% risk-free rate)
        sharpe_ratio = returns.mean() / returns.std() * np.sqrt(252 * 24 * 60) if returns.std() != 0 else 0
        
        # Maximum drawdown
        cumulative = portfolio['Cumulative_Returns']
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min() * 100
        
        # Win rate
        winning_trades = len(strategy_returns[strategy_returns > 0])
        total_trades = len(strategy_returns[strategy_returns != 0])
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        # Average trade
        avg_win = strategy_returns[strategy_returns > 0].mean() if len(strategy_returns[strategy_returns > 0]) > 0 else 0
        avg_loss = strategy_returns[strategy_returns < 0].mean() if len(strategy_returns[strategy_returns < 0]) > 0 else 0
        
        metrics = {
            'Total Return (%)': round(total_return, 2),
            'Annualized Volatility (%)': round(volatility, 2),
            'Sharpe Ratio': round(sharpe_ratio, 2),
            'Maximum Drawdown (%)': round(max_drawdown, 2),
            'Win Rate (%)': round(win_rate, 2),
            'Total Trades': total_trades,
            'Average Win (%)': round(avg_win * 100, 4),
            'Average Loss (%)': round(avg_loss * 100, 4),
            'Final Portfolio Value': round(portfolio['Total'].iloc[-1], 2)
        }
        
        return metrics
    
    def plot_results(self, signals, portfolio, strategy_name):
        """Plot backtest results"""
        fig, axes = plt.subplots(4, 1, figsize=(15, 12))
        
        # Price and signals
        axes[0].plot(self.data.index, self.data['Close'], label='Price', alpha=0.7)
        
        # Buy signals
        buy_signals = signals[signals['Position'] == 1]
        if not buy_signals.empty:
            axes[0].scatter(buy_signals.index, buy_signals['Price'], 
                          color='green', marker='^', s=60, label='Buy Signal')
        
        # Sell signals
        sell_signals = signals[signals['Position'] == -1]
        if not sell_signals.empty:
            axes[0].scatter(sell_signals.index, sell_signals['Price'], 
                          color='red', marker='v', s=60, label='Sell Signal')
        
        axes[0].set_title(f'{strategy_name} - Price and Signals')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # Portfolio value
        axes[1].plot(portfolio.index, portfolio['Total'], label='Portfolio Value')
        axes[1].axhline(y=self.initial_capital, color='r', linestyle='--', alpha=0.5, label='Initial Capital')
        axes[1].set_title('Portfolio Value Over Time')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        
        # Cumulative returns
        axes[2].plot(portfolio.index, portfolio['Cumulative_Returns'], label='Strategy Returns')
        axes[2].axhline(y=1, color='r', linestyle='--', alpha=0.5)
        axes[2].set_title('Cumulative Returns')
        axes[2].legend()
        axes[2].grid(True, alpha=0.3)
        
        # Drawdown
        cumulative = portfolio['Cumulative_Returns']
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max * 100
        axes[3].fill_between(portfolio.index, drawdown, 0, alpha=0.3, color='red')
        axes[3].set_title('Drawdown (%)')
        axes[3].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()
    
    def run_backtest(self, strategy_name='MA_Crossover', **strategy_params):
        """
        Run complete backtest for specified strategy
        
        Args:
            strategy_name: Name of strategy ('MA_Crossover', 'MACD', 'RSI', 'BB', 'Daily_MACD_230PM')
            **strategy_params: Additional parameters for the strategy
        """
        if self.data is None:
            print("No data available. Please fetch data first.")
            return
        
        print(f"\n=== Running {strategy_name} Strategy Backtest ===")
        
        # Generate signals based on strategy
        if strategy_name == 'MA_Crossover':
            signals = self.simple_ma_crossover_strategy(**strategy_params)
        elif strategy_name == 'MACD':
            signals = self.macd_strategy()
        elif strategy_name == 'Daily_MACD_230PM':
            signals = self.daily_macd_strategy_230pm()
        elif strategy_name == 'RSI':
            signals = self.rsi_strategy(**strategy_params)
        elif strategy_name == 'BB':
            signals = self.bollinger_bands_strategy()
        elif strategy_name == 'Zigzag_Imbalance':
            signals = self.zigzag_imbalance_strategy()
        else:
            raise ValueError("Unknown strategy. Choose from: 'MA_Crossover', 'MACD', 'Daily_MACD_230PM', 'RSI', 'BB'")
        
        # Run backtest
        portfolio = self.backtest_strategy(signals)
        
        # Calculate metrics
        metrics = self.calculate_performance_metrics(portfolio)
        
        # Print results
        print("\n--- Performance Metrics ---")
        for key, value in metrics.items():
            print(f"{key}: {value}")
        
        # Show trade summary for daily strategy
        if strategy_name == 'Daily_MACD_230PM':
            trade_times = signals[signals['Trade_Time'] == True]
            if not trade_times.empty:
                print(f"\n--- Trade Summary ---")
                print(f"Total trading days: {len(trade_times)}")
                print(f"Trade times (SAST):")
                for timestamp, row in trade_times.iterrows():
                    try:
                        # Handle timezone conversion properly
                        if timestamp.tz is not None:
                            sast_time = timestamp.tz_convert('Africa/Johannesburg')
                        else:
                            sast_time = timestamp.tz_localize('UTC').tz_convert('Africa/Johannesburg')
                    except:
                        # Fallback: add 2 hours for SAST
                        sast_time = timestamp + pd.Timedelta(hours=2)
                    
                    action = "BUY" if row['Position'] > 0 else "SELL"
                    print(f"  {sast_time.strftime('%Y-%m-%d %H:%M:%S SAST')}: {action} at {row['Price']:.5f}")
            else:
                print(f"\n--- Trade Summary ---")
                print("No trades executed at 2:30 PM SAST during the data period.")
        
        # Plot results
        self.plot_results(signals, portfolio, strategy_name)
        
        # Store results
        self.signals = signals
        self.results = portfolio
        
        return signals, portfolio, metrics

# Example usage and demonstration
if __name__ == "__main__":
    # Initialize backtester
    backtester = TradingStrategyBacktester(
        symbol='EURUSD=X',
        timeframe='1m',
        initial_capital=10000
    )
    
    # Fetch data (will use sample data if real data unavailable)
    backtester.load_csv_data('./EURUSD.csv')
    
    print("Testing Daily MACD Strategy (2:30 PM SAST) on EURUSD 1-minute data...")
    
    # Test the specific daily MACD strategy at 2:30 PM SAST
    signals, portfolio, metrics = backtester.run_backtest(
        strategy_name='Zigzag_Imbalance'  # Change to 'Daily_MACD_230PM' for daily MACD strategy
    )
    
    # You can also compare with regular MACD strategy
    print("\n" + "="*60)
    print("Comparing with Regular MACD Strategy...")
    
    regular_macd_signals, regular_macd_portfolio, regular_macd_metrics = backtester.run_backtest(
        strategy_name='MACD'
    )
    
    # Compare the two strategies
    print("\n=== Strategy Comparison: Daily 2:30 PM vs Regular MACD ===")
    comparison_df = pd.DataFrame({
        'Daily MACD (2:30 PM SAST)': metrics,
        'Regular MACD': regular_macd_metrics
    })
    
    print(comparison_df.to_string())
    
    # Plot comparison
    fig, ax = plt.subplots(figsize=(14, 8))
    ax.plot(portfolio.index, portfolio['Cumulative_Returns'], 
            label='Daily MACD (2:30 PM SAST)', linewidth=2)
    ax.plot(regular_macd_portfolio.index, regular_macd_portfolio['Cumulative_Returns'], 
            label='Regular MACD', linewidth=2, alpha=0.7)
    ax.axhline(y=1, color='black', linestyle='--', alpha=0.5, label='Break-even')
    ax.set_title('Strategy Performance Comparison: Daily MACD vs Regular MACD')
    ax.set_ylabel('Cumulative Returns')
    ax.set_xlabel('Time')
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
    
    # Additional analysis for daily strategy
    if 'Trade_Time' in signals.columns:
        trade_summary = signals[signals['Trade_Time'] == True].copy()
        if not trade_summary.empty:
            print(f"\n=== Detailed Trade Analysis ===")
            print(f"Number of trading opportunities: {len(trade_summary)}")
            
            # Calculate P&L for each trade
            trade_pnl = []
            for i in range(len(trade_summary) - 1):
                current_trade = trade_summary.iloc[i]
                next_trade = trade_summary.iloc[i + 1]
                
                if current_trade['Position'] > 0:  # Long position
                    pnl = (next_trade['Price'] - current_trade['Price']) / current_trade['Price']
                elif current_trade['Position'] < 0:  # Short position
                    pnl = (current_trade['Price'] - next_trade['Price']) / current_trade['Price']
                else:
                    pnl = 0
                
                trade_pnl.append(pnl * 100)  # Convert to percentage
            
            if trade_pnl:
                print(f"Average trade P&L: {np.mean(trade_pnl):.3f}%")
                print(f"Best trade: {np.max(trade_pnl):.3f}%")
                print(f"Worst trade: {np.min(trade_pnl):.3f}%")
                print(f"Win rate: {len([x for x in trade_pnl if x > 0])/len(trade_pnl)*100:.1f}%")