export const glossaryTerms = [
  // Fundamentals
  {
    term: "P/E Ratio",
    definition:
      "Price-to-Earnings Ratio is a valuation ratio of a company's current share price compared to its per-share earnings. It indicates how much investors are willing to pay for each dollar of earnings.",
    category: "fundamentals",
    extendedDefinition:
      "The P/E ratio is one of the most widely used valuation metrics in the stock market. It's calculated by dividing a company's current share price by its earnings per share (EPS). For example, if a company is trading at $50 per share and has an EPS of $5, its P/E ratio is 10. This means investors are willing to pay $10 for every $1 of earnings the company generates.",
    keyPoints: [
      "Lower P/E ratios may indicate undervalued stocks, while higher ratios might suggest overvaluation or high growth expectations",
      "P/E ratios should be compared within the same industry, as different sectors have different typical P/E ranges",
      "The trailing P/E uses past earnings, while the forward P/E uses projected future earnings",
      "P/E ratios can be distorted during periods of unusually high or low earnings",
    ],
    examples: [
      "Value investors often look for stocks with low P/E ratios relative to their industry or historical averages",
      "Growth stocks typically have higher P/E ratios as investors pay a premium for expected future growth",
      "The average P/E ratio for the S&P 500 has historically been around 15-20, though this varies over time",
    ],
    relatedTerms: ["EPS", "Market Cap", "PEG Ratio"],
    misconceptions: [
      {
        myth: "A low P/E ratio always indicates a good investment opportunity",
        reality:
          "While a low P/E might suggest undervaluation, it could also signal problems with the company's business model, declining growth prospects, or industry challenges. Always investigate why a P/E is low.",
      },
      {
        myth: "P/E ratio is the only valuation metric you need",
        reality:
          "P/E is just one of many valuation tools. It should be used alongside other metrics like PEG ratio, price-to-sales, price-to-book, and discounted cash flow analysis for a comprehensive valuation.",
      },
      {
        myth: "Companies with similar P/E ratios are equally attractive investments",
        reality:
          "Two companies with the same P/E ratio may have very different growth prospects, risk profiles, debt levels, and competitive positions. The P/E ratio alone doesn't tell the full story.",
      },
    ],
  },
  {
    term: "EPS",
    definition:
      "Earnings Per Share represents a company's profit divided by the outstanding shares of its common stock. It serves as an indicator of a company's profitability.",
    category: "fundamentals",
    extendedDefinition:
      "EPS is a key financial metric that shows how much profit a company has generated per share of outstanding stock. It's calculated by dividing the company's net income (minus preferred dividends) by the weighted average number of common shares outstanding during the period. EPS is often reported on a quarterly and annual basis, and is a fundamental component of many valuation metrics.",
    keyPoints: [
      "Basic EPS uses the actual number of shares outstanding, while diluted EPS accounts for all potential shares from convertible securities",
      "Growing EPS over time generally indicates improving profitability",
      "EPS can be manipulated through share buybacks, which reduce the number of outstanding shares",
      "Adjusted or non-GAAP EPS excludes one-time items and is often used to show 'normalized' earnings",
    ],
    examples: [
      "If a company earns $100 million in a year and has 50 million shares outstanding, its EPS is $2.00",
      "Analysts often forecast future EPS to help investors make decisions",
      "Year-over-year EPS growth is a common metric for evaluating company performance",
    ],
    relatedTerms: ["P/E Ratio", "Dividend Payout Ratio", "Net Income"],
    misconceptions: [
      {
        myth: "Higher EPS always means a better investment",
        reality:
          "While higher EPS generally indicates better profitability, it doesn't account for the price you're paying for those earnings. A stock with high EPS but an extremely high price may be a worse investment than a moderately priced stock with lower EPS.",
      },
      {
        myth: "EPS growth through share buybacks is as valuable as growth through increased profits",
        reality:
          "Companies can increase EPS by reducing share count through buybacks, even if actual profits remain flat. This type of EPS growth may not be as sustainable as growth driven by increasing revenues and operational efficiency.",
      },
      {
        myth: "Reported EPS figures are always comparable between companies",
        reality:
          "Companies may calculate EPS differently, especially when using adjusted or non-GAAP figures. Always understand what's included or excluded in an EPS calculation when comparing companies.",
      },
    ],
  },
  {
    term: "Market Cap",
    definition:
      "Market Capitalization is the total dollar market value of a company's outstanding shares, calculated by multiplying the total number of shares by the current market price per share.",
    category: "fundamentals",
    extendedDefinition:
      "Market capitalization, often referred to as 'market cap,' represents the total value that the market places on a company. It's a simple but powerful metric that helps investors understand the size of a company and compare it to others. Companies are typically categorized as large-cap (over $10 billion), mid-cap ($2-10 billion), or small-cap (under $2 billion), with additional categories like mega-cap and micro-cap at the extremes.",
    keyPoints: [
      "Market cap reflects the market's perception of a company's value, not necessarily its actual worth",
      "Larger market cap companies tend to be more stable but may have less growth potential",
      "Smaller market cap companies often offer higher growth potential but with increased volatility and risk",
      "Market cap is constantly changing as stock prices fluctuate",
    ],
    examples: [
      "As of 2023, companies like Apple, Microsoft, and Saudi Aramco have market caps exceeding $1 trillion",
      "Index funds often weight their holdings by market cap, giving larger companies more influence on the index",
      "A company with 1 billion shares trading at $50 per share has a market cap of $50 billion",
    ],
    relatedTerms: ["Float", "Enterprise Value", "Shares Outstanding"],
    misconceptions: [
      {
        myth: "Market cap equals the amount of money needed to buy the entire company",
        reality:
          "Acquiring a company typically requires paying a premium over the current market cap, and the enterprise value (which includes debt and excludes cash) is a better measure of acquisition cost.",
      },
      {
        myth: "A company with a larger market cap is always financially stronger",
        reality:
          "Market cap only reflects equity value, not debt levels. A company with a large market cap might have substantial debt, while a smaller market cap company could be debt-free with strong cash reserves.",
      },
      {
        myth: "Stock price alone tells you how 'expensive' a company is",
        reality:
          "A $1,000 stock price doesn't necessarily mean the company is more valuable than one with a $10 stock price. Market cap (price × shares) provides the true comparison of company size.",
      },
    ],
  },
  // Technical Analysis
  {
    term: "Moving Average",
    definition:
      "A calculation used to analyze data points by creating a series of averages of different subsets of the full data set to smooth out price data and identify trends.",
    category: "technical",
    extendedDefinition:
      "Moving averages are one of the most widely used technical indicators. They smooth out price action by filtering out random short-term fluctuations and highlighting the direction of the trend. The two most common types are Simple Moving Averages (SMA), which give equal weight to all prices in the calculation period, and Exponential Moving Averages (EMA), which give more weight to recent prices.",
    keyPoints: [
      "Shorter-term moving averages (e.g., 10-day) react more quickly to price changes but generate more false signals",
      "Longer-term moving averages (e.g., 200-day) identify major trends but lag behind price movements",
      "Moving average crossovers are popular signals for trend changes",
      "Moving averages can act as dynamic support and resistance levels",
    ],
    examples: [
      "The 50-day and 200-day moving averages are widely followed by investors and traders",
      "A 'golden cross' occurs when a shorter-term moving average crosses above a longer-term moving average, suggesting bullish momentum",
      "A 'death cross' occurs when a shorter-term moving average crosses below a longer-term moving average, suggesting bearish momentum",
    ],
    relatedTerms: ["MACD", "Trend", "Support and Resistance"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "Moving averages appear as smooth lines that follow the general direction of price movement. They're typically plotted directly on the price chart, with different colors representing different time periods.",
      steps: [
        "Select the type of moving average (SMA or EMA) and the time period based on your trading timeframe",
        "Look for the price crossing above the moving average as a potential bullish signal",
        "Look for the price crossing below the moving average as a potential bearish signal",
        "Identify areas where the moving average has previously acted as support or resistance",
        "Watch for convergence or divergence between multiple moving averages to confirm trend strength or weakness",
      ],
    },
    misconceptions: [
      {
        myth: "Moving average crossovers always provide reliable trading signals",
        reality:
          "Moving average crossovers can generate many false signals, especially in choppy or sideways markets. They work best in trending markets and should be confirmed with other indicators.",
      },
      {
        myth: "The same moving average settings work well for all markets and timeframes",
        reality:
          "Different markets and timeframes have different volatility characteristics. Moving average periods should be adjusted based on the specific asset and time horizon you're analyzing.",
      },
      {
        myth: "Moving averages predict future price movements",
        reality:
          "Moving averages are lagging indicators based solely on past price data. They identify existing trends but don't predict future price movements with certainty.",
      },
    ],
  },
  {
    term: "RSI",
    definition:
      "Relative Strength Index is a momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100, indicating overbought (above 70) or oversold (below 30) conditions.",
    category: "technical",
    extendedDefinition:
      "Developed by J. Welles Wilder in 1978, the Relative Strength Index (RSI) is a momentum oscillator that compares the magnitude of recent gains to recent losses to determine overbought and oversold conditions. The standard calculation uses 14 periods, though traders may adjust this based on their timeframe. The RSI ranges from 0 to 100, with readings above 70 traditionally considered overbought and readings below 30 considered oversold.",
    keyPoints: [
      "RSI measures the internal strength of a security based on its closing prices over a recent trading period",
      "Divergence between RSI and price can signal potential reversals",
      "The centerline (50) can act as support in uptrends and resistance in downtrends",
      "RSI works best in ranging markets and should be used with caution in strong trends",
    ],
    examples: [
      "An RSI reading above 70 might suggest taking profits or preparing for a potential reversal",
      "An RSI reading below 30 might indicate a buying opportunity if other conditions confirm",
      "Bullish divergence occurs when price makes a lower low but RSI makes a higher low, suggesting weakening downward momentum",
    ],
    relatedTerms: ["Stochastic Oscillator", "MACD", "Overbought/Oversold"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "The RSI appears as a line oscillating between 0 and 100 in a separate window below the price chart. Horizontal reference lines are typically drawn at 70 and 30 to mark overbought and oversold levels, with an additional line sometimes at 50 to mark the centerline.",
      steps: [
        "Identify when RSI crosses above 30 from below as a potential bullish signal (especially if coming from deeply oversold conditions)",
        "Identify when RSI crosses below 70 from above as a potential bearish signal (especially if coming from deeply overbought conditions)",
        "Look for divergences between RSI and price movement (e.g., price making new highs while RSI fails to do so)",
        "Observe the behavior of RSI around the centerline (50) during trends",
        "Consider adjusting the standard 14-period setting based on your trading timeframe (shorter for more signals, longer for fewer)",
      ],
    },
    misconceptions: [
      {
        myth: "Overbought always means sell and oversold always means buy",
        reality:
          "During strong trends, RSI can remain in overbought or oversold territory for extended periods. Simply reaching these levels is not always a signal to trade; look for confirmation from price action or other indicators.",
      },
      {
        myth: "RSI works equally well in all market conditions",
        reality:
          "RSI is most effective in ranging markets where prices oscillate between clear support and resistance levels. In strong trending markets, RSI can generate false signals and remain overbought or oversold for long periods.",
      },
      {
        myth: "RSI divergence always leads to a price reversal",
        reality:
          "While RSI divergence can be a powerful signal, it doesn't guarantee a reversal. Sometimes the divergence can persist for a long time before any price reversal occurs, or the price may simply consolidate rather than reverse.",
      },
    ],
  },
  {
    term: "Support Level",
    definition:
      "A price level where a downtrend can be expected to pause due to a concentration of demand or buying interest.",
    category: "technical",
    extendedDefinition:
      "Support levels represent price points where buying pressure is strong enough to overcome selling pressure, causing the price to stop declining and potentially reverse upward. These levels form because traders and investors tend to buy at similar price points they consider good value, creating a 'floor' that prevents prices from falling further. Support can be horizontal (at a specific price) or diagonal (following a trendline).",
    keyPoints: [
      "Support levels are identified by previous price lows where the market reversed",
      "The more times a support level is tested without breaking, the stronger it becomes",
      "When support breaks, it often becomes resistance (role reversal)",
      "Support levels can be psychological (round numbers) or technical (moving averages, previous lows)",
    ],
    examples: [
      "A stock repeatedly bouncing off the $50 price level during declines",
      "A cryptocurrency finding support at its 200-day moving average",
      "An index stopping its decline at a previous reaction low from months earlier",
    ],
    relatedTerms: ["Resistance Level", "Trendline", "Price Action"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "Support levels appear as horizontal or diagonal lines connecting two or more price lows on a chart. They represent areas where price has previously stopped falling and reversed upward.",
      steps: [
        "Identify at least two price lows at approximately the same level",
        "Draw a horizontal line connecting these lows to establish a support level",
        "For diagonal support (uptrend lines), connect progressively higher lows",
        "Look for increasing volume as price approaches support, which may confirm its strength",
        "Watch for how price behaves when it reaches the support level again",
      ],
    },
    misconceptions: [
      {
        myth: "Support levels are exact price points that will always hold",
        reality:
          "Support is better understood as zones rather than exact prices. Markets often test support by briefly breaking below it before reversing (known as 'false breakouts' or 'stop hunts').",
      },
      {
        myth: "The more times support is tested, the more likely it is to break",
        reality:
          "While repeated tests can weaken support, they can also strengthen it if each test is rejected decisively. The nature of the tests matters more than the number.",
      },
      {
        myth: "Support levels work the same way across all timeframes",
        reality:
          "Support on higher timeframes (weekly, monthly) is generally more significant than on lower timeframes (hourly, daily). A support break on a lower timeframe may be just noise within a larger support zone on a higher timeframe.",
      },
    ],
  },
  // New Technical Analysis Terms
  {
    term: "Supply and Demand Zones",
    definition:
      "Areas on a chart where price has shown significant buying (demand) or selling (supply) pressure, creating zones that may influence future price movement when revisited.",
    category: "technical",
    extendedDefinition:
      "Supply and demand zones represent institutional order blocks where major market participants have previously entered or exited positions. Unlike traditional support and resistance lines, these are zones or areas rather than specific price levels. Supply zones form where selling pressure has overwhelmed buying pressure, causing price to drop significantly. Demand zones form where buying pressure has overwhelmed selling pressure, causing price to rise significantly.",
    keyPoints: [
      "Fresh zones (those that haven't been tested multiple times) are generally more reliable",
      "The stronger the price movement away from the zone, the more significant the zone",
      "Supply and demand zones on higher timeframes carry more weight than those on lower timeframes",
      "The longer price spends in a zone before moving away, the weaker the zone typically is",
    ],
    examples: [
      "A stock rapidly rising from $50 to $60 creates a demand zone around $50",
      "A currency pair dropping sharply after consolidating in a range creates a supply zone at that range",
      "A commodity finding buyers repeatedly in the same price area, creating a strong demand zone",
    ],
    relatedTerms: ["Order Blocks", "Support and Resistance", "Price Action"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "Supply and demand zones appear as rectangular boxes on a chart, highlighting areas where price has previously shown strong rejection. Supply zones are typically drawn at areas where price has fallen sharply, while demand zones are drawn where price has risen sharply.",
      steps: [
        "Identify areas where price has moved sharply in one direction after spending minimal time at a level",
        "For demand zones, look for strong upward price movements from a base",
        "For supply zones, look for strong downward price movements from a ceiling",
        "Draw rectangles encompassing the price range where the strong move began",
        "Pay special attention to zones that haven't been retested multiple times",
      ],
    },
    misconceptions: [
      {
        myth: "All price consolidation areas are supply or demand zones",
        reality:
          "True supply and demand zones are characterized by sharp price movements away from the zone, not just any area of consolidation. The strength of the move away from the zone is what gives it significance.",
      },
      {
        myth: "Supply and demand zones never fail",
        reality:
          "Like all technical analysis concepts, supply and demand zones can and do fail. Their effectiveness depends on market conditions, timeframe, and the overall trend.",
      },
      {
        myth: "The wider you draw the zone, the more likely price will respect it",
        reality:
          "Drawing excessively wide zones reduces their analytical value. Effective zones should be relatively tight, encompassing the specific area where the strong price movement originated.",
      },
    ],
  },
  {
    term: "Order Blocks",
    definition:
      "Specific candles or price areas that show significant imbalance between buyers and sellers, often preceding strong directional moves and serving as potential reversal points when revisited.",
    category: "technical",
    extendedDefinition:
      "Order blocks are a concept from smart money theory that identifies specific candles where institutional orders have been placed, creating an imbalance in the market. These blocks often appear just before significant moves and represent areas where large players have entered positions. Bullish order blocks appear before upward moves, while bearish order blocks appear before downward moves. When price returns to these areas, they often act as turning points.",
    keyPoints: [
      "Order blocks typically show a strong imbalance between buyers and sellers",
      "They often feature a strong closing in one direction followed by a reversal",
      "The most effective order blocks occur before significant moves in the opposite direction",
      "Order blocks on higher timeframes are considered more significant",
    ],
    examples: [
      "A bearish order block might be the last significant up candle before a major downtrend begins",
      "A bullish order block could be the last significant down candle before a strong rally",
      "Multiple timeframe analysis might show order blocks aligning across different time periods",
    ],
    relatedTerms: ["Supply and Demand Zones", "Fair Value Gaps", "Smart Money Concepts"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "Order blocks appear as specific candles or small groups of candles that precede strong moves in the opposite direction. They're typically highlighted with rectangles encompassing the price range of the key candle(s).",
      steps: [
        "Identify a strong directional move in price",
        "Look for the last opposing candle before that move began",
        "For bullish order blocks, find the last significant bearish candle before a strong upward move",
        "For bearish order blocks, find the last significant bullish candle before a strong downward move",
        "Draw a rectangle covering the range of this candle (or sometimes just the upper or lower portion)",
      ],
    },
    misconceptions: [
      {
        myth: "Any candle before a trend change is an order block",
        reality:
          "True order blocks show specific characteristics of imbalance and are not just any candle preceding a move. They typically show strong momentum in one direction before the market reverses.",
      },
      {
        myth: "Order blocks work in isolation from other technical factors",
        reality:
          "Order blocks are most effective when they align with other technical factors such as key support/resistance levels, trend lines, or significant moving averages.",
      },
      {
        myth: "Order blocks remain valid indefinitely",
        reality:
          "The effectiveness of order blocks diminishes over time and after multiple retests. Fresh, untested order blocks generally have the strongest influence on price.",
      },
    ],
  },
  {
    term: "Fair Value Gap",
    definition:
      "A significant price imbalance or gap between candles that indicates a rapid price movement where price has 'skipped' levels, creating an area that may be revisited as the market seeks equilibrium.",
    category: "technical",
    extendedDefinition:
      "Fair Value Gaps (FVGs) are areas where price has moved so quickly that it has created an imbalance or 'gap' in fair value. Unlike traditional gaps that occur between trading sessions, FVGs can form during continuous trading when price moves rapidly. The theory suggests that markets tend to be efficient and will often return to fill these gaps to establish fair value. Bullish FVGs form during rapid upward movements, while bearish FVGs form during rapid downward movements.",
    keyPoints: [
      "FVGs are identified by comparing the bodies (not wicks) of consecutive candles",
      "A bullish FVG occurs when the high of a candle is below the low of the previous candle",
      "A bearish FVG occurs when the low of a candle is above the high of the previous candle",
      "FVGs are considered 'filled' when price returns to and trades through the gap area",
    ],
    examples: [
      "A stock announces positive earnings and opens the next day with a bullish FVG",
      "A currency pair drops sharply on negative economic news, creating a bearish FVG",
      "An index moves rapidly during a news event, creating multiple FVGs that later get filled",
    ],
    relatedTerms: ["Order Blocks", "Supply and Demand Zones", "Price Imbalance"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "Fair Value Gaps appear as spaces between the bodies of consecutive candles where price has 'jumped' without trading through all levels. They're typically highlighted with rectangles showing the gap between candle bodies.",
      steps: [
        "Look for areas where price has moved rapidly in one direction",
        "For bullish FVGs, identify where a candle's high is below the previous candle's low",
        "For bearish FVGs, identify where a candle's low is above the previous candle's high",
        "Draw a rectangle in the 'gap' area between the candles",
        "Monitor these areas as potential targets for price to return to",
      ],
    },
    misconceptions: [
      {
        myth: "All gaps must be filled",
        reality:
          "While many FVGs do eventually get filled, there is no guarantee that every gap will be filled, especially in strongly trending markets or when fundamental factors have significantly changed.",
      },
      {
        myth: "FVGs are the same as traditional chart gaps",
        reality:
          "Unlike traditional gaps that form between trading sessions, FVGs can form during continuous trading and are identified by comparing the bodies of consecutive candles, not just opening and closing prices.",
      },
      {
        myth: "The larger the FVG, the more likely it will be filled",
        reality:
          "The size of the FVG doesn't necessarily correlate with the likelihood of it being filled. Market context, trend strength, and other factors play important roles in determining whether a gap will be filled.",
      },
    ],
  },
  // Economics
  {
    term: "Inflation",
    definition:
      "The rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling.",
    category: "economics",
    extendedDefinition:
      "Inflation is a sustained increase in the general price level of goods and services in an economy over a period of time. When the general price level rises, each unit of currency buys fewer goods and services; consequently, inflation reflects a reduction in the purchasing power per unit of money. Central banks attempt to limit inflation—and avoid deflation—in order to keep the economy running smoothly.",
    keyPoints: [
      "Inflation is typically measured by the Consumer Price Index (CPI) or Producer Price Index (PPI)",
      "Moderate inflation (2-3%) is generally considered healthy for a growing economy",
      "High inflation can erode savings and fixed incomes",
      "Inflation affects different asset classes differently, with some serving as inflation hedges",
    ],
    examples: [
      "The United States experienced high inflation in the 1970s, reaching over 14% in 1980",
      "Zimbabwe experienced hyperinflation in the late 2000s, with inflation rates in the millions of percent",
      "Japan has struggled with very low inflation and even deflation since the 1990s",
    ],
    relatedTerms: ["Deflation", "Monetary Policy", "Consumer Price Index"],
    visualGuide: {
      image: "/placeholder.svg?height=400&width=600",
      howToIdentify:
        "Inflation is typically visualized through line charts showing the percentage change in price indices over time. Rising lines indicate increasing inflation rates, while falling lines show disinflation.",
      steps: [
        "Monitor monthly CPI and PPI reports released by government statistical agencies",
        "Compare current inflation rates to historical averages and central bank targets",
        "Analyze inflation across different categories (food, energy, housing, etc.) to identify specific pressure points",
        "Consider core inflation (excluding volatile food and energy prices) for underlying trends",
        "Watch for changes in inflation expectations in consumer surveys and market-based measures",
      ],
    },
    misconceptions: [
      {
        myth: "Inflation is always bad for the economy",
        reality:
          "Moderate inflation (around 2%) is actually considered beneficial as it encourages spending and investment rather than holding cash. Deflation (falling prices) can be more damaging as it can lead to decreased spending and economic contraction.",
      },
      {
        myth: "Printing money always causes high inflation",
        reality:
          "While excessive money creation can lead to inflation, the relationship is complex. Factors like velocity of money, output gaps, and global forces also play crucial roles. Japan has expanded its money supply significantly without generating high inflation.",
      },
      {
        myth: "Inflation affects all goods and services equally",
        reality:
          "Inflation rates vary widely across different sectors and goods. For example, technology often experiences deflation (falling prices) even during periods of overall inflation, while healthcare and education costs have typically risen faster than general inflation.",
      },
    ],
  },
]

