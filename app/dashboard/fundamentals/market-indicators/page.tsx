'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import * as flags from 'country-flag-icons/react/3x2';

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

type SortField = keyof EconomicsMatrixRow | null;
type SortDirection = 'asc' | 'desc' | null;

export default function EconomicsMatrix() {
  const [data, setData] = useState<EconomicsMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('gdp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const getCountryFlag = (countryName: string): React.ReactElement | null => {
    const countryCodeMap: { [key: string]: string } = {
      'United States': 'US',
      'China': 'CN',
      'Germany': 'DE',
      'Japan': 'JP',
      'India': 'IN',
      'United Kingdom': 'GB',
      'France': 'FR',
      'Italy': 'IT',
      'Brazil': 'BR',
      'Canada': 'CA',
      'Russia': 'RU',
      'South Korea': 'KR',
      'Australia': 'AU',
      'Spain': 'ES',
      'Mexico': 'MX',
      'Indonesia': 'ID',
      'Netherlands': 'NL',
      'Saudi Arabia': 'SA',
      'Turkey': 'TR',
      'Switzerland': 'CH',
      'Poland': 'PL',
      'Belgium': 'BE',
      'Argentina': 'AR',
      'Sweden': 'SE',
      'Ireland': 'IE',
      'Austria': 'AT',
      'Norway': 'NO',
      'Israel': 'IL',
      'United Arab Emirates': 'AE',
      'Singapore': 'SG',
      'Denmark': 'DK',
      'Philippines': 'PH',
      'Bangladesh': 'BD',
      'Vietnam': 'VN',
      'Hong Kong': 'HK',
      'Malaysia': 'MY',
      'South Africa': 'ZA',
      'Egypt': 'EG',
      'Thailand': 'TH',
      'Pakistan': 'PK',
      'Chile': 'CL',
      'Finland': 'FI',
      'Portugal': 'PT',
      'Czech Republic': 'CZ',
      'Romania': 'RO',
      'New Zealand': 'NZ',
      'Greece': 'GR',
      'Iraq': 'IQ',
      'Algeria': 'DZ',
      'Qatar': 'QA',
      'Kazakhstan': 'KZ',
      'Hungary': 'HU',
      'Kuwait': 'KW',
      'Morocco': 'MA',
      'Ukraine': 'UA',
      'Slovakia': 'SK',
      'Ecuador': 'EC',
      'Ethiopia': 'ET',
      'Puerto Rico': 'PR',
      'Kenya': 'KE',
      'Dominican Republic': 'DO',
      'Angola': 'AO',
      'Oman': 'OM',
      'Guatemala': 'GT',
      'Bulgaria': 'BG',
      'Luxembourg': 'LU',
      'Panama': 'PA',
      'Croatia': 'HR',
      'Ghana': 'GH',
      'Tanzania': 'TZ',
      'Serbia': 'RS',
      'Belarus': 'BY',
      'Costa Rica': 'CR',
      'Uruguay': 'UY',
      'Lebanon': 'LB',
      'Slovenia': 'SI',
      'Lithuania': 'LT',
      'Uzbekistan': 'UZ',
      'Turkmenistan': 'TM',
      'DR Congo': 'CD',
      'Ivory Coast': 'CI',
      'Jordan': 'JO',
      'Bolivia': 'BO',
      'Cameroon': 'CM',
      'Latvia': 'LV',
      'Paraguay': 'PY',
      'Uganda': 'UG',
      'Libya': 'LY',
      'Nepal': 'NP',
      'Estonia': 'EE',
      'El Salvador': 'SV',
      'Cambodia': 'KH',
      'Honduras': 'HN',
      'Senegal': 'SN',
      'Trinidad and Tobago': 'TT',
      'Cyprus': 'CY',
      'Zimbabwe': 'ZW',
      'Iceland': 'IS',
      'Georgia': 'GE',
      'Bosnia': 'BA',
      'Papua New Guinea': 'PG',
      'Zambia': 'ZM',
      'Albania': 'AL',
      'Mali': 'ML',
      'Mozambique': 'MZ',
      'Botswana': 'BW',
      'Gabon': 'GA',
      'Guinea': 'GN',
      'Jamaica': 'JM',
      'Armenia': 'AM',
      'Malta': 'MT',
      'Burkina Faso': 'BF',
      'Mongolia': 'MN',
      'Mauritius': 'MU',
      'Namibia': 'NA',
      'Benin': 'BJ',
      'Macedonia': 'MK',
      'Nicaragua': 'NI',
      'Madagascar': 'MG',
      'Moldova': 'MD',
      'Congo': 'CG',
      'Equatorial Guinea': 'GQ',
      'Chad': 'TD',
      'Bahamas': 'BS',
      'Rwanda': 'RW',
      'Niger': 'NE',
      'Kosovo': 'XK',
      'Malawi': 'MW',
      'Mauritania': 'MR',
      'Tajikistan': 'TJ',
      'Kyrgyzstan': 'KG',
      'Togo': 'TG',
      'Montenegro': 'ME',
      'Maldives': 'MV',
      'Barbados': 'BB',
      'Sierra Leone': 'SL',
      'Fiji': 'FJ',
      'Eswatini': 'SZ',
      'Liberia': 'LR',
      'Suriname': 'SR',
      'Djibouti': 'DJ',
      'Aruba': 'AW',
      'Burundi': 'BI',
      'Bhutan': 'BT',
      'Central African Republic': 'CF',
      'Belize': 'BZ',
      'Lesotho': 'LS',
      'Timor-Leste': 'TL',
      'Gambia': 'GM',
      'Guinea-Bissau': 'GW',
      'Somalia': 'SO',
      'Comoros': 'KM',
    };
    
    const code = countryCodeMap[countryName];
    if (!code) return null;
    
    const FlagComponent = (flags as any)[code];
    if (!FlagComponent) return null;
    
    return <FlagComponent className="w-6 h-4 inline-block" />;
  };

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

  const getInflationColor = (value: number | null): string => {
    if (value === null || value === undefined) return 'text-gray-500';
    if (value >= 2 && value <= 4) return 'text-[#03b198]';
    if (value > 4) return 'text-[#ff2f67]';
    return 'text-orange-500';
  };

  const getUnemploymentColor = (value: number | null): string => {
    if (value === null || value === undefined) return 'text-gray-500';
    if (value >= 0 && value <= 8) return 'text-[#03b198]';
    if (value > 20) return 'text-[#ff2f67]';
    return 'text-orange-500';
  };

  const handleSort = (field: keyof EconomicsMatrixRow) => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof EconomicsMatrixRow) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-4 h-4" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4" />;
    }
    return <ArrowUpDown className="w-4 h-4 opacity-40" />;
  };

  const sortedData = React.useMemo(() => {
    if (!sortField || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [data, sortField, sortDirection]);

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
    <div className="min-h-screen p-6">
      <div className="pl-4">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Global Economics Matrix</CardTitle>
            <CardDescription className="text-muted-foreground">
              Key economic indicators by country
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto h-[74vh]">
              <table className="w-full overflow-y-scroll">
                <thead className='sticky top-0 z-12 bg-background'>
                  <tr className="border-b">
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-left font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('country')}
                    >
                      <div className="flex items-center gap-2">
                        Country
                        {getSortIcon('country')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('gdp')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        GDP ($B)
                        {getSortIcon('gdp')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('gdp_growth')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        GDP Growth (%)
                        {getSortIcon('gdp_growth')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('interest_rate')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Interest Rate (%)
                        {getSortIcon('interest_rate')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('inflation_rate')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Inflation (%)
                        {getSortIcon('inflation_rate')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('jobless_rate')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Unemployment (%)
                        {getSortIcon('jobless_rate')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('gov_budget')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Gov. Budget (%)
                        {getSortIcon('gov_budget')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('debt_gdp')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Debt/GDP (%)
                        {getSortIcon('debt_gdp')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('current_account')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Current Acct (%)
                        {getSortIcon('current_account')}
                      </div>
                    </th>
                    <th 
                      className="text-nowrap text-sm px-4 py-3 text-right font-bold text-foreground cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('population')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Population (M)
                        {getSortIcon('population')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row) => (
                    <tr 
                      key={row.id} 
                      className="border-b hover:bg-muted transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold bg-background text-nowrap">
                        <span className="mr-2 inline-flex items-center">{getCountryFlag(row.country)}</span>
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
                      <td className={`px-4 py-3 text-right font-mono ${getInflationColor(row.inflation_rate)}`}>
                        {formatNumber(row.inflation_rate)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${getUnemploymentColor(row.jobless_rate)}`}>
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
                      <td className="px-4 py-3 text-right font-mono">
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