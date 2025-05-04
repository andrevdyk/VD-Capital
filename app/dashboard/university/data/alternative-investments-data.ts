export const alternativeInvestmentsData = {
  types: [
    {
      id: "real-estate",
      icon: "building",
      title: "Real Estate Investments",
      shortDescription: "Physical properties and REITs",
      fullDescription:
        "Real estate investments involve purchasing, owning, and managing properties for income or capital appreciation. Options range from direct ownership of residential or commercial properties to investing in Real Estate Investment Trusts (REITs) that trade like stocks but own and operate income-producing real estate.",
      typicalReturns: "8-12% annually",
      minimumInvestment: "$1,000 - $50,000+",
      advantages: [
        "Potential for both income (rent) and appreciation",
        "Tangible asset with intrinsic value",
        "Tax advantages through depreciation and mortgage interest deductions",
        "Hedge against inflation as property values and rents typically rise with inflation",
      ],
      disadvantages: [
        "Requires significant capital for direct ownership",
        "Illiquid compared to stocks and bonds",
        "Management responsibilities for direct ownership",
        "Property taxes and maintenance costs",
      ],
      bestFor: [
        "Long-term investors seeking income and growth",
        "Investors looking for portfolio diversification",
        "Those comfortable with lower liquidity",
        "Tax-conscious investors",
      ],
      howToStart: [
        "Research different real estate investment options (residential, commercial, REITs)",
        "Determine your budget and financing options",
        "For direct ownership, connect with real estate agents in target markets",
        "For REITs, open a brokerage account and research available options",
        "Consider starting with crowdfunding platforms for lower initial investments",
      ],
      platforms: ["Fundrise", "Roofstock", "Vanguard Real Estate ETF (VNQ)", "Realty Income (O)", "CrowdStreet"],
    },
    {
      id: "private-equity",
      icon: "briefcase",
      title: "Private Equity",
      shortDescription: "Investments in private companies",
      fullDescription:
        "Private equity involves investing directly in private companies or buying out public companies to take them private. These investments typically aim to improve company operations and profitability before selling at a higher valuation. Traditionally limited to institutional investors and high-net-worth individuals, newer platforms now offer access to smaller investors.",
      typicalReturns: "15-25% annually",
      minimumInvestment: "$10,000 - $250,000+",
      advantages: [
        "Potential for higher returns than public markets",
        "Not correlated with stock market volatility",
        "Active management to improve company performance",
        "Access to companies in growth stages before public offerings",
      ],
      disadvantages: [
        "Long lock-up periods (often 5-10 years)",
        "High minimum investments for traditional funds",
        "Limited transparency and complex fee structures",
        "Higher risk due to less regulation and disclosure",
      ],
      bestFor: [
        "Accredited investors with long time horizons",
        "Those seeking higher returns and willing to accept illiquidity",
        "Investors looking to diversify beyond public markets",
        "Individuals with industry expertise who can evaluate opportunities",
      ],
      howToStart: [
        "Determine if you qualify as an accredited investor",
        "Research private equity firms and their track records",
        "Consider private equity marketplaces or crowdfunding platforms for lower minimums",
        "Consult with a financial advisor specializing in alternative investments",
        "Start with a small allocation to learn the process",
      ],
      platforms: ["AngelList", "EquityZen", "Moonfare", "iCapital Network", "Yieldstreet"],
    },
    {
      id: "collectibles",
      icon: "gem",
      title: "Collectibles & Luxury Assets",
      shortDescription: "Art, wine, watches, and more",
      fullDescription:
        "Collectibles and luxury assets include items like fine art, rare wines, watches, classic cars, and other items that can appreciate in value over time. These tangible assets can provide both enjoyment and investment returns, though they require specialized knowledge and proper storage/maintenance.",
      typicalReturns: "5-15% annually",
      minimumInvestment: "$1,000 - $100,000+",
      advantages: [
        "Enjoyment value alongside potential financial returns",
        "Tangible assets that can be insured",
        "Not directly correlated with financial markets",
        "Potential protection against inflation",
      ],
      disadvantages: [
        "Requires specialized knowledge or expert advice",
        "Storage, insurance, and maintenance costs",
        "Highly illiquid markets with high transaction costs",
        "Authenticity and provenance concerns",
      ],
      bestFor: [
        "Passionate collectors with domain expertise",
        "Investors seeking unique portfolio diversification",
        "High-net-worth individuals with adequate storage solutions",
        "Those with connections in specific collectible markets",
      ],
      howToStart: [
        "Educate yourself about the specific collectible market that interests you",
        "Start with lower-priced items to learn the market dynamics",
        "Connect with reputable dealers and auction houses",
        "Consider fractional ownership platforms for high-value items",
        "Ensure proper insurance, storage, and authentication",
      ],
      platforms: [
        "Masterworks (art)",
        "Vinovest (wine)",
        "Rally (various collectibles)",
        "Otis",
        "Collectable (sports memorabilia)",
      ],
    },
    {
      id: "commodities",
      icon: "tree",
      title: "Commodities & Natural Resources",
      shortDescription: "Gold, silver, agriculture, timber",
      fullDescription:
        "Commodities and natural resources include physical goods like precious metals, agricultural products, energy resources, and timber. These investments can provide portfolio diversification and inflation protection. Investors can gain exposure through direct ownership, futures contracts, ETFs, or companies involved in resource production.",
      typicalReturns: "3-12% annually",
      minimumInvestment: "$1,000 - $25,000+",
      advantages: [
        "Effective hedge against inflation",
        "Low correlation with stocks and bonds",
        "Tangible assets with intrinsic value",
        "Global demand driven by population growth and development",
      ],
      disadvantages: [
        "High price volatility",
        "Storage costs for physical ownership",
        "Complexity of futures contracts",
        "No income generation (except timber and some agricultural investments)",
      ],
      bestFor: [
        "Investors seeking inflation protection",
        "Those looking to diversify traditional portfolios",
        "Individuals with specific insights into commodity markets",
        "Long-term investors who can weather price volatility",
      ],
      howToStart: [
        "Research different commodity types and their market dynamics",
        "Consider ETFs or mutual funds focused on commodities for easier access",
        "For physical precious metals, identify reputable dealers and secure storage",
        "For timber or farmland, explore specialized REITs or partnerships",
        "Start with a small allocation to understand price movements",
      ],
      platforms: [
        "SPDR Gold Shares (GLD)",
        "iShares Silver Trust (SLV)",
        "Farmland LP",
        "Weyerhaeuser (WY)",
        "AcreTrader",
      ],
    },
    {
      id: "p2p-lending",
      icon: "piggy",
      title: "Peer-to-Peer Lending",
      shortDescription: "Direct loans to individuals or businesses",
      fullDescription:
        "Peer-to-peer (P2P) lending allows investors to lend money directly to individuals or small businesses through online platforms, bypassing traditional financial institutions. Investors can select specific loans based on risk ratings, interest rates, and loan purposes, or use automated tools to build a diversified loan portfolio.",
      typicalReturns: "5-10% annually",
      minimumInvestment: "$25 - $1,000",
      advantages: [
        "Regular income through monthly payments",
        "Lower minimum investments than many alternatives",
        "Ability to diversify across many loans",
        "Higher yields than traditional fixed-income investments",
      ],
      disadvantages: [
        "Risk of borrower defaults, especially during economic downturns",
        "Limited secondary markets for selling loans",
        "Platform risk if the P2P company fails",
        "Potential tax complications from interest income",
      ],
      bestFor: [
        "Income-focused investors seeking higher yields",
        "Those comfortable with online financial platforms",
        "Investors who can reinvest regularly to compound returns",
        "People looking for alternatives to traditional fixed income",
      ],
      howToStart: [
        "Research P2P lending platforms and their track records",
        "Start with a small investment spread across multiple loans",
        "Understand the risk ratings and default statistics",
        "Set up automatic reinvestment of payments to compound returns",
        "Keep records for tax purposes as interest is taxable income",
      ],
      platforms: ["Prosper", "Funding Circle", "Upstart", "Peerform", "Kiva (social impact)"],
    },
  ],
  comparison: [
    {
      characteristic: "Liquidity",
      traditional: "High - can typically sell quickly with minimal impact on price",
      alternative: "Low to Medium - may require weeks, months, or years to sell at fair value",
    },
    {
      characteristic: "Minimum Investment",
      traditional: "Low - can start with a few dollars in many cases",
      alternative: "Medium to High - often requires thousands or tens of thousands to start",
    },
    {
      characteristic: "Transparency",
      traditional: "High - regulated markets with disclosure requirements",
      alternative: "Low to Medium - less regulation and public information",
    },
    {
      characteristic: "Correlation to Stock Market",
      traditional: "High - tend to move together during major market events",
      alternative: "Low to Medium - often move independently from traditional markets",
    },
    {
      characteristic: "Potential Returns",
      traditional: "Moderate - historically 7-10% for stocks long-term",
      alternative: "Variable - potentially higher but with increased risk",
    },
    {
      characteristic: "Fee Structure",
      traditional: "Low - often below 1% annually for passive investments",
      alternative: "High - often 1-2% management fees plus 10-20% of profits",
    },
    {
      characteristic: "Accessibility",
      traditional: "High - available through most brokerages and apps",
      alternative: "Medium - increasingly available through specialized platforms",
    },
  ],
  gettingStarted: {
    steps: [
      {
        title: "Assess Your Current Portfolio",
        description:
          "Review your existing investments to identify gaps and determine how alternatives might complement your portfolio.",
      },
      {
        title: "Define Your Investment Goals",
        description:
          "Clarify whether you're seeking income, growth, diversification, or inflation protection from alternative investments.",
      },
      {
        title: "Educate Yourself",
        description:
          "Learn about different alternative asset classes, their risk-return profiles, and how they perform in various economic conditions.",
      },
      {
        title: "Start Small",
        description:
          "Begin with a modest allocation (5-10% of your portfolio) to alternative investments while you gain experience.",
      },
      {
        title: "Choose Accessible Options First",
        description:
          "Consider REITs, publicly traded commodity funds, or P2P lending platforms that offer lower minimums and better liquidity.",
      },
      {
        title: "Monitor Performance",
        description: "Track your alternative investments against your goals and adjust your strategy as needed.",
      },
    ],
    factors: [
      {
        icon: "dollar",
        title: "Liquidity Needs",
        description:
          "Ensure you have sufficient liquid assets for emergencies and opportunities before committing capital to illiquid alternatives.",
      },
      {
        icon: "clock",
        title: "Time Horizon",
        description:
          "Many alternative investments require longer holding periods (5-10+ years) to realize their full potential returns.",
      },
      {
        icon: "alert",
        title: "Risk Tolerance",
        description:
          "Alternative investments often have unique risks including illiquidity, leverage, and less regulatory oversight.",
      },
    ],
  },
}

