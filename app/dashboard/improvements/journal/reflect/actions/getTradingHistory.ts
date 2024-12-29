'use server'

import { createClient } from "@/utils/supabase/server"

export async function getTradingHistory() {
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
      .select('*')
      .eq('user_id', userId)
      .order('placing_time', { ascending: false })

    if (error) {
      console.error('Error fetching trading history:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getTradingHistory:', error)
    throw new Error(`Failed to fetch trading history: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

