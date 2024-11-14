"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi } from "lightweight-charts";
import {
    Card,
    CardContent,
    CardHeader,
  } from "@/components/ui/card";
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from 'lucide-react';

const RealtimeChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);

  const randomFactor = 25 + Math.random() * 25;
  const samplePoint = (i: number) =>
    i *
      (0.5 +
        Math.sin(i / 1) * 0.2 +
        Math.sin(i / 2) * 0.4 +
        Math.sin(i / randomFactor) * 0.8 +
        Math.sin(i / 50) * 0.5) +
    200 +
    i * 2;

  const generateData = (numberOfCandles = 500, updatesPerCandle = 5, startAt = 100) => {
    const createCandle = (val: number, time: number) => ({ time, open: val, high: val, low: val, close: val });
    const updateCandle = (candle: any, val: number) => ({
      ...candle,
      close: val,
      low: Math.min(candle.low, val),
      high: Math.max(candle.high, val),
    });

    const date = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));
    const numberOfPoints = numberOfCandles * updatesPerCandle;
    const initialData = [];
    const realtimeUpdates = [];
    let lastCandle;
    let previousValue = samplePoint(-1);

    for (let i = 0; i < numberOfPoints; ++i) {
      if (i % updatesPerCandle === 0) date.setUTCDate(date.getUTCDate() + 1);
      const time = date.getTime() / 1000;
      let value = samplePoint(i);
      const diff = (value - previousValue) * Math.random();
      value = previousValue + diff;
      previousValue = value;

      if (i % updatesPerCandle === 0) {
        const candle = createCandle(value, time);
        lastCandle = candle;
        if (i >= startAt) realtimeUpdates.push(candle);
      } else {
        const newCandle = updateCandle(lastCandle, value);
        lastCandle = newCandle;
        if (i >= startAt) realtimeUpdates.push(newCandle);
        else if ((i + 1) % updatesPerCandle === 0) initialData.push(newCandle);
      }
    }

    return { initialData, realtimeUpdates };
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const newChart = createChart(container, {
      layout: { textColor: "gray", background: { color: 'transparent' }, },
      grid: {
        vertLines: { color: 'transparent' },
        horzLines: { color: 'transparent' },
      }
    });

    setChart(newChart);

    const series = newChart.addCandlestickSeries({
      upColor: "#03b198",
      downColor: "#ff2f67",
      borderVisible: true,
      wickUpColor: "#03b198",
      wickDownColor: "#ff2f67",
    });

    const data = generateData(2500, 20, 1000);
    series.setData(data.initialData);
    newChart.timeScale().fitContent();
    newChart.timeScale().applyOptions({
      borderColor: 'gray',
    });
    newChart.timeScale().scrollToPosition(5, false);
    series.priceScale().applyOptions({
      autoScale: false,
      borderColor: 'gray',
      scaleMargins: {
        top: 0.1,
        bottom: 0,
      },
    });

    const toolTip = document.createElement('div');
    toolTip.style.background = 'white';
    toolTip.style.borderColor = 'rgba(38, 166, 154, 1)';
    toolTip.style.position = 'absolute';
    toolTip.style.display = 'none';
    toolTip.style.padding = '8px';
    toolTip.style.boxSizing = 'border-box';
    toolTip.style.fontSize = '12px';
    toolTip.style.textAlign = 'left';
    toolTip.style.zIndex = '1000';
    toolTip.style.top = '12px';
    toolTip.style.left = '12px';
    toolTip.style.pointerEvents = 'none';
    toolTip.style.borderRadius = '8px';
    toolTip.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";
    container.appendChild(toolTip);

    const streamingDataProvider = (function* () {
      for (const dataPoint of data.realtimeUpdates) yield dataPoint;
    })();

    const intervalID = setInterval(() => {
      const update = streamingDataProvider.next();
      if (update.done) {
        clearInterval(intervalID);
        return;
      }
      series.update(update.value);
    }, 100);

    newChart.subscribeCrosshairMove(param => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        const dateObj = new Date((param.time as number) * 1000);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${
          (dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

        toolTip.style.display = 'block';
        const data = param.seriesData.get(series);

        if (data) {
          let price;
          if ('value' in data) price = data.value;
          else if ('close' in data) price = data.close;

          if (price !== undefined) {
            toolTip.innerHTML = `<div style="color: ${'rgba(0,0,0,1)'}">APPLE</div>
              <div style="font-size: 24px; margin: 4px 0px;">${Math.round(100 * price) / 100}</div>
              <div>${formattedDate}</div>`;

            if ('open' in data && 'close' in data) {
              const isBullish = data.close >= data.open;
              const candleColor = isBullish ? '#03b198' : '#ff2f67';

              toolTip.style.border = `1px solid ${candleColor}`;
              toolTip.style.color = candleColor;
            }

            const toolTipWidth = 80;
            const toolTipHeight = 80;
            const toolTipMargin = 15;
            const y = param.point.y;
            let left = param.point.x + toolTipMargin;
            if (left > container.clientWidth - toolTipWidth) {
              left = param.point.x - toolTipMargin - toolTipWidth;
            }
            let top = y + toolTipMargin;
            if (top > container.clientHeight - toolTipHeight) {
              top = y - toolTipHeight - toolTipMargin;
            }
            toolTip.style.left = left + 'px';
            toolTip.style.top = top + 'px';
          }
        }
      }
    });

    return () => {
      clearInterval(intervalID);
      newChart.remove();
    };
  }, []);

  return (
    <Card className="flex flex-col w-fit h-fit">
      <CardHeader className="flex items-center  space-y-0 border-b py-2 sm:flex-row ">
        <div className="grid flex-1 text-left text-sm align-middle">
          <span>ADX Trend Analysis
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger><Info className="h-4 w-4 ml-2 align-middle "/></TooltipTrigger>
                <TooltipContent>
                  <p>Used to gauge the strength of the current trend. See if a</p>
                  <p>bullish/bearish trend is strengthening or weakening,</p>
                  <p>helping anticipate potential reversals or trend continuations.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>   
        </div>
        
        <Button className=""
          variant="outline"
          onClick={() => chart && chart.timeScale().scrollToRealTime()} // Use `chart` state here
        >
          <ChevronRight />
        </Button>
      </CardHeader>
      <CardContent className=" w-fit">
      <div className="w-[400px]">
        <div ref={chartContainerRef} className="relative w-full h-[200px]"/>
      </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeChart;
