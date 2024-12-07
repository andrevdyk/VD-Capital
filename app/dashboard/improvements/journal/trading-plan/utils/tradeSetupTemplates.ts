export const tradeSetupTemplates = {
  'Scalper': [
    {
      name: "Momentum Breakout",
      description: "Quick entry on price breakouts with volume confirmation",
      content: `Scalper Template 1: Momentum Breakout

1. Indicators:
- 1-minute chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (5 and 20 period)
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> (14 period)
- <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">On-Balance Volume (OBV)</span>

2. Patterns:
- <span class="bg-cyan-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bullish/Bearish Engulfing</span>
- <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Breakout Candle Close</span> from consolidation

3. Fundamentals:
- Monitor <span class="bg-yellow-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Economic Calendar</span> for high-impact news
- Watch for sudden spikes in volume

4. Profiles:
- <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">On-Balance Volume (OBV)</span> Profile to identify key levels

5. Entry Rules:
- Enter long when price breaks above 20 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> with increasing volume
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> must be above 50 for longs (below 50 for shorts)
- Enter after a <span class="bg-cyan-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bullish Engulfing</span> candle confirms the breakout

6. Exit Rules:
- Take profit at next significant resistance level (identified by <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">On-Balance Volume (OBV)</span> Profile)
- Stop loss at recent swing low (for longs) or high (for shorts)
- Exit if <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> reaches overbought (70) or oversold (30) levels

Example Trade:
Currency Pair: EUR/USD
Entry: Buy at 1.1850 on breakout with increased volume
Stop Loss: 1.1845 (5 pips)
Take Profit: 1.1860 (10 pips)
Result: Price reached take profit, 10 pip gain`,
      tags: ["Simple Moving Average (SMA)", "Relative Strength Index (RSI)", "On-Balance Volume (OBV)", "Bullish/Bearish Engulfing", "Breakout Candle Close", "Economic Calendar"]
    },
    {
      name: "Mean Reversion",
      description: "Capitalize on price returning to average levels",
      content: `Scalper Template 2: Mean Reversion

1. Indicators:
- 1-minute chart
- <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Bands</span> (20 period, 2 standard deviations)
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Stochastic Oscillator</span> (14, 3, 3)
- <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> (14 period)

2. Patterns:
- <span class="bg-teal-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Double Top/Double Bottom</span>
- Failure swings

3. Fundamentals:
- Monitor <span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Market Sentiment Indicators</span>
- Watch for overreactions to minor news events

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Market Profile</span> to identify value areas

5. Entry Rules:
- Enter long when price touches lower <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Band</span>
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Stochastic Oscillator</span> must be below 20 for longs (above 80 for shorts)
- Enter after a bullish candle confirms the reversal

6. Exit Rules:
- Take profit at middle <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Band</span>
- Stop loss at 1.5 x <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> below entry price (for longs)
- Exit if price closes beyond the opposite <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Band</span>

Example Trade:
Stock: AAPL
Entry: Buy at $150.50 when touching lower Bollinger Band
Stop Loss: $150.20 (2 Average True Range (ATR) below entry)
Take Profit: $151.00 (middle Bollinger Band)
Result: Price reached take profit, $0.50 per share gain`,
      tags: ["Bollinger Bands", "Stochastic Oscillator", "Average True Range (ATR)", "Double Top/Double Bottom", "Market Profile", "Market Sentiment Indicators"]
    },
    {
      name: "News Spike Fade",
      description: "Trade against overreactions to news events",
      content: `Scalper Template 3: News Spike Fade

1. Indicators:
- 30-second chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (10 and 30 period Exponential Moving Average (EMA))
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> (7 period)
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Average Convergence Divergence (MACD)</span> (12, 26, 9)

2. Patterns:
- Spike and channel
- <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Fibonacci Retracement</span>

3. Fundamentals:
- Focus on scheduled high-impact <span class="bg-yellow-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Economic Calendar</span> releases
- Monitor order flow for institutional activity

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Footprint Charts</span> to identify absorption and exhaustion

5. Entry Rules:
- Enter counter-trend after an initial spike following news release
- Wait for price to retrace to 38.2% or 50% <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Fibonacci Retracement</span> level
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Average Convergence Divergence (MACD)</span> must show divergence from price

6. Exit Rules:
- Take profit at 61.8% <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Fibonacci Retracement</span> or next significant support/resistance
- Stop loss above/below the news spike high/low
- Exit if a new trend establishes (price breaks beyond 10 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span>)

Example Trade:
Currency Pair: GBP/USD
Entry: Sell at 1.3550 after upward spike and 38.2% retracement
Stop Loss: 1.3570 (above spike high)
Take Profit: 1.3520 (61.8% retracement)
Result: Price reached take profit, 30 pip gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Relative Strength Index (RSI)", "Moving Average Convergence Divergence (MACD)", "Fibonacci Retracement", "Economic Calendar", "Footprint Charts"]
    }
  ],
  'Day Trader': [
    {
      name: "Trend Following Breakout",
      description: "Capture strong price movements after breakouts",
      content: `Day Trader Template 1: Trend Following Breakout

1. Indicators:
- 15-minute chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (20 and 50 period Simple Moving Average (SMA))
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> (14 period)
- <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Weighted Average Price (VWAP)</span>

2. Patterns:
- <span class="bg-indigo-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bull Flag</span> / Bear Flag
- <span class="bg-violet-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Cup and Handle</span>

3. Fundamentals:
- Review pre-market movers and sector news
- Check <span class="bg-yellow-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Economic Calendar</span> for potential market-moving events

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Profile</span> to identify key levels and potential breakout points

5. Entry Rules:
- Enter long when price breaks above flag or <span class="bg-violet-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Cup and Handle</span> pattern
- Price must be above <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Weighted Average Price (VWAP)</span> and 20 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span>
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> should be above 50 for longs (below 50 for shorts)

6. Exit Rules:
- Take partial profit at 1:1 risk-reward ratio
- Move stop loss to breakeven after partial profit
- Trail stop loss using 20 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span>
- Exit remaining position at end of day if not stopped out

Example Trade:
Stock: TSLA
Entry: Buy at $680 on breakout above bull flag pattern
Stop Loss: $670 (below flag low)
Take Profit: Partial at $690, trail remainder with 20 Simple Moving Average (SMA)
Result: Stock reached $700, exited remainder for total 2.5% gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Relative Strength Index (RSI)", "Volume Weighted Average Price (VWAP)", "Bull Flag", "Cup and Handle", "Volume Profile", "Economic Calendar"]
    },
    {
      name: "Gap and Go",
      description: "Profit from continued momentum after market gaps",
      content: `Day Trader Template 2: Gap and Go

1. Indicators:
- 5-minute chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (9 and 20 period Exponential Moving Average (EMA))
- <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Volume</span>
- <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> (14 period)

2. Patterns:
- <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Opening Range Breakout</span>
- First pullback after gap

3. Fundamentals:
- Analyze reason for the gap (earnings, news, etc.)
- Check for potential catalysts during the trading day

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Market Profile</span> to identify initial balance and value areas

5. Entry Rules:
- Enter long on a gap up that breaks above first 5-minute high
- Volume should be above average (check <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Volume</span>)
- Wait for a pullback to 9 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> before entering

6. Exit Rules:
- Set initial stop loss at low of first 5-minute candle
- Take partial profit at 2 x <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> above entry
- Trail stop loss using 20 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> for remainder
- Exit all positions if price falls below <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Weighted Average Price (VWAP)</span>

Example Trade:
Stock: AAPL
Entry: Buy at $152.50 after gap up and pullback to 9 Simple Moving Average (SMA)
Stop Loss: $151.80 (low of first 5-minute candle)
Take Profit: Partial at $153.50, trail remainder with 20 Simple Moving Average (SMA)
Result: Stock reached $154, exited remainder for total 1.2% gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Relative Volume", "Average True Range (ATR)", "Opening Range Breakout", "Market Profile", "Volume Weighted Average Price (VWAP)"]
    },
    {
      name: "Reversal at Support/Resistance",
      description: "Enter trades when price reverses at key levels",
      content: `Day Trader Template 3: Reversal at Support/Resistance

1. Indicators:
- 30-minute chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (200 period Simple Moving Average (SMA))
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Stochastic RSI</span>
- <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">On-Balance Volume (OBV)</span>

2. Patterns:
- <span class="bg-teal-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Double Top/Double Bottom</span>
- <span class="bg-teal-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Head and Shoulders</span>

3. Fundamentals:
- Identify key price levels from previous day's action
- Monitor sector rotation and overall market trends

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Profile</span> to confirm support/resistance levels

5. Entry Rules:
- Enter long at strong support level (or short at resistance)
- Wait for confirmation candle (<span class="bg-cyan-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bullish Engulfing</span>, hammer, etc.)
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Stochastic RSI</span> should be oversold for longs (overbought for shorts)
- Volume should increase on reversal candle

6. Exit Rules:
- Set stop loss below/above the reversal candle
- Take profit at next significant resistance/support level
- Exit half position if 200 <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> is reached
- Use trailing stop of 1.5 x <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> for remaining position

Example Trade:
Stock: NVDA
Entry: Buy at $220 at support level with bullish engulfing candle
Stop Loss: $218 (below reversal candle)
Take Profit: Half at $225 (200 Simple Moving Average (SMA)), trail remainder
Result: Stock reached $228, stopped out remainder for total 2.5% gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Stochastic RSI", "On-Balance Volume (OBV)", "Double Top/Double Bottom", "Head and Shoulders", "Volume Profile", "Bullish Engulfing", "Average True Range (ATR)"]
    }
  ],
  'Swing Trader': [
    {
      name: "Trend-Following Breakout",
      description: "Capture multi-day trends after key breakouts",
      content: `Swing Trader Template 1: Trend-Following Breakout

1. Indicators:
- Daily chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (20 and 50 day Exponential Moving Average (EMA))
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Average Convergence Divergence (MACD)</span> (12, 26, 9)
- <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> (14 period)

2. Patterns:
- <span class="bg-indigo-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Ascending Triangle</span>
- <span class="bg-indigo-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bull Flag</span>

3. Fundamentals:
- Analyze sector strength and market trends
- Review recent earnings reports and growth projections

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Profile</span> to identify high volume nodes and potential breakout levels

5. Entry Rules:
- Enter long when price breaks above resistance with increased volume
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Average Convergence Divergence (MACD)</span> histogram must be positive and increasing
- Price should be above both 20 and 50 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span>

6. Exit Rules:
- Set initial stop loss at 2 x <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Average True Range (ATR)</span> below entry point
- Take partial profit at 2:1 risk-reward ratio
- Trail stop loss using 20 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> for remaining position
- Exit if price closes below 50 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> on daily chart

Example Trade:
Stock: AMD
Entry: Buy at $88 on breakout from ascending triangle
Stop Loss: $84 (2 x Average True Range (ATR) below entry)
Take Profit: Partial at $96, trail remainder with 20 day Simple Moving Average (SMA)
Result: Stock reached $105 over 3 weeks, exited remainder for 18% total gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Moving Average Convergence Divergence (MACD)", "Average True Range (ATR)", "Ascending Triangle", "Bull Flag", "Volume Profile"]
    },
    {
      name: "Mean Reversion",
      description: "Profit from price returning to average levels",
      content: `Swing Trader Template 2: Mean Reversion

1. Indicators:
- Daily chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (200 day Simple Moving Average (SMA))
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> (14 period)
- <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Bands</span> (20 period, 2 standard deviations)

2. Patterns:
- Oversold bounces
- <span class="bg-teal-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Double Bottom</span>

3. Fundamentals:
- Identify stocks with strong fundamentals but recent price weakness
- Check for upcoming catalysts (earnings, product launches, etc.)

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Market Profile</span> to identify value areas and potential reversal zones

5. Entry Rules:
- Enter long when price touches lower <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Band</span>
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength Index (RSI)</span> should be below 30 (oversold)
- Price must be above 200 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> (overall uptrend)
- Look for bullish candlestick patterns at support

6. Exit Rules:
- Set stop loss below recent swing low
- Take partial profit at middle <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Band</span>
- Trail stop loss using lower <span class="bg-red-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bollinger Band</span> for remaining position
- Exit if fundamentals deteriorate or overall market trend changes

Example Trade:
Stock: MSFT
Entry: Buy at $270 at lower Bollinger Band with Relative Strength Index (RSI) at 28
Stop Loss: $260 (below recent swing low)
Take Profit: Partial at $285 (middle Bollinger Band), trail remainder
Result: Stock reached $300 over 4 weeks, exited remainder for 10% total gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Relative Strength Index (RSI)", "Bollinger Bands", "Double Bottom", "Market Profile"]
    },
    {
      name: "Breakout Pullback",
      description: "Enter after a pullback following a strong breakout",
      content: `Swing Trader Template 3: Breakout Pullback

1. Indicators:
- Daily chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (10 and 30 day Exponential Moving Average (EMA))
- <span class="bg-purple-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">On-Balance Volume (OBV)</span>
- <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Fibonacci Retracement</span> tool

2. Patterns:
- <span class="bg-violet-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Cup and Handle</span>
- <span class="bg-indigo-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Bull Flag</span> after breakout

3. Fundamentals:
- Analyze recent news and sector performance
- Review institutional ownership and insider trading activity

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Profile</span> to confirm breakout levels and identify areas of interest

5. Entry Rules:
- Identify a strong breakout above resistance on high volume
- Wait for a pullback to 38.2% or 50% <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Fibonacci Retracement</span> level
- Enter long when price bounces from retracement level
- Ensure 10 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> is above 30 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> (uptrend)

6. Exit Rules:
- Set stop loss below 61.8% <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Fibonacci Retracement</span> level
- Take partial profit at previous breakout high
- Trail stop loss using 10 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> for remaining position
- Exit if price closes below 30 day <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Simple Moving Average (SMA)</span> on daily chart

Example Trade:
Stock: SQ
Entry: Buy at $210 on pullback to 50% Fibonacci retracement after breakout
Stop Loss: $200 (below 61.8% retracement)
Take Profit: Partial at $230 (previous high), trail remainder
Result: Stock reached $260 over 6 weeks, exited remainder for 21% total gain`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "On-Balance Volume (OBV)", "Fibonacci Retracement", "Cup and Handle", "Bull Flag", "Volume Profile"]
    }
  ],
  'Position Trader': [
    {
      name: "Long-Term Trend Following",
      description: "Capture major market trends over extended periods",
      content: `Position Trader Template 1: Long-Term Trend Following

1. Indicators:
- Weekly chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (50 and 200 week Simple Moving Average (SMA))
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Average Convergence Divergence (MACD)</span> (12, 26, 9)
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength</span> (RS) line

2. Patterns:
- <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Breakout</span> from long-term bases
- <span class="bg-violet-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Rounding Bottom</span>

3. Fundamentals:
- Analyze company's financial statements and growth prospects
- Evaluate competitive advantage and market position
- Monitor industry trends and potential disruptors

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Profile</span> on monthly chart to identify major support/resistance levels

5. Entry Rules:
- Enter long when price breaks above long-term resistance with increased volume
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Average Convergence Divergence (MACD)</span> must show bullish crossover on weekly chart
- Stock's <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength</span> line should be outperforming the broader market
- Ensure fundamental growth metrics support long-term uptrend

6. Exit Rules:
- Set initial stop loss at 15-20% below entry point
- Review position quarterly, adjusting stop loss to protect profits
- Consider partial profit-taking at major psychological levels
- Exit if fundamental thesis changes or long-term trend reverses

Example Trade:
Stock: AAPL
Entry: Buy at $130 on breakout from long-term base
Stop Loss: $110 (15% below entry)
Take Profit: Hold for long-term growth, reassess annually
Result: Stock reached $180 over 18 months, continuing to hold with trailing stop`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Moving Average Convergence Divergence (MACD)", "Relative Strength", "Breakout", "Rounding Bottom", "Volume Profile"]
    },
    {
      name: "Value Investing",
      description: "Identify undervalued stocks for long-term appreciation",
      content: `Position Trader Template 2: Value Investing

1. Indicators:
- Monthly chart
- <span class="bg-blue-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Moving Averages (SMA, EMA, WMA)</span> (200-month Simple Moving Average (SMA))
- <span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Price-to-Earnings (P/E) Ratio</span>
- <span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Dividend Yield</span>

2. Patterns:
- Accumulation after prolonged downtrend
- <span class="bg-teal-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Inverse Head and Shoulders</span> on monthly chart

3. Fundamentals:
- Focus on companies with strong balance sheets and cash flows
- Analyze historical valuation metrics (<span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">P/E Ratio</span>, P/B, P/S ratios)
- Evaluate management's track record and capital allocation decisions

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Market Profile</span> on yearly chart to identify long-term value areas

5. Entry Rules:
- Enter when stock is trading below intrinsic value (use DCF or comparable analysis)
- <span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">P/E Ratio</span> should be below industry average and historical norms
- Price should be near long-term support levels
- Look for signs of institutional accumulation

6. Exit Rules:
- Set wide stop loss based on volatility (e.g., 2-3 standard deviations)
- Hold position for several years, reassessing annually
- Consider trimming position if valuation becomes excessive
- Exit if company fundamentals deteriorate significantly

Example Trade:
Stock: KO
Entry: Buy at $45 when P/E ratio falls below 5-year average
Stop Loss: $38 (15% below entry, aligned with major support)
Take Profit: Hold for long-term value appreciation and dividends
Result: Stock reached $60 over 3 years, collected dividends, continuing to hold`,
      tags: ["Simple Moving Average (SMA)", "Exponential Moving Average (EMA)", "Price-to-Earnings (P/E) Ratio", "Dividend Yield", "Accumulation", "Inverse Head and Shoulders", "Market Profile"]
    },
    {
      name: "Secular Growth Investing",
      description: "Invest in companies with long-term growth potential",
      content: `Position Trader Template 3: Secular Growth Investing

1. Indicators:
- Quarterly chart
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Linear Regression</span> channel
- <span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Earnings Growth Rate</span>
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength</span> vs. S&P 500

2. Patterns:
- Steady <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Uptrend</span> within regression channel
- <span class="bg-amber-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Consolidation</span> near upper channel boundary

3. Fundamentals:
- Identify companies in sectors with long-term growth potential
- Analyze total addressable market (TAM) and market share trends
- Evaluate competitive moat and barriers to entry

4. Profiles:
- <span class="bg-pink-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Volume Profile</span> on yearly chart to confirm long-term accumulation

5. Entry Rules:
- Enter long when price pulls back to lower boundary of <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Linear Regression</span> channel
- <span class="bg-orange-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Earnings Growth Rate</span> should exceed industry average
- Company must have a clear path to expanding market share
- <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Relative Strength</span> line should be in an uptrend

6. Exit Rules:
- Set initial stop loss at lower boundary of <span class="bg-green-500 text-white px-1 rounded inline-block cursor-pointer" contenteditable="false">Linear Regression</span> channel
- Reassess position if price breaks below channel or fundamentals weaken
- Consider taking partial profits if stock becomes significantly overvalued
- Hold core position as long as growth story remains intact

Example Trade:
Stock: AMZN
Entry: Buy at $2,000 on pullback to lower regression channel boundary
Stop Loss: $1,700 (lower channel boundary)
Take Profit: Hold for long-term growth, reassess quarterly
Result: Stock reached $3,500 over 2 years, continuing to hold with trailing stop`,
      tags: ["Linear Regression", "Earnings Growth Rate", "Relative Strength", "Uptrend", "Consolidation", "Volume Profile"]
    }
  ]
};

