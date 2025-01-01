'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function getStrategiesAndSetups() {
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

    const { data: strategies, error: strategiesError } = await supabase
      .from('user_strategies')
      .select('strategy_id, strategy_name')
      .eq('user_id', userId)

    if (strategiesError) {
      console.error('Error fetching user strategies:', strategiesError)
      throw new Error(`Failed to fetch user strategies: ${strategiesError.message}`)
    }

    const { data: setups, error: setupsError } = await supabase
      .from('user_setups')
      .select('id, setup_name, strategy_id')

    if (setupsError) {
      console.error('Error fetching user setups:', setupsError)
      throw new Error(`Failed to fetch user setups: ${setupsError.message}`)
    }

    return { strategies, setups }
  } catch (error) {
    console.error('Unexpected error in getStrategiesAndSetups:', error)
    throw new Error(`Failed to fetch strategies and setups: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

