// app/components/TradingViewWidget.tsx
'use client';

import React, { useEffect, useRef, memo } from 'react';

const TradingViewWidget: React.FC = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const scriptLoaded = useRef(false); // Track if the script has already been loaded

  useEffect(() => {
    // Ensure this runs only in the client and only once
    if (typeof window !== 'undefined' && !scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "FX:EURUSD",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "backgroundColor": "rgba(0, 0, 0, 0)",
          "gridColor": "rgba(0, 0, 0, 0.00)",
          "hide_top_toolbar": true,
          "withdateranges": true,
          "withdateranges": true,
          "range": "YTD",
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "details": true,
          "hotlist": true,
          "calendar": false,
          "studies": [
            "STD;Trend%1Strength%1Index"
          ],
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          "support_host": "https://www.tradingview.com"
        }`;

      if (container.current) {
        container.current.appendChild(script);
        scriptLoaded.current = true; // Mark the script as loaded
      }
    }
  }, []);

  return (
    <div className="tradingview-widget-container w-full h-full" ref={container}>
      <div className="tradingview-widget-container__widget w-full h-[calc(100%-32px)]"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
