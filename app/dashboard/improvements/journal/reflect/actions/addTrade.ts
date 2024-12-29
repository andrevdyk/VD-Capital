'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

interface TradeData {
  symbol: string
  side: string
  qty: number
  entry_price: number
  exit_price: number
  placing_time: string
  closing_time: string
  mistakes?: string
  net_profit?: number
  broker?: string
  order_id?: string
  status?: string
  entry_type?: string
  exit_type?: string
}

function getStatusFromNetProfit(netProfit: number): string {
  if (netProfit > 0) return 'Win';
  if (netProfit < 0) return 'Loss';
  return 'Breakeven';
}

export async function addTrade(tradeData: TradeData) {
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

    // Calculate net profit
    const netProfit = tradeData.side === 'Sell'
      ? (Number(tradeData.entry_price) - Number(tradeData.exit_price)) * Number(tradeData.qty)
      : (Number(tradeData.exit_price) - Number(tradeData.entry_price)) * Number(tradeData.qty)

    // Validate and format the trade data
    const validatedTradeData = {
      symbol: tradeData.symbol.trim(),
      side: tradeData.side,
      qty: Number(tradeData.qty),
      entry_price: Number(tradeData.entry_price),
      exit_price: Number(tradeData.exit_price),
      placing_time: new Date(tradeData.placing_time).toISOString(),
      closing_time: new Date(tradeData.closing_time).toISOString(),
      mistakes: tradeData.mistakes?.trim() || null,
      user_id: userId,
      net_profit: netProfit,
      broker: tradeData.broker || 'N/A',
      order_id: tradeData.order_id || nanoid(10),
      status: tradeData.status || getStatusFromNetProfit(netProfit),
      entry_type: tradeData.entry_type || 'Market',
      exit_type: tradeData.exit_type || 'Market',
    }


    const { data, error } = await supabase
      .from('trading_history')
      .insert(validatedTradeData)
      .select()

    if (error) {
      console.error('Error adding trade:', error)
      throw new Error(`Failed to add trade: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Unexpected error in addTrade:', error)
    throw new Error(`Failed to add trade: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

