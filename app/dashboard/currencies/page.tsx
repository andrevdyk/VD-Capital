import React from 'react'
import { CurrencyStrength } from '../_components/currencystrength'
import { SelectCurrency } from '../_components/asset-selector'
import { Seasonality } from '../_components/seasonality_currencies'
import { CFTCChart } from '../_components/cftc-area-chart'
import { CurrencySelector } from '../_components/currency-selector'
import { BaseDealerDonut } from '../_components/base-dealer-donut'


export default function CurrenciesPage() {
  return (
      <div>
        <div className="absolute top-[5px] left-1/2 transform -translate-x-1/2  z-10">
          <CurrencySelector />
        </div>
        <div className='flex flex-wrap gap-2 pt-4 pl-4'>
          <CurrencyStrength/>
          <Seasonality/>
          <CFTCChart/>
          <BaseDealerDonut />
        </div>
      </div>
        )
}