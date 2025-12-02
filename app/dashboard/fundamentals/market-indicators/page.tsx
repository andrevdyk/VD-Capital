'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EconomicsMatrixRow {
  id: number;
  country: string;
  gdp: number | null;
  gdp_growth: number | null;
  interest_rate: number | null;
  inflation_rate: number | null;
  jobless_rate: number | null;
  gov_budget: number | null;
  debt_gdp: number | null;
  current_account: number | null;
  population: number | null;
  scraped_at: string | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function EconomicsMatrix() {
  const [data, setData] = useState<EconomicsMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setError('Missing Supabase configuration');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/economics_matrix?select=*&order=gdp.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result: EconomicsMatrixRow[] = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getTrendIcon = (value: number | null): JSX.Element => {
    if (value === null || value === undefined) return <Minus className="w-4 h-4 text-gray-400" />;
    if (value > 0) return <TrendingUp className="w-4 h-4 text-[#03b198]" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-[#ff2f67]" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getValueColor = (value: number | null, isPositiveGood: boolean = true): string => {
    if (value === null || value === undefined) return 'text-gray-500';
    if (isPositiveGood) {
      return value > 0 ? 'text-[#03b198]' : value < 0 ? 'text-[#ff2f67]' : 'text-gray-700';
    } else {
      return value < 0 ? 'text-[#03b198]' : value > 0 ? 'text-[#ff2f67]' : 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading economic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-[#ff2f67]">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="pl-4">
        <Card className="shadow-xl">
          <CardHeader className="">
            <CardTitle className="text-3xl">Global Economics Matrix</CardTitle>
            <CardDescription className="text-muted-foreground">
              Key economic indicators by country
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto h-[74vh]">
              <table className="w-full overflow-y-scroll">
                <thead className='sticky top-0 z-12 bg-background'>
                  <tr className=" border-b">
                    <th className="text-nowrap text-sm px-4 py-3 text-left font-bold text-foreground">Country</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">GDP ($B)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">GDP Growth (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Interest Rate (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Inflation (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Unemployment (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Gov. Budget (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Debt/GDP (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Current Acct (%)</th>
                    <th className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground">Population (M)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className="border-b hover:bg-muted transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold bg-background text-nowrap">
                        {row.country}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(row.gdp)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getTrendIcon(row.gdp_growth)}
                          <span className={`font-mono ${getValueColor(row.gdp_growth)}`}>
                            {formatNumber(row.gdp_growth)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${getValueColor(row.interest_rate, false)}`}>
                        {formatNumber(row.interest_rate)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${getValueColor(row.inflation_rate, false)}`}>
                        {formatNumber(row.inflation_rate)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${getValueColor(row.jobless_rate, false)}`}>
                        {formatNumber(row.jobless_rate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getTrendIcon(row.gov_budget)}
                          <span className={`font-mono ${getValueColor(row.gov_budget)}`}>
                            {formatNumber(row.gov_budget)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${getValueColor(row.debt_gdp, false)}`}>
                        {formatNumber(row.debt_gdp)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getTrendIcon(row.current_account)}
                          <span className={`font-mono ${getValueColor(row.current_account)}`}>
                            {formatNumber(row.current_account)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono ">
                        {formatNumber(row.population)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {data[0]?.scraped_at ? new Date(data[0].scraped_at).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}