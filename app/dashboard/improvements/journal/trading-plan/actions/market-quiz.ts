'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function submitMarketQuiz({ selectedMarkets, timezone }: { selectedMarkets: string[], timezone: string }) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error(`User authentication failed: ${userError.message}`)
    }

    if (!userData?.user) {
      throw new Error('User data not found')
    }

    const userId = userData.user.id

    // Check if a user_config entry exists for the user
    const { data: existingConfig, error: fetchError } = await supabase
      .from('user_config')
      .select('id')
      .eq('user', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user config:', fetchError)
      throw new Error(`Failed to fetch user config: ${fetchError.message}`)
    }

    let updateResult
    if (existingConfig) {
      // Update existing user_config entry
      updateResult = await supabase
        .from('user_config')
        .update({ markets: selectedMarkets, timezone: timezone })
        .eq('user', userId)
    } else {
      // Insert new user_config entry
      updateResult = await supabase
        .from('user_config')
        .insert({ user: userId, markets: selectedMarkets, timezone: timezone })
    }

    if (updateResult.error) {
      console.error('Error updating user markets and timezone:', updateResult.error)
      throw new Error(`Failed to update user markets and timezone: ${updateResult.error.message}`)
    }

    return { markets: selectedMarkets, timezone }
  } catch (error) {
    console.error('Unexpected error in submitMarketQuiz:', error)
    throw new Error(`Failed to process market quiz submission: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getUserMarkets() {
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
      .from('user_config')
      .select('markets, timezone')
      .eq('user', userId)
      .single()

    if (error) {
      console.error('Error fetching user markets and timezone:', error)
      return null
    }

    return { markets: data?.markets || null, timezone: data?.timezone || null }
  } catch (error) {
    console.error('Unexpected error in getUserMarkets:', error)
    throw new Error(`Failed to fetch user markets and timezone: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

