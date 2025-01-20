import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const seriesData = useMemo(() => {
    return data.map(item => ({
      x: item.date,
      y: [item.open, item.high, item.low, item.close]
    }));
  }, [data]);

  const minValue = Math.min(...data.map(d => d.low));
  const maxValue = Math.max(...data.map(d => d.high));
  const yAxisMin = minValue - (minValue * 0.1);
  const yAxisMax = maxValue + (maxValue * 0.1);

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      animations: {
        enabled: false
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false
      }
    },
    yaxis: {
      opposite: true,
      min: yAxisMin,
      max: yAxisMax,
      labels: {
        formatter: (value) => value.toFixed(2)
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#03b198',
          downward: '#ff004d'
        }
      }
    },
    grid: {
      show: false
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        format: 'MMM dd HH:mm'
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Chart
        options={options}
        series={[{ data: seriesData }]}
        type="candlestick"
        height="100%"
      />
    </div>
  );
};

