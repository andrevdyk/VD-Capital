'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'

export async function submitQuiz(answers: Record<string, number>) {
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

    // Calculate scores
    const timeAvailability = (answers['0-0'] + answers['0-1']) / 2
    const workCommitments = (answers['1-0'] + answers['1-1']) / 2
    const riskTolerance = (answers['2-0'] + answers['2-1']) / 2
    const tradingKnowledge = (answers['3-0'] + answers['3-1']) / 2
    const tradingGoals = answers['4-0']
    const stressManagement = (answers['5-0'] + answers['5-1']) / 2

    // Determine trader type
    let traderType = ''
    if (timeAvailability <= 1 && stressManagement >= 2) {
      traderType = 'Scalper'
    } else if (timeAvailability >= 2 && workCommitments <= 1 && riskTolerance <= 1) {
      traderType = 'Day Trader'
    } else if (timeAvailability >= 1 && riskTolerance >= 2) {
      traderType = 'Swing Trader'
    } else {
      traderType = 'Position Trader/Investor'
    }

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
        .update({ trader_type: traderType })
        .eq('user', userId)
    } else {
      // Insert new user_config entry
      updateResult = await supabase
        .from('user_config')
        .insert({ user: userId, trader_type: traderType })
    }

    if (updateResult.error) {
      console.error('Error updating user trader type:', updateResult.error)
      throw new Error(`Failed to update user trader type: ${updateResult.error.message}`)
    }

    return traderType
  } catch (error) {
    console.error('Unexpected error in submitQuiz:', error)
    throw new Error(`Failed to process quiz submission: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getUserTraderType() {
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
      .select('trader_type')
      .eq('user', userId)
      .single()

    if (error) {
      console.error('Error fetching user trader type:', error)
      return null
    }

    return data?.trader_type || null
  } catch (error) {
    console.error('Unexpected error in getUserTraderType:', error)
    throw new Error(`Failed to fetch user trader type: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

