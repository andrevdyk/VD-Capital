import React, { useState } from 'react';
import { LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, AreaChart, Area, Brush } from 'recharts';
import './COTCharts.css'

interface LineChartProps {
  data: any[]; 
}

interface LegendVisibilityState {
  'Open Interest': boolean;
  'Dealer Longs': boolean;
  'Dealer Shorts': boolean;
  'Asset Manager Longs': boolean;
  'Asset Manager Shorts': boolean;
  'Leveraged Funds Longs': boolean;
  'Leveraged Funds Shorts': boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedDate = new Date(label).toLocaleDateString();

    return (
      <div className="custom-tooltip">
        <p className="label">{`Date: ${formattedDate}`}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} className="data">
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};



const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const formattedData = data.map((entry) => ({
    ...entry,
    Date: new Date(entry.Date),
  }));

  const [legendVisibility, setLegendVisibility] = useState({
    'Open Interest': true,
    'Dealer Longs': true,
    'Dealer Shorts': true,
    'Asset Manager Longs' : true,
    'Asset Manager Shorts' : true,
    'Leveraged Funds Longs' : true,
    'Leveraged Funds Shorts' : true,
  });

  const toggleVisibility = (category: keyof LegendVisibilityState) => {
    setLegendVisibility((prevVisibility) => ({
      ...prevVisibility,
      [category]: !prevVisibility[category],
    }));
  };

  const maxOpenInterest = Math.max(...data.map((entry) => entry['Open Interest']));
  const yAxisDomain = [0, maxOpenInterest * 1.05];
  const reversedData = [...data].reverse();

  const getColor = (key: string) => {
    const colorMap: Record<string, string> = {
      'Open Interest': '#7d12ff',
      'Dealer Longs': '#80FFCC',
      'Dealer Shorts': '#EA00FF',
      'Asset Manager Longs': '#80FFCC',
      'Asset Manager Shorts': '#EA00FF',
      'Leveraged Funds Longs': '#80FFCC',
      'Leveraged Funds Shorts': '#EA00FF',
    };

    return colorMap[key] || 'black'; // Default color is black
  };

  const getFill = (key: string) => {
    const fillMap: Record<string, string> = {
      'Open Interest': 'rgba(125,18,255, 0.25)',
      'Dealer Longs': 'rgba(128, 255, 204, 0.25)',
      'Dealer Shorts': 'rgba(234, 0, 255, 0.25)',
      'Asset Manager Longs': 'rgba(128, 255, 204, 0.25)',
      'Asset Manager Shorts': 'rgba(234, 0, 255, 0.25)',
      'Leveraged Funds Longs': 'rgba(128, 255, 204, 0.25)',
      'Leveraged Funds Shorts': 'rgba(234, 0, 255, 0.25)',
    };

    return fillMap[key] || 'rgba(0, 0, 0, 0)'; // Default fill is transparent
  };

  return (
    <AreaChart width={720} height={350} data={data}>
      <CartesianGrid strokeDasharray="0 1" />
      <XAxis
        dataKey="Date"
        tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
        tick={{ fontSize: 10 }}
        reversed={true}
      />
      <YAxis domain={yAxisDomain} tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}  />
      <Tooltip content={<CustomTooltip />} wrapperStyle={{ fontSize: '12px' }} />
      <Legend
        iconSize={10}
        wrapperStyle={{ fontSize: '12px' }}
        onClick={(e) => toggleVisibility(e.dataKey as string)}
        formatter={(value, entry) => (
          <span style={{ color: legendVisibility[entry.dataKey] ? 'white' : 'grey' }}>
            {value}
          </span>
        )}
      />
      <Brush
        dataKey="Date"
        height={20}
        stroke="#7d12ff"
        fill="black"
        tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
      />
      {Object.entries(legendVisibility).map(([key, isVisible]) => (
        <Area
          key={key}
          type="monotone"
          dataKey={key}
          stroke={getColor(key)}
          fill={getFill(key)}
          legendType="line"
          hide={!isVisible}
        />
      ))}
    </AreaChart>
  );
};

export default LineChart;