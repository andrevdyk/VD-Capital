'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

interface TradeData {
  id: string
  symbol: string
  side: string
  qty: number
  entry_price: number
  exit_price: number
  placing_time: string
  closing_time: string
  mistakes?: string
  strategy_id?: string
  setup_id?: string
}

export async function editTrade(tradeData: TradeData) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error(`User authentication failed: ${userError.message}`)
    }

    if (!userData?.user) {
      throw new Error('User data not found')
    }

    const userId = userData.user.id

    const { data, error } = await supabase
      .from('trading_history')
      .update({
        ...tradeData,
        net_profit: (tradeData.exit_price - tradeData.entry_price) * tradeData.qty
      })
      .eq('id', tradeData.id)
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('Error editing trade:', error)
      throw new Error(`Failed to edit trade: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Unexpected error in editTrade:', error)
    throw new Error(`Failed to edit trade: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

