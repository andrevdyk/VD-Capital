"use client";

import React, { useEffect } from 'react';

const MarketDataWidget: React.FC = () => {
  useEffect(() => {
    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.innerHTML = JSON.stringify({
      width: "550",
      height: "300",
      symbolsGroups: [
        {
          name: "Indices",
          originalName: "Indices",
          symbols: [
            { name: "FOREXCOM:SPXUSD", displayName: "S&P 500 Index" },
            { name: "FOREXCOM:NSXUSD", displayName: "US 100 Cash CFD" },
            { name: "FOREXCOM:DJI", displayName: "Dow Jones Industrial Average Index" },
            { name: "INDEX:NKY", displayName: "Nikkei 225" },
            { name: "INDEX:DEU40", displayName: "DAX Index" },
            { name: "FOREXCOM:UKXGBP", displayName: "FTSE 100 Index" }
          ]
        },
        {
          name: "Futures",
          originalName: "Futures",
          symbols: [
            { name: "CME_MINI:ES1!", displayName: "S&P 500" },
            { name: "CME:6E1!", displayName: "Euro" },
            { name: "COMEX:GC1!", displayName: "Gold" },
            { name: "NYMEX:CL1!", displayName: "WTI Crude Oil" },
            { name: "NYMEX:NG1!", displayName: "Gas" },
            { name: "CBOT:ZC1!", displayName: "Corn" }
          ]
        },
        {
          name: "Bonds",
          originalName: "Bonds",
          symbols: [
            { name: "CBOT:ZB1!", displayName: "T-Bond" },
            { name: "CBOT:UB1!", displayName: "Ultra T-Bond" },
            { name: "EUREX:FGBL1!", displayName: "Euro Bund" },
            { name: "EUREX:FBTP1!", displayName: "Euro BTP" },
            { name: "EUREX:FGBM1!", displayName: "Euro BOBL" }
          ]
        },
        {
          name: "Forex",
          originalName: "Forex",
          symbols: [
            { name: "FX:EURUSD", displayName: "EUR to USD" },
            { name: "FX:GBPUSD", displayName: "GBP to USD" },
            { name: "FX:USDJPY", displayName: "USD to JPY" },
            { name: "FX:USDCHF", displayName: "USD to CHF" },
            { name: "FX:AUDUSD", displayName: "AUD to USD" },
            { name: "FX:USDCAD", displayName: "USD to CAD" }
          ]
        },
        {
          name: "Cryptocurrencies",
          symbols: [
            { name: "BINANCE:BTCUSDT.P", displayName: "Bitcoin" },
            { name: "COINBASE:ETHUSD", displayName: "Ethereum" },
            { name: "BINANCE:XRPUSD", displayName: "XRP" },
            { name: "COINBASE:SOLUSD", displayName: "Solana" },
            { name: "BINANCE:BTCUSDT", displayName: "Tetherus" }
          ]
        }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: "dark",
      locale: "en"
    });

    // Append the script to the container
    const container = document.getElementById('tradingview-widget');
    container?.appendChild(script);

    // Clean up the script on unmount
    return () => {
      container?.removeChild(script);
    };
  }, []);

  return (
    <div className="tradingview-widget-container flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row bg-black">
      <div id="tradingview-widget" className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default MarketDataWidget;
