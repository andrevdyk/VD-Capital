"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { nanoid } from "nanoid"

interface TradeData {
  symbol: string
  side: string
  qty: number
  entry_price: number
  exit_price?: number
  placing_time: string
  closing_time?: string
  mistakes?: string
  net_profit?: number
  broker?: string
  order_id?: string
  status?: string
  entry_type?: string
  exit_type?: string
}

const getStatusFromNetProfit = (netProfit: number): string => {
  if (netProfit > 0) {
    return "Win"
  } else if (netProfit < 0) {
    return "Loss"
  } else {
    return "Breakeven"
  }
}

export async function addTrade(tradeData: TradeData) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("Error fetching user:", userError)
      throw new Error(`User authentication failed: ${userError.message}`)
    }

    if (!userData?.user) {
      throw new Error("User data not found")
    }

    const userId = userData.user.id

    // Check if this is an open trade (no exit price or closing time)
    const isOpenTrade = !tradeData.exit_price || !tradeData.closing_time

    // Calculate net profit only for closed trades
    let netProfit = 0
    if (!isOpenTrade && tradeData.exit_price !== undefined) {
      netProfit =
        tradeData.side === "Sell"
          ? (Number(tradeData.entry_price) - Number(tradeData.exit_price)) * Number(tradeData.qty)
          : (Number(tradeData.exit_price) - Number(tradeData.entry_price)) * Number(tradeData.qty)
    }

    // Create base trade data
    const validatedTradeData = {
      symbol: tradeData.symbol.trim(),
      side: tradeData.side,
      qty: Number(tradeData.qty),
      entry_price: Number(tradeData.entry_price),
      placing_time: new Date(tradeData.placing_time).toISOString(),
      mistakes: tradeData.mistakes?.trim() || null,
      user_id: userId,
      broker: tradeData.broker || "N/A",
      order_id: tradeData.order_id || nanoid(10),
      entry_type: tradeData.entry_type || "Market",
    }

    // Add fields specific to trade status (open or closed)
    const finalTradeData = {
      ...validatedTradeData,
      exit_price: isOpenTrade ? null : Number(tradeData.exit_price),
      closing_time: isOpenTrade ? null : tradeData.closing_time ? new Date(tradeData.closing_time).toISOString() : null,
      net_profit: isOpenTrade ? 0 : netProfit,
      status: isOpenTrade ? "Open" : tradeData.status || getStatusFromNetProfit(netProfit),
      exit_type: isOpenTrade ? null : tradeData.exit_type || "Market",
    }

    const { data, error } = await supabase.from("trading_history").insert(finalTradeData).select()

    if (error) {
      console.error("Error adding trade:", error)
      throw new Error(`Failed to add trade: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Unexpected error in addTrade:", error)
    throw new Error(`Failed to add trade: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
