import React from 'react'
import { CurrencyStrength } from '../_components/currencystrength'
import  SelectCurrency from '../_components/asset-selector'



export default function CurrenciesPage() {
  return (
      <div className='w-screen'>
        <div className='justify-center'>
          <SelectCurrency/>
        </div>
        <div className='flex flex-wrap gap-2 pt-4 pl-4'>
          <CurrencyStrength/>
        </div>
      </div>
        )
}