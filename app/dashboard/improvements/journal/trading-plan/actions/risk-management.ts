'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from 'next/cache'

export interface RiskStrategy {
  name: string;
  type: string;
  value: number;
  description: string;
  example: string;
  selected: boolean;
  additionalParams?: {
    [key: string]: number | string | boolean | { riskToReward: number; riskPercentage: number }[];
  };
}

export async function submitRiskPercentage(percentage: number): Promise<number> {
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
      .from('user_config')
      .update({ risk_percentage: percentage })
      .eq('user', userId)

    if (error) {
      console.error('Error updating risk percentage:', error)
      throw new Error(`Failed to update risk percentage: ${error.message}`)
    }

    revalidatePath('/dashboard/improvements/journal/trading-plan')
    return percentage
  } catch (error) {
    console.error('Unexpected error in submitRiskPercentage:', error)
    throw new Error(`Failed to submit risk percentage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getUserRiskPercentage(): Promise<number | null> {
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
      .select('risk_percentage')
      .eq('user', userId)
      .single()

    if (error) {
      console.error('Error fetching user risk percentage:', error)
      return null
    }

    return data?.risk_percentage ?? null
  } catch (error) {
    console.error('Unexpected error in getUserRiskPercentage:', error)
    throw new Error(`Failed to fetch user risk percentage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function submitRiskStrategy(strategies: RiskStrategy[]): Promise<RiskStrategy[]> {
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
      .update({ risk_strategy: JSON.stringify(strategies) })
      .eq('user', userId)
      .select()

    if (error) {
      console.error('Error updating risk strategies:', error)
      throw new Error(`Failed to update risk strategies: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update operation')
      throw new Error('Failed to update risk strategies: No data returned')
    }

    revalidatePath('/dashboard/improvements/journal/trading-plan')
    return strategies
  } catch (error) {
    console.error('Unexpected error in submitRiskStrategy:', error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Failed to submit risk strategies: Unknown error')
    }
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

    return data?.risk_strategy ? JSON.parse(data.risk_strategy) : null
  } catch (error) {
    console.error('Unexpected error in getUserRiskStrategy:', error)
    throw new Error(`Failed to fetch user risk strategies: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

