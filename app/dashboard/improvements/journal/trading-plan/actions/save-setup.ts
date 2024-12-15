'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function saveStrategy(strategyData: {
  strategy_id?: string;
  strategy_name: string;
  strategy_description: string;
}) {
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

    let updateResult
    if (strategyData.strategy_id) {
      // Update existing strategy
      updateResult = await supabase
        .from('user_strategies')
        .update({
          strategy_name: strategyData.strategy_name,
          strategy_description: strategyData.strategy_description,
          strategy_updated: new Date().toISOString()
        })
        .eq('strategy_id', strategyData.strategy_id)
        .eq('user_id', userId)
    } else {
      // Insert new strategy
      updateResult = await supabase
        .from('user_strategies')
        .insert({
          user_id: userId,
          strategy_name: strategyData.strategy_name,
          strategy_description: strategyData.strategy_description
        })
    }

    if (updateResult.error) {
      console.error('Error saving strategy:', updateResult.error)
      throw new Error(`Failed to save strategy: ${updateResult.error.message}`)
    }

    revalidatePath('/dashboard/improvements/journal/trading-plan')
    return { success: true, message: strategyData.strategy_id ? 'Strategy updated successfully' : 'Strategy saved successfully' }
  } catch (error) {
    console.error('Unexpected error in saveStrategy:', error)
    throw new Error(`Failed to save strategy: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getUserStrategies() {
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
      .select('strategy_id, strategy_name, strategy_description, strategy_created')
      .eq('user_id', userId)
      .order('strategy_created', { ascending: false })

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

export async function saveSetup(setupData: {
  id?: string;
  setup_name: string;
  setup_description: string;
  tags: string[];
  strategy_id: string;
}) {
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

    let updateResult
    if (setupData.id) {
      // Update existing setup
      updateResult = await supabase
        .from('user_setups')
        .update({
          setup_name: setupData.setup_name,
          setup_description: setupData.setup_description,
          tags: setupData.tags,
          strategy_id: setupData.strategy_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', setupData.id)
        .eq('user', userId)
    } else {
      // Insert new setup
      updateResult = await supabase
        .from('user_setups')
        .insert({
          user: userId,
          setup_name: setupData.setup_name,
          setup_description: setupData.setup_description,
          tags: setupData.tags,
          strategy_id: setupData.strategy_id
        })
    }

    if (updateResult.error) {
      console.error('Error saving setup:', updateResult.error)
      throw new Error(`Failed to save setup: ${updateResult.error.message}`)
    }

    revalidatePath('/dashboard/improvements/journal/trading-plan')
    return { success: true, message: setupData.id ? 'Setup updated successfully' : 'Setup saved successfully' }
  } catch (error) {
    console.error('Unexpected error in saveSetup:', error)
    throw new Error(`Failed to save setup: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getUserSetups() {
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
      .from('user_setups')
      .select(`
        id, 
        setup_name, 
        setup_description, 
        tags, 
        created_at,
        strategy_id,
        user_strategies (
          strategy_id,
          strategy_name,
          strategy_description
        )
      `)
      .eq('user', userId)
      .order('created_at', { ascending: false })

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

export async function deleteSetup(setupId: string) {
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
      .from('user_setups')
      .delete()
      .eq('id', setupId)
      .eq('user', userId)

    if (error) {
      console.error('Error deleting setup:', error)
      throw new Error(`Failed to delete setup: ${error.message}`)
    }

    revalidatePath('/dashboard/improvements/journal/trading-plan')
    return { success: true, message: 'Setup deleted successfully' }
  } catch (error) {
    console.error('Unexpected error in deleteSetup:', error)
    throw new Error(`Failed to delete setup: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getSetupById(setupId: string) {
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
      .from('user_setups')
      .select(`
        *,
        user_strategies (
          strategy_id,
          strategy_name,
          strategy_description
        )
      `)
      .eq('id', setupId)
      .eq('user', userId)
      .single()

    if (error) {
      console.error('Error fetching setup:', error)
      throw new Error(`Failed to fetch setup: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getSetupById:', error)
    throw new Error(`Failed to fetch setup: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

