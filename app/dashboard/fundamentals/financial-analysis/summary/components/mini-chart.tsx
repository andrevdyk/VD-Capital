"use client";

import React, { useEffect, useRef } from "react";

export default function MiniChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          [
            "Apple",
            "AAPL|1D"
          ]
        ],
        "chartOnly": false,
        "isTransparent": true,
        "width": "98%",
        "height": "110%",
        "locale": "en",
        "colorTheme": "dark",
        "backgroundColor": "blue",
        "autosize": true,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": true,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "fontSize": "8",
        "noTimeScale": false,
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "chartType": "area",
        "maLineColor": "#2962FF",
        "maLineWidth": 1,
        "maLength": 9,
        "headerFontSize": "small",
        "lineWidth": 2,
        "lineType": 0,
        "dateRanges": [
          "1d|1",
          "1m|30",
          "3m|60",
          "12m|1D",
          "60m|1W",
          "all|1M"
        ]
      }`;

    // Avoid duplicate script injections
    if (containerRef.current.querySelector("script")) return;

    containerRef.current.appendChild(script);
    
    if (containerRef.current) {
        const widgetContainer = containerRef.current.querySelector(".tv-widget-chart");
        if (widgetContainer) {
          widgetContainer.style.backgroundColor = "transparent"; // Set background to transparent
          widgetContainer.style.border = "none";  // Optional: remove border
          widgetContainer.style.boxShadow = "none"; // Optional: remove shadow
        }
      }
    }, []);
  

  return (
    <div className="tradingview-widget-container p-0 bg-transparent" ref={containerRef} >
      <div className="tradingview-widget-container__widget bg-transparent" style={{ backgroundColor: "transparent" }}></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
        </a>
      </div>
    </div>
  );
}
