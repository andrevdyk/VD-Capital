'use server'

import { createClient } from "@/utils/supabase/server"
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function saveSetup(setupData: {
  id?: string;
  setup_name: string;
  setup_description: string;
  tags: string[];
}) {
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

    let updateResult
    if (setupData.id) {
      // Update existing setup
      updateResult = await supabase
        .from('user_setups')
        .update({
          setup_name: setupData.setup_name,
          setup_description: setupData.setup_description,
          tags: setupData.tags,
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
          tags: setupData.tags
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
      .select('id, setup_name, setup_description, tags, created_at')
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
      .select('*')
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

