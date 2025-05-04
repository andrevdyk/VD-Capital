export const personalFinanceData = {
  quickTips: [
    {
      icon: "dollar",
      title: "50/30/20 Rule",
      subtitle: "Budget Allocation",
      description:
        "Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment for a balanced financial approach.",
    },
    {
      icon: "trending",
      title: "Emergency Fund",
      subtitle: "Financial Safety Net",
      description:
        "Aim to save 3-6 months of essential expenses in an easily accessible account to handle unexpected financial emergencies.",
    },
    {
      icon: "umbrella",
      title: "Pay Yourself First",
      subtitle: "Savings Strategy",
      description:
        "Automatically transfer a portion of your income to savings or investments before spending on discretionary items.",
    },
  ],
  lifeStages: [
    {
      icon: "graduation",
      title: "Early Career (20s-30s)",
      description:
        "Focus on building a foundation for long-term financial success while managing student debt and starting your career.",
      priorities: ["Emergency Fund", "Retirement Savings", "Debt Reduction", "Skill Building"],
      strategies: [
        "Start retirement savings early to benefit from compound growth",
        "Build an emergency fund of 3-6 months of expenses",
        "Pay down high-interest debt aggressively",
        "Invest in developing marketable skills",
        "Consider low-cost index funds for long-term investing",
      ],
      pitfalls: [
        "Lifestyle inflation as income increases",
        "Neglecting retirement savings while focusing on other goals",
        "Taking on too much consumer debt",
        "Avoiding all risk in investments despite long time horizon",
      ],
    },
    {
      icon: "home",
      title: "Mid-Career & Family (30s-40s)",
      description:
        "Balance competing financial priorities like homeownership, family expenses, and continued retirement savings.",
      priorities: ["Homeownership", "Family Planning", "Career Growth", "Education Savings"],
      strategies: [
        "Increase retirement contributions as income grows",
        "Consider term life insurance to protect dependents",
        "Start education savings accounts for children",
        "Diversify investments across asset classes",
        "Maintain adequate emergency savings as expenses increase",
      ],
      pitfalls: [
        "Overextending on housing costs",
        "Prioritizing children's education over retirement savings",
        "Inadequate insurance coverage",
        "Neglecting estate planning documents",
      ],
    },
    {
      icon: "heart",
      title: "Pre-Retirement (50s-60s)",
      description:
        "Finalize retirement preparations and transition strategies while maximizing savings in peak earning years.",
      priorities: ["Maximize Retirement Savings", "Debt Elimination", "Healthcare Planning", "Estate Planning"],
      strategies: [
        "Take advantage of catch-up contributions to retirement accounts",
        "Gradually shift investment allocation to more conservative mix",
        "Pay off mortgage and other debts before retirement if possible",
        "Develop a Social Security claiming strategy",
        "Create a retirement income plan and budget",
      ],
      pitfalls: [
        "Taking on new debt close to retirement",
        "Supporting adult children at the expense of retirement savings",
        "Underestimating healthcare costs in retirement",
        "Failing to update estate planning documents",
      ],
    },
  ],
  financialSituations: [
    {
      title: "Job Loss or Income Reduction",
      severity: "high",
      description:
        "Losing your job or experiencing a significant income reduction requires immediate action to stabilize your finances and develop a recovery plan.",
      immediateSteps: [
        "Apply for unemployment benefits or other assistance you qualify for",
        "Review and reduce all non-essential expenses",
        "Contact creditors to discuss hardship options for bills and loans",
        "Prioritize essential expenses: housing, food, utilities, and transportation",
        "Avoid using high-interest debt for daily expenses if possible",
      ],
      longTermStrategy:
        "Focus on rebuilding your emergency fund once income is restored. Consider developing multiple income streams or acquiring new skills to increase employability and income security in the future.",
      resourcesNeeded: [
        "Updated resume and LinkedIn profile",
        "List of networking contacts",
        "Budget spreadsheet for reduced income",
        "Information on unemployment benefits and assistance programs",
      ],
    },
    {
      title: "High-Interest Debt Burden",
      severity: "high",
      description:
        "High-interest debt, especially credit cards, can quickly become overwhelming and prevent progress toward other financial goals.",
      immediateSteps: [
        "Stop accumulating new debt and remove saved credit card information from online stores",
        "List all debts with their interest rates, minimum payments, and balances",
        "Consider balance transfer offers or debt consolidation for lower interest rates",
        "Choose a repayment strategy: either highest interest first (avalanche) or smallest balance first (snowball)",
        "Look for expenses to cut or additional income sources to accelerate debt payoff",
      ],
      longTermStrategy:
        "After paying off high-interest debt, redirect those payments to building emergency savings and then to retirement accounts. Develop a sustainable budget that prevents future debt accumulation.",
      resourcesNeeded: [
        "Debt repayment calculator",
        "Credit report and score",
        "Information on balance transfer offers or personal loans",
        "Budget tracking system",
      ],
    },
    {
      title: "Preparing for a Major Purchase (Home/Car)",
      severity: "medium",
      description:
        "Major purchases like homes or vehicles require careful planning to ensure they fit within your long-term financial plan.",
      immediateSteps: [
        "Determine a realistic budget based on your income and existing obligations",
        "Save for a substantial down payment to reduce financing costs",
        "Check and improve your credit score to qualify for better interest rates",
        "Research all associated costs beyond the purchase price (maintenance, insurance, taxes)",
        "Compare financing options from multiple sources",
      ],
      longTermStrategy:
        "Plan major purchases to fit within your overall financial goals. Avoid stretching your budget to the maximum, as this leaves no room for other priorities or emergencies.",
      resourcesNeeded: [
        "Mortgage or auto loan calculator",
        "Credit report and score",
        "Savings account for down payment",
        "Information on insurance costs",
      ],
    },
    {
      title: "Receiving a Windfall (Inheritance, Bonus)",
      severity: "low",
      description:
        "Receiving a significant sum of money presents opportunities but requires careful planning to maximize its long-term benefit.",
      immediateSteps: [
        "Place the funds in a high-yield savings account while developing a plan",
        "Pay any tax obligations associated with the windfall",
        "Consider paying off high-interest debt",
        "Set aside a small portion (5-10%) for something enjoyable or meaningful",
        "Consult with a financial advisor for larger windfalls",
      ],
      longTermStrategy:
        "Allocate the windfall according to your financial priorities: emergency fund, retirement savings, education funding, or other long-term goals. Avoid lifestyle inflation that creates ongoing expenses based on one-time income.",
      resourcesNeeded: [
        "High-yield savings account",
        "List of financial priorities",
        "Tax professional (for larger windfalls)",
        "Investment options appropriate for your goals",
      ],
    },
  ],
  marketConditions: [
    {
      title: "Market Downturn/Recession",
      type: "negative",
      description:
        "Economic contractions and market downturns can be frightening but are normal parts of economic cycles.",
      whatToDo: [
        "Maintain or increase retirement contributions if possible to buy at lower prices",
        "Ensure your emergency fund is adequate (6+ months of expenses)",
        "Review your asset allocation to confirm it matches your risk tolerance",
        "Look for tax-loss harvesting opportunities in taxable accounts",
        "Stay invested according to your long-term plan",
      ],
      whatToAvoid: [
        "Panic selling investments at market lows",
        "Making major financial decisions based on fear",
        "Taking on new debt or major financial commitments",
        "Trying to time the market bottom",
        "Checking your investment accounts too frequently",
      ],
      historicalPerspective:
        "Every market downturn in history has eventually been followed by recovery and new highs. The S&P 500 has delivered positive returns in about 75% of calendar years despite regular corrections and bear markets.",
    },
    {
      title: "High Inflation Period",
      type: "negative",
      description: "Periods of high inflation erode purchasing power and require adjustments to financial strategies.",
      whatToDo: [
        "Review and adjust your budget for higher prices in essential categories",
        "Consider inflation-protected investments like TIPS or I-Bonds",
        "Maintain exposure to equities, which historically outpace inflation long-term",
        "Look for opportunities to lock in fixed-rate loans before rates rise further",
        "Negotiate for salary increases that at least match inflation",
      ],
      whatToAvoid: [
        "Holding too much cash for long periods",
        "Fixed-rate long-term bonds without inflation protection",
        "Delaying major necessary purchases that will likely cost more later",
        "Assuming inflation is temporary without making adjustments",
        "Panic buying or stockpiling unnecessary items",
      ],
      historicalPerspective:
        "The high inflation of the 1970s and early 1980s eventually subsided due to monetary policy changes. Stocks initially struggled but provided positive real returns over the full period, while cash and bonds often delivered negative real returns.",
    },
    {
      title: "Rising Interest Rate Environment",
      type: "negative",
      description:
        "When interest rates rise, borrowing becomes more expensive, but saving and certain investments may benefit.",
      whatToDo: [
        "Pay down variable-rate debt like credit cards and adjustable-rate mortgages",
        "Consider refinancing variable-rate loans to fixed-rate options",
        "Take advantage of higher yields on savings accounts and CDs",
        "Consider shorter-duration bonds or bond funds to reduce interest rate risk",
        "Be cautious about taking on new long-term debt",
      ],
      whatToAvoid: [
        "Taking on new variable-rate debt",
        "Investing heavily in long-duration bonds",
        "Assuming housing prices will continue rising at the same pace",
        "Making large purchases with financing without shopping for the best rates",
        "Ignoring the improved yields available on cash and short-term investments",
      ],
      historicalPerspective:
        "Rising rate environments have historically created short-term challenges for both stocks and bonds but eventually lead to healthier markets with more normal valuations and better future returns.",
    },
    {
      title: "Bull Market/Economic Expansion",
      type: "positive",
      description:
        "Strong markets and economic growth provide opportunities but can also lead to overconfidence and excessive risk-taking.",
      whatToDo: [
        "Maintain your regular investment plan and asset allocation",
        "Rebalance portfolios that have become overweight in equities",
        "Pay down debt while income is strong",
        "Build emergency savings during good times",
        "Consider taking some profits from significantly appreciated assets",
      ],
      whatToAvoid: [
        "Becoming overconfident and taking excessive investment risks",
        "Abandoning diversification to chase the highest-performing sectors",
        "Increasing lifestyle spending to unsustainable levels",
        "Assuming the good times will continue indefinitely",
        "Making major financial decisions based on FOMO (fear of missing out)",
      ],
      historicalPerspective:
        "Bull markets typically last longer than bear markets but eventually end. The average bull market has lasted about 5-6 years, though some have continued much longer. Maintaining discipline during good times prepares you for inevitable market cycles.",
    },
  ],
}

