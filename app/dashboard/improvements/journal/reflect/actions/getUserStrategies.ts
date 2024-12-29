'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function getUserStrategies() {
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
      .from('user_strategies')
      .select('strategy_id, strategy_name')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user strategies:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getUserStrategies:', error)
    throw new Error(`Failed to fetch user strategies: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

