'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function deleteTrade(tradeId: string) {
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

    const { error } = await supabase
      .from('trading_history')
      .delete()
      .eq('id', tradeId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting trade:', error)
      throw new Error(`Failed to delete trade: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteTrade:', error)
    throw new Error(`Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

