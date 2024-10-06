import React from 'react'
import { CurrencyStrength } from '../_components/currencystrength'
import { SelectCurrency } from '../_components/asset-selector'
import { Seasonality } from '../_components/seasonality_currencies'
import { CFTCChart } from '../_components/cftc-area-chart'

export default function CurrenciesPage() {
  return (
      <div className='w-screen'>
        <div className='justify-center'>
          <SelectCurrency/>
        </div>
        <div className='flex flex-wrap gap-2 pt-4 pl-4'>
          <CurrencyStrength/>
          <Seasonality/>
          <CFTCChart/>
        </div>
      </div>
        )
}