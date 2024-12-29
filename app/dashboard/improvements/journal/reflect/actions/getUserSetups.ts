'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function getUserSetups(strategyId: string) {
  const cookieStore = cookies()
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_setups')
      .select('id, setup_name')
      .eq('strategy_id', strategyId)

    if (error) {
      console.error('Error fetching user setups:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getUserSetups:', error)
    throw new Error(`Failed to fetch user setups: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

