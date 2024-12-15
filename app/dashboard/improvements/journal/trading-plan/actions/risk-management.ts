'use server'

import { createClient } from "@/utils/supabase/server"

interface RiskRewardRatio {
  riskToReward: number;
  riskPercentage: number;
}

interface RiskStrategy {
  name: string;
  type: string;
  value: number;
  description: string;
  example: string;
  selected: boolean;
  additionalParams?: {
    [key: string]: number | string | boolean | RiskRewardRatio[];
  };
}

export async function submitRiskStrategy(strategies: RiskStrategy[]) {
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

    const strategiesWithSelected = strategies.map(strategy => ({
      ...strategy,
      selected: Boolean(strategy.selected)
    })) as RiskStrategy[];

    const { data, error } = await supabase
      .from('user_config')
      .update({ risk_strategy: strategiesWithSelected })
      .eq('user', userId)

    if (error) {
      console.error('Error updating risk strategies:', error)
      throw new Error(`Failed to update risk strategies: ${error.message}`)
    }

    return strategies
  } catch (error) {
    console.error('Unexpected error in submitRiskStrategy:', error)
    throw new Error(`Failed to submit risk strategies: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getUserRiskStrategy(): Promise<RiskStrategy[] | null> {
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
      .select('risk_strategy')
      .eq('user', userId)
      .single()

    if (error) {
      console.error('Error fetching user risk strategies:', error)
      return null
    }

    return data?.risk_strategy.map((strategy: RiskStrategy) => ({
      ...strategy,
      selected: Boolean(strategy.selected)
    })) as RiskStrategy[] | null;
  } catch (error) {
    console.error('Unexpected error in getUserRiskStrategy:', error)
    throw new Error(`Failed to fetch user risk strategies: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

