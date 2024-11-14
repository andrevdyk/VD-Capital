import React from 'react'
import TabsNavbar from './_components/tabs-navbar'
import MarketTrendsAllTable from './_components/all-table'
import RealtimeChart from './_components/adx-chart'


export default function TrendsPage() {
    return(
        <div className='gap-2'>
        <div className='absolute top-[5px] left-1/2 transform -translate-x-1/2 z-10'>
            <TabsNavbar/>
        </div>
        <div className='flex grid-cols-2  px-4 pt-4 gap-4 grid-rows-2'>
            <MarketTrendsAllTable/>
                <div className='grid grid-rows-2 grid-flow-col gap-2'>
                    <RealtimeChart/>
                    
                </div>
        </div>
        </div>
    )
}

